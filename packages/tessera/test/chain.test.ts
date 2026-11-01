import { describe, expect, it } from 'vitest';
import { newSecret, openHop, readTree, startChain, takeTurn, TesseraError } from '../src/index.js';
import { fakeRelay } from './fake-relay.js';

const bytes = (s: string) => new TextEncoder().encode(s);
const text = (b: Uint8Array | null) => (b ? new TextDecoder().decode(b) : null);
const limits = { maxStops: 6, maxBranches: 2 };

async function reason(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return 'ok';
  } catch (error) {
    return (error as TesseraError).reason;
  }
}

describe('the chain protocol (§3, A4)', () => {
  it('start → open → turn → the tree opens every hop, in the order they happened', async () => {
    const { relay } = fakeRelay();
    const { hop: root, chainSecret } = await startChain(relay, limits, bytes('v1'));
    const opened = await openHop(relay, root.hopId, root.secret);
    expect(text(opened.content)).toBe('v1');
    expect(opened.view.depth).toBe(1);
    const second = await takeTurn(relay, opened.hop, bytes('v2'));
    expect(second.chainSecret).toEqual(chainSecret);
    expect(second.hop.depth).toBe(2);
    const third = await takeTurn(relay, (await openHop(relay, second.hop.hopId, second.hop.secret)).hop, bytes('v3'));
    const sibling = await takeTurn(relay, opened.hop, bytes('v2b'));
    const tree = await readTree(relay, root.chainId, third.chainSecret);
    expect(tree.hops.map((h) => text(h.content))).toEqual(['v1', 'v2', 'v3', 'v2b']);
    expect(tree.hops.find((h) => h.hopId === sibling.hop.hopId)?.parentId).toBe(root.hopId);
  });

  it('a hop link opens that hop and nothing else: the tree is unreadable without T', async () => {
    const { relay } = fakeRelay();
    const { hop } = await startChain(relay, limits, bytes('v1'));
    const tree = await readTree(relay, hop.chainId, hop.secret);
    expect(tree.hops.map((h) => h.content)).toEqual([null]);
    const wrongT = await readTree(relay, hop.chainId, newSecret());
    expect(wrongT.hops.every((h) => h.content === null)).toBe(true);
  });

  it('a pending hop is not a link and not in the tree until its wraps arrive (A4)', async () => {
    const { relay } = fakeRelay();
    const { hop, chainSecret } = await startChain(relay, limits, bytes('v1'));
    await relay.addHop(hop.hopId, { hopId: 'pendingA', content: 'x' });
    expect(await reason(relay.getHop('pendingA'))).toBe('not-found');
    expect((await readTree(relay, hop.chainId, chainSecret)).hops).toHaveLength(1);
  });

  it('the wrong key for a hop is locked', async () => {
    const { relay } = fakeRelay();
    const { hop } = await startChain(relay, limits, bytes('v1'));
    expect(await reason(openHop(relay, hop.hopId, newSecret()))).toBe('locked');
  });

  it('a relay that swaps two boxes breaks both, and only those', async () => {
    const { relay, hops } = fakeRelay();
    const { hop: root } = await startChain(relay, limits, bytes('v1'));
    const a = await takeTurn(relay, root, bytes('a'));
    const b = await takeTurn(relay, root, bytes('b'));
    const ra = hops.get(a.hop.hopId)!, rb = hops.get(b.hop.hopId)!;
    [ra.content, rb.content] = [rb.content, ra.content];
    const tree = await readTree(relay, root.chainId, a.chainSecret);
    expect(tree.hops.map((h) => text(h.content))).toEqual(['v1', null, null]);
    expect(await reason(openHop(relay, a.hop.hopId, a.hop.secret))).toBe('locked');
  });

  it('a relay that re-parents a hop makes it unreadable', async () => {
    const { relay, hops } = fakeRelay();
    const { hop: root } = await startChain(relay, limits, bytes('v1'));
    const a = await takeTurn(relay, root, bytes('a'));
    const b = await takeTurn(relay, a.hop, bytes('b'));
    hops.get(b.hop.hopId)!.parentId = root.hopId;
    const tree = await readTree(relay, root.chainId, b.chainSecret);
    expect(text(tree.hops.find((h) => h.hopId === b.hop.hopId)!.content)).toBeNull();
  });

  it('a relay that hands over another chain\'s T-wrap gives no T', async () => {
    const { relay, hops } = fakeRelay();
    const one = await startChain(relay, limits, bytes('one'));
    const two = await startChain(relay, limits, bytes('two'));
    hops.get(one.hop.hopId)!.wrapTByKey = hops.get(two.hop.hopId)!.wrapTByKey;
    expect(await reason(takeTurn(relay, one.hop, bytes('x')))).toBe('locked');
  });

  it('retries with a new id when the relay says the id is taken, then gives up', async () => {
    const { relay } = fakeRelay();
    const seen: string[] = [];
    let refuse = 1;
    const flaky = { ...relay, createChain: async (c: Parameters<typeof relay.createChain>[0]) => {
      seen.push(c.hopId);
      if (refuse-- > 0) throw new TesseraError('conflict');
      return relay.createChain(c);
    } };
    const { hop } = await startChain(flaky, limits, bytes('v1'));
    expect(seen).toHaveLength(2);
    expect(seen[0]).not.toBe(seen[1]);
    expect(hop.hopId).toBe(seen[1]);
    refuse = 99;
    expect(await reason(startChain(flaky, limits, bytes('v1')))).toBe('conflict');
  });
});
