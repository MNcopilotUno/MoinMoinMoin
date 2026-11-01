import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { httpRelay, newId, openHop, readTree, RelayRefusal, startChain, takeTurn, TesseraError, type Relay } from '@moin/tessera';
import { createHandler } from '../src/app.ts';
import { openStore, type Store } from '../src/store.ts';

const DAY = 86_400_000;
const bytes = (s: string) => new TextEncoder().encode(s);
const text = (b: Uint8Array | null) => (b ? new TextDecoder().decode(b) : null);

let dir: string, store: Store, server: Server, relay: Relay, base: string, clock: number;

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), 'cursus-'));
  store = openStore(join(dir, 'db.sqlite'));
  clock = 20_000 * DAY + 3_600_000;
  server = createServer(createHandler({ store, now: () => clock, origin: 'https://app.example' }));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
  relay = httpRelay(base);
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
  store.close();
  rmSync(dir, { recursive: true, force: true });
});

async function reason(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return 'ok';
  } catch (error) {
    if (error instanceof RelayRefusal) return error.refusal;
    return (error as TesseraError).reason;
  }
}

const post = (path: string, body: unknown) => fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body) });

describe('Cursus over HTTP with the Tessera client', () => {
  it('start → open → turn → tree, in order', async () => {
    const { hop: root } = await startChain(relay, { maxStops: 6, maxBranches: 1 }, bytes('v1'));
    const opened = await openHop(relay, root.hopId, root.secret);
    expect(text(opened.content)).toBe('v1');
    expect(opened.view).toMatchObject({ depth: 1, maxStops: 6, maxBranches: 1, children: 0, expiresDay: 20_030 });
    const two = await takeTurn(relay, opened.hop, bytes('v2'));
    const three = await takeTurn(relay, two.hop, bytes('v3'));
    const tree = await readTree(relay, root.chainId, three.chainSecret);
    expect(tree.hops.map((h) => [h.depth, text(h.content)])).toEqual([[1, 'v1'], [2, 'v2'], [3, 'v3']]);
  });

  it('a postcard (one stop) opens and cannot be passed on', async () => {
    const { hop } = await startChain(relay, { maxStops: 1, maxBranches: 1 }, bytes('postcard'));
    expect(text((await openHop(relay, hop.hopId, hop.secret)).content)).toBe('postcard');
    expect(await reason(takeTurn(relay, hop, bytes('x')))).toBe('last-stop');
  });

  it('refuses a hop past the last stop', async () => {
    let { hop } = await startChain(relay, { maxStops: 3, maxBranches: 1 }, bytes('1'));
    hop = (await takeTurn(relay, hop, bytes('2'))).hop;
    hop = (await takeTurn(relay, hop, bytes('3'))).hop;
    expect(hop.depth).toBe(3);
    expect(await reason(takeTurn(relay, hop, bytes('4')))).toBe('last-stop');
  });

  it('refuses a second child at branches 1 and a fourth at branches 3 — pending hops count', async () => {
    const { hop } = await startChain(relay, { maxStops: 6, maxBranches: 1 }, bytes('1'));
    await relay.addHop(hop.hopId, { hopId: newId(), content: 'AAAA' }); // pending, never completed
    expect(await reason(takeTurn(relay, hop, bytes('2')))).toBe('branches-full');
    const wide = (await startChain(relay, { maxStops: 6, maxBranches: 3 }, bytes('1'))).hop;
    for (let i = 0; i < 3; i++) await takeTurn(relay, wide, bytes(`c${i}`));
    expect(await reason(takeTurn(relay, wide, bytes('c3')))).toBe('branches-full');
  });

  it('refuses hop 101 (D10)', async () => {
    const { hop } = await startChain(relay, { maxStops: 12, maxBranches: 3 }, bytes('1'));
    // Fill to 100 directly in the store: 1 root + 99 pending children spread over depth.
    let parents = [hop.hopId];
    let count = 1;
    while (count < 100) {
      const next: string[] = [];
      for (const p of parents) {
        for (let b = 0; b < 3 && count < 100; b++) {
          const id = newId();
          expect(store.addHop(p, { hopId: id, content: 'AAAA' }, clock).ok).toBe(true);
          store.completeHop(id, { wrapKeyByT: 'A'.repeat(60), wrapTByKey: 'A'.repeat(60) }, clock);
          next.push(id);
          count++;
        }
      }
      parents = next;
    }
    const leaf = parents[parents.length - 1]!;
    expect(store.addHop(leaf, { hopId: newId(), content: 'AAAA' }, clock)).toEqual({ ok: false, status: 422, error: 'chain-full' });
  });

  it('a pending hop is invisible, swept after ten minutes, and cannot be completed late or twice', async () => {
    const { hop, chainSecret } = await startChain(relay, { maxStops: 6, maxBranches: 2 }, bytes('1'));
    const pendingId = newId();
    await relay.addHop(hop.hopId, { hopId: pendingId, content: 'AAAA' });
    expect(await reason(relay.getHop(pendingId))).toBe('not-found');
    expect((await readTree(relay, hop.chainId, chainSecret)).hops).toHaveLength(1);
    clock += 11 * 60 * 1000;
    expect(await reason(relay.completeHop(pendingId, { wrapKeyByT: 'A'.repeat(60), wrapTByKey: 'A'.repeat(60) }))).toBe('not-found');
    expect(store.sweep(clock)).toEqual({ chains: 0, pending: 1 });
    const done = await takeTurn(relay, hop, bytes('2'));
    expect(await reason(relay.completeHop(done.hop.hopId, { wrapKeyByT: 'A'.repeat(60), wrapTByKey: 'A'.repeat(60) }))).toBe('not-found');
  });

  it('a chain is gone on day 31 after its last hop; a hop on day 29 extends it', async () => {
    const { hop, chainSecret } = await startChain(relay, { maxStops: 6, maxBranches: 1 }, bytes('1'));
    clock += 29 * DAY;
    const next = await takeTurn(relay, hop, bytes('2'));
    clock += 30 * DAY;
    expect((await readTree(relay, hop.chainId, chainSecret)).hops).toHaveLength(2);
    clock += DAY;
    expect(await reason(relay.getHop(next.hop.hopId))).toBe('not-found');
    expect(await reason(relay.getTree(hop.chainId))).toBe('not-found');
    expect(store.sweep(clock)).toEqual({ chains: 1, pending: 0 });
  });

  it('answers a duplicate id with 409', async () => {
    const { hop } = await startChain(relay, { maxStops: 6, maxBranches: 1 }, bytes('1'));
    expect(await reason(relay.addHop(hop.hopId, { hopId: hop.hopId, content: 'AAAA' }))).toBe('conflict');
    expect(await reason(relay.addHop(hop.hopId, { hopId: hop.chainId, content: 'AAAA' }))).toBe('conflict');
  });

  it.each([
    ['bad JSON', '{nope', 'bad-request'],
    ['an array', '[]', 'bad-request'],
    ['a short id', { chainId: 'abc', hopId: 'abcdEFGH', maxStops: 6, maxBranches: 1, content: 'AAAA', wrapKeyByT: 'A'.repeat(60), wrapTByKey: 'A'.repeat(60) }, 'bad-request'],
    ['13 stops', { chainId: 'abcdEFGX', hopId: 'abcdEFGH', maxStops: 13, maxBranches: 1, content: 'AAAA', wrapKeyByT: 'A'.repeat(60), wrapTByKey: 'A'.repeat(60) }, 'bad-request'],
    ['4 branches', { chainId: 'abcdEFGX', hopId: 'abcdEFGH', maxStops: 6, maxBranches: 4, content: 'AAAA', wrapKeyByT: 'A'.repeat(60), wrapTByKey: 'A'.repeat(60) }, 'bad-request'],
    ['a wrap of the wrong size', { chainId: 'abcdEFGX', hopId: 'abcdEFGH', maxStops: 6, maxBranches: 1, content: 'AAAA', wrapKeyByT: 'A'.repeat(59), wrapTByKey: 'A'.repeat(60) }, 'bad-request'],
    ['content that is not base64url', { chainId: 'abcdEFGX', hopId: 'abcdEFGH', maxStops: 6, maxBranches: 1, content: 'hello world', wrapKeyByT: 'A'.repeat(60), wrapTByKey: 'A'.repeat(60) }, 'bad-request'],
    ['content over 2 KB', { chainId: 'abcdEFGX', hopId: 'abcdEFGH', maxStops: 6, maxBranches: 1, content: 'A'.repeat(2801), wrapKeyByT: 'A'.repeat(60), wrapTByKey: 'A'.repeat(60) }, 'too-big'],
    ['the same id for chain and hop', { chainId: 'abcdEFGH', hopId: 'abcdEFGH', maxStops: 6, maxBranches: 1, content: 'AAAA', wrapKeyByT: 'A'.repeat(60), wrapTByKey: 'A'.repeat(60) }, 'bad-request'],
  ])('refuses %s with 422', async (_, body, error) => {
    const res = await post('/v1/chains', body);
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error });
  });

  it('refuses a body over 8 KB with 413, an unknown route with 404, a wrong method with 405', async () => {
    expect((await post('/v1/chains', { content: 'A'.repeat(9000) })).status).toBe(413);
    expect((await fetch(`${base}/v1/nothing`)).status).toBe(404);
    expect((await fetch(`${base}/v1/chains`)).status).toBe(405);
    expect((await post('/v1/hops/abcdEFGH', {})).status).toBe(405);
  });

  it('answers a CORS preflight, and sends the privacy headers', async () => {
    const pre = await fetch(`${base}/v1/chains`, { method: 'OPTIONS' });
    expect(pre.status).toBe(204);
    expect(pre.headers.get('access-control-allow-origin')).toBe('https://app.example');
    expect(pre.headers.get('access-control-allow-headers')).toBe('content-type');
    const res = await fetch(`${base}/v1/hops/abcdEFGH`);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('privacy scan: the database holds no caption, no address, no user agent; nothing is logged', async () => {
    const log = vi.spyOn(console, 'log'), err = vi.spyOn(console, 'error'), warn = vi.spyOn(console, 'warn'), info = vi.spyOn(console, 'info');
    const agent = 'ScanTestAgent/1.0 (privacy)';
    const ua = httpRelay(base, (input, init) => fetch(input, { ...init, headers: { ...(init?.headers as Record<string, string>), 'user-agent': agent, 'x-forwarded-for': '203.0.113.7' } }));
    const { hop } = await startChain(ua, { maxStops: 6, maxBranches: 1 }, bytes('SECRETCAPTION When the captain finally says Moin'));
    await takeTurn(ua, hop, bytes('SECRETCAPTION nick Hein'));
    store.db.exec('PRAGMA wal_checkpoint(FULL)');
    const raw = readFileSync(join(dir, 'db.sqlite')).toString('latin1');
    for (const needle of ['SECRETCAPTION', 'captain', 'Hein', '127.0.0.1', '203.0.113.7', agent, 'ScanTestAgent']) expect(raw).not.toContain(needle);
    expect([log, err, warn, info].map((s) => s.mock.calls.length)).toEqual([0, 0, 0, 0]);
    vi.restoreAllMocks();
  });

  it('takedown by a hop id removes the whole chain', async () => {
    const { hop } = await startChain(relay, { maxStops: 6, maxBranches: 1 }, bytes('1'));
    const next = await takeTurn(relay, hop, bytes('2'));
    expect(store.takedown(next.hop.hopId)).toBe(true);
    expect(await reason(relay.getHop(hop.hopId))).toBe('not-found');
    expect(store.takedown(next.hop.hopId)).toBe(false);
    expect(store.takedown('zzzzzzzz')).toBe(false);
  });
});
