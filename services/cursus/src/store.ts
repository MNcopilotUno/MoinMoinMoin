import { createHash, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

/** §4 of docs/MOIN_DOMI.md — and nothing else. `.agents/features/cursus.md`. */
export const LIMITS = { maxHops: 100, lifeDays: 30, pendingMs: 10 * 60 * 1000, contentChars: 2800, wrapChars: 60 } as const;

const SCHEMA = `
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS chains (
    id TEXT PRIMARY KEY, maxStops INTEGER NOT NULL, maxBranches INTEGER NOT NULL,
    lastHopDay INTEGER NOT NULL, expiresDay INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS hops (
    id TEXT PRIMARY KEY, chainId TEXT NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
    parentId TEXT, depth INTEGER NOT NULL, day INTEGER NOT NULL, seq INTEGER,
    ciphertext TEXT NOT NULL, wrapKeyByT TEXT, wrapTByKey TEXT, pendingSince INTEGER);
  CREATE INDEX IF NOT EXISTS hops_chain ON hops(chainId);
  CREATE INDEX IF NOT EXISTS hops_parent ON hops(parentId);
  CREATE TABLE IF NOT EXISTS locks (
    name TEXT PRIMARY KEY, chainId TEXT NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
    hopId TEXT NOT NULL, salt TEXT NOT NULL, kdf TEXT NOT NULL, verifier TEXT NOT NULL, wrapped TEXT NOT NULL,
    failures INTEGER NOT NULL DEFAULT 0, waitUntil INTEGER NOT NULL DEFAULT 0);
  CREATE INDEX IF NOT EXISTS locks_chain ON locks(chainId);
`;

/** The slowdown after wrong passwords (password-links.md): 5 free, then 1, 2, 4 … minutes, ≤ 24 h. */
export const waitAfter = (failures: number): number => (failures < 5 ? 0 : Math.min(2 ** (failures - 5), 1440) * 60_000);

interface ChainRow { id: string; maxStops: number; maxBranches: number; lastHopDay: number; expiresDay: number }
interface LockRow { name: string; chainId: string; hopId: string; salt: string; kdf: string; verifier: string; wrapped: string; failures: number; waitUntil: number; expiresDay: number }
interface HopRow { id: string; chainId: string; parentId: string | null; depth: number; day: number; seq: number | null; ciphertext: string; wrapKeyByT: string | null; wrapTByKey: string | null; pendingSince: number | null }

export type Outcome<T> = { ok: true; value: T } | { ok: false; status: 404 | 409 | 422; error?: string };
const fail = <T>(status: 404 | 409 | 422, error?: string): Outcome<T> => (error ? { ok: false, status, error } : { ok: false, status });
const ok = <T>(value: T): Outcome<T> => ({ ok: true, value });

export const dayOf = (ms: number): number => Math.floor(ms / 86_400_000);

export function openStore(path: string) {
  const db = new DatabaseSync(path);
  db.exec(SCHEMA);
  const q = {
    chain: db.prepare('SELECT * FROM chains WHERE id = ?'),
    hop: db.prepare('SELECT * FROM hops WHERE id = ?'),
    idTaken: db.prepare('SELECT 1 FROM hops WHERE id = ? UNION ALL SELECT 1 FROM chains WHERE id = ?'),
    children: db.prepare('SELECT COUNT(*) AS n FROM hops WHERE parentId = ?'),
    hopCount: db.prepare('SELECT COUNT(*) AS n FROM hops WHERE chainId = ?'),
    nextSeq: db.prepare('SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM hops WHERE chainId = ?'),
    insertChain: db.prepare('INSERT INTO chains (id, maxStops, maxBranches, lastHopDay, expiresDay) VALUES (?, ?, ?, ?, ?)'),
    insertHop: db.prepare('INSERT INTO hops (id, chainId, parentId, depth, day, seq, ciphertext, wrapKeyByT, wrapTByKey, pendingSince) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'),
    complete: db.prepare('UPDATE hops SET wrapKeyByT = ?, wrapTByKey = ?, pendingSince = NULL, seq = ?, day = ? WHERE id = ? AND pendingSince IS NOT NULL'),
    touch: db.prepare('UPDATE chains SET lastHopDay = ?, expiresDay = ? WHERE id = ?'),
    tree: db.prepare('SELECT * FROM hops WHERE chainId = ? AND pendingSince IS NULL ORDER BY seq'),
    deleteChain: db.prepare('DELETE FROM chains WHERE id = ?'),
    lock: db.prepare('SELECT locks.*, chains.expiresDay FROM locks JOIN chains ON chains.id = locks.chainId WHERE locks.name = ?'),
    insertLock: db.prepare('INSERT INTO locks (name, chainId, hopId, salt, kdf, verifier, wrapped) VALUES (?, ?, ?, ?, ?, ?, ?)'),
    lockResult: db.prepare('UPDATE locks SET failures = ?, waitUntil = ? WHERE name = ?'),
    expired: db.prepare('DELETE FROM chains WHERE expiresDay < ?'),
    stale: db.prepare('DELETE FROM hops WHERE pendingSince IS NOT NULL AND pendingSince < ?'),
  };
  const tx = <T>(f: () => T): T => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const out = f();
      db.exec('COMMIT');
      return out;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  };
  const live = (chainId: string, today: number): ChainRow | undefined => {
    const c = q.chain.get(chainId) as ChainRow | undefined;
    return c && c.expiresDay >= today ? c : undefined;
  };
  const completeHop = (id: string, today: number) => {
    const h = q.hop.get(id) as HopRow | undefined;
    if (!h || h.pendingSince !== null) return undefined;
    const c = live(h.chainId, today);
    return c ? { h, c } : undefined;
  };
  const taken = (id: string) => q.idTaken.all(id, id).length > 0;

  return {
    db,
    createChain(input: { chainId: string; hopId: string; maxStops: number; maxBranches: number; content: string; wrapKeyByT: string; wrapTByKey: string }, now: number): Outcome<{ day: number }> {
      const day = dayOf(now);
      if (input.chainId === input.hopId) return fail(422, 'bad-request');
      return tx(() => {
        if (taken(input.chainId) || taken(input.hopId)) return fail(409);
        q.insertChain.run(input.chainId, input.maxStops, input.maxBranches, day, day + LIMITS.lifeDays);
        q.insertHop.run(input.hopId, input.chainId, null, 1, day, 1, input.content, input.wrapKeyByT, input.wrapTByKey, null);
        return ok({ day });
      });
    },
    getHop(id: string, now: number) {
      const found = completeHop(id, dayOf(now));
      if (!found) return fail(404);
      const { h, c } = found;
      const children = (q.children.get(id) as { n: number }).n;
      return ok({ hopId: h.id, chainId: h.chainId, parentId: h.parentId, depth: h.depth, maxStops: c.maxStops, maxBranches: c.maxBranches, children, day: h.day, expiresDay: c.expiresDay, content: h.ciphertext });
    },
    addHop(parentId: string, input: { hopId: string; content: string }, now: number): Outcome<{ wrapTByKey: string; day: number }> {
      return tx(() => {
        const found = completeHop(parentId, dayOf(now));
        if (!found) return fail(404);
        const { h, c } = found;
        if (h.depth >= c.maxStops) return fail(422, 'last-stop');
        if ((q.children.get(parentId) as { n: number }).n >= c.maxBranches) return fail(422, 'branches-full');
        if ((q.hopCount.get(c.id) as { n: number }).n >= LIMITS.maxHops) return fail(422, 'chain-full');
        if (taken(input.hopId)) return fail(409);
        q.insertHop.run(input.hopId, c.id, parentId, h.depth + 1, dayOf(now), null, input.content, null, null, now);
        return ok({ wrapTByKey: h.wrapTByKey!, day: dayOf(now) });
      });
    },
    completeHop(id: string, wraps: { wrapKeyByT: string; wrapTByKey: string }, now: number): Outcome<{ day: number }> {
      const day = dayOf(now);
      return tx(() => {
        const h = q.hop.get(id) as HopRow | undefined;
        if (!h || h.pendingSince === null || h.pendingSince < now - LIMITS.pendingMs || !live(h.chainId, day)) return fail(404);
        const seq = (q.nextSeq.get(h.chainId) as { n: number }).n;
        q.complete.run(wraps.wrapKeyByT, wraps.wrapTByKey, seq, day, id);
        q.touch.run(day, day + LIMITS.lifeDays, h.chainId);
        return ok({ day });
      });
    },
    getTree(chainId: string, now: number) {
      const c = live(chainId, dayOf(now));
      if (!c) return fail(404);
      const hops = (q.tree.all(chainId) as unknown as HopRow[]).map((h) => ({ hopId: h.id, parentId: h.parentId, depth: h.depth, day: h.day, seq: h.seq!, content: h.ciphertext, wrapKeyByT: h.wrapKeyByT! }));
      return ok({ chainId, maxStops: c.maxStops, maxBranches: c.maxBranches, expiresDay: c.expiresDay, hops });
    },
    /** Hourly: chains past their day, pending hops past ten minutes. */
    sweep(now: number): { chains: number; pending: number } {
      const chains = Number(q.expired.run(dayOf(now)).changes);
      const pending = Number(q.stale.run(now - LIMITS.pendingMs).changes);
      return { chains, pending };
    },
    createLock(input: { name: string; hopId: string; salt: string; kdf: string; verifier: string; wrapped: string }, now: number): Outcome<{ day: number }> {
      return tx(() => {
        const found = completeHop(input.hopId, dayOf(now));
        if (!found) return fail(404);
        if (q.lock.get(input.name)) return fail(409);
        q.insertLock.run(input.name, found.h.chainId, input.hopId, input.salt, input.kdf, input.verifier, input.wrapped);
        return ok({ day: dayOf(now) });
      });
    },
    getLock(name: string, now: number): Outcome<{ salt: string; kdf: unknown }> {
      const l = q.lock.get(name) as LockRow | undefined;
      if (!l || l.expiresDay < dayOf(now)) return fail(404);
      return ok({ salt: l.salt, kdf: JSON.parse(l.kdf) as unknown });
    },
    /** Constant-time check of SHA-256(authKey); counts failures and applies the slowdown. */
    openLock(name: string, authKey: string, now: number): { ok: true; value: { hopId: string; wrapped: string } } | { ok: false; status: 401 | 404 | 429; waitUntil: number | null } {
      return tx(() => {
        const l = q.lock.get(name) as LockRow | undefined;
        if (!l || l.expiresDay < dayOf(now)) return { ok: false as const, status: 404 as const, waitUntil: null };
        if (now < l.waitUntil) return { ok: false as const, status: 429 as const, waitUntil: l.waitUntil };
        const given = createHash('sha256').update(Buffer.from(authKey, 'base64url')).digest();
        const stored = Buffer.from(l.verifier, 'base64url');
        if (stored.length === given.length && timingSafeEqual(stored, given)) {
          q.lockResult.run(0, 0, name);
          return { ok: true as const, value: { hopId: l.hopId, wrapped: l.wrapped } };
        }
        const failures = l.failures + 1;
        const wait = waitAfter(failures);
        q.lockResult.run(failures, wait ? now + wait : 0, name);
        return { ok: false as const, status: 401 as const, waitUntil: wait ? now + wait : null };
      });
    },
    /** DSA Art. 6: remove a reported chain, by any of its hop ids, a lock name, or its chain id. */
    takedown(id: string): boolean {
      const lock = q.lock.get(id) as LockRow | undefined;
      if (lock) return Number(q.deleteChain.run(lock.chainId).changes) > 0;
      const h = q.hop.get(id) as HopRow | undefined;
      return Number(q.deleteChain.run(h ? h.chainId : id).changes) > 0;
    },
    /** For the disk guard: the database's size in bytes. */
    sizeBytes(): number {
      const pages = db.prepare('PRAGMA page_count').get() as { page_count: number };
      const size = db.prepare('PRAGMA page_size').get() as { page_size: number };
      return pages.page_count * size.page_size;
    },
    close: () => db.close(),
  };
}

export type Store = ReturnType<typeof openStore>;
