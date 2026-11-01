import { LockRefusal, TesseraError, toBase64url, type HopView, type NewChain, type NewLock, type Relay, type TreeView } from '../src/index.js';

interface Row { hopId: string; chainId: string; parentId: string | null; depth: number; content: string; wrapKeyByT?: string; wrapTByKey?: string; pending: boolean; seq: number }

const fromB64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0));

/** An honest in-memory Cursus, plus hooks to make it dishonest. */
export function fakeRelay() {
  const chains = new Map<string, { maxStops: number; maxBranches: number }>();
  const hops = new Map<string, Row>();
  let seq = 0;
  let now = 0;
  const locks = new Map<string, NewLock & { failures: number; waitUntil: number }>();
  const relay: Relay = {
    async createChain(c: NewChain) {
      if (chains.has(c.chainId) || hops.has(c.hopId)) throw new TesseraError('conflict');
      chains.set(c.chainId, { maxStops: c.maxStops, maxBranches: c.maxBranches });
      hops.set(c.hopId, { hopId: c.hopId, chainId: c.chainId, parentId: null, depth: 1, content: c.content, wrapKeyByT: c.wrapKeyByT, wrapTByKey: c.wrapTByKey, pending: false, seq: seq++ });
      return { day: 1 };
    },
    async getHop(id): Promise<HopView> {
      const h = hops.get(id);
      if (!h || h.pending) throw new TesseraError('not-found');
      const c = chains.get(h.chainId)!;
      const children = [...hops.values()].filter((x) => x.parentId === id).length;
      return { hopId: h.hopId, chainId: h.chainId, parentId: h.parentId, depth: h.depth, ...c, children, day: 1, expiresDay: 31, content: h.content };
    },
    async addHop(parentId, { hopId, content }) {
      const p = hops.get(parentId);
      if (!p || p.pending) throw new TesseraError('not-found');
      if (hops.has(hopId)) throw new TesseraError('conflict');
      hops.set(hopId, { hopId, chainId: p.chainId, parentId, depth: p.depth + 1, content, pending: true, seq: -1 });
      return { wrapTByKey: p.wrapTByKey!, day: 1 };
    },
    async completeHop(hopId, wraps) {
      const h = hops.get(hopId);
      if (!h || !h.pending) throw new TesseraError('not-found');
      Object.assign(h, wraps, { pending: false, seq: seq++ });
      return { day: 1 };
    },
    async getTree(chainId): Promise<TreeView> {
      const c = chains.get(chainId);
      if (!c) throw new TesseraError('not-found');
      return {
        chainId, ...c, expiresDay: 31,
        hops: [...hops.values()].filter((h) => h.chainId === chainId && !h.pending)
          .map((h) => ({ hopId: h.hopId, parentId: h.parentId, depth: h.depth, day: 1, seq: h.seq, content: h.content, wrapKeyByT: h.wrapKeyByT! })),
      };
    },
    async createLock(lock) {
      if (locks.has(lock.name)) throw new TesseraError('conflict');
      locks.set(lock.name, { ...lock, failures: 0, waitUntil: 0 });
      return { day: 1 };
    },
    async getLock(name) {
      const l = locks.get(name);
      if (!l) throw new TesseraError('not-found');
      return { salt: l.salt, kdf: l.kdf };
    },
    async openLock(name, authKey) {
      const l = locks.get(name);
      if (!l) throw new TesseraError('not-found');
      if (now < l.waitUntil) throw new LockRefusal('wait', l.waitUntil);
      const digest = toBase64url(new Uint8Array(await crypto.subtle.digest('SHA-256', fromB64(authKey))));
      if (digest !== l.verifier) {
        l.failures += 1;
        l.waitUntil = l.failures >= 5 ? now + Math.min(2 ** (l.failures - 5), 1440) * 60_000 : 0;
        throw new LockRefusal('wrong-password', l.waitUntil || null);
      }
      l.failures = 0;
      l.waitUntil = 0;
      return { hopId: l.hopId, wrapped: l.wrapped };
    },
  };
  return { relay, hops, locks, tick: (ms: number) => { now += ms; } };
}
