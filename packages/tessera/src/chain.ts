import { TesseraError } from './errors.js';
import { newId, newSecret, type Secret } from './keys.js';
import type { HopView, Relay } from './relay.js';
import { open, placeAad, seal } from './seal.js';

/** What a person keeps after making or opening a hop: enough to show it and to go on. */
export interface HopKey {
  readonly chainId: string;
  readonly hopId: string;
  readonly parentId: string | null;
  readonly depth: number;
  readonly secret: Secret;
}

export interface Limits {
  readonly maxStops: number;
  readonly maxBranches: number;
}

const ids = { attempts: 4 };

async function withFreshId<T>(make: (id: string) => Promise<T>): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await make(newId());
    } catch (error) {
      if (!(error instanceof TesseraError && error.reason === 'conflict') || i >= ids.attempts) throw error;
    }
  }
}

/** §3 step 0: the creator makes `T` and the first hop, all wraps in one request. */
export async function startChain(relay: Relay, limits: Limits, content: Uint8Array<ArrayBuffer>): Promise<{ hop: HopKey; chainSecret: Secret }> {
  const t = newSecret();
  const k = newSecret();
  const chainId = newId();
  return withFreshId(async (hopId) => {
    const place = { chainId, parentId: null, depth: 1, hopId };
    const aad = placeAad(place);
    await relay.createChain({
      chainId, hopId, ...limits,
      content: await seal(k, 'hop-content', content, aad),
      wrapKeyByT: await seal(t, 'hop-key', k, aad),
      wrapTByKey: await seal(k, 'chain-key', t, aad),
    });
    return { hop: { ...place, secret: k }, chainSecret: t };
  });
}

/** §3 step 1: open hop `n` with `K_n` — and nothing else. */
export async function openHop(relay: Relay, hopId: string, secret: Secret): Promise<{ view: HopView; hop: HopKey; content: Uint8Array<ArrayBuffer> }> {
  const view = await relay.getHop(hopId);
  if (view.hopId !== hopId) throw new TesseraError('locked');
  const hop: HopKey = { chainId: view.chainId, hopId, parentId: view.parentId, depth: view.depth, secret };
  const content = await open(secret, 'hop-content', view.content, placeAad(hop));
  return { view, hop, content };
}

/** §3 steps 2–4 with A4: a pending hop, then `T`, then the wraps that complete it. */
export async function takeTurn(relay: Relay, parent: HopKey, content: Uint8Array<ArrayBuffer>): Promise<{ hop: HopKey; chainSecret: Secret }> {
  const k = newSecret();
  return withFreshId(async (hopId) => {
    const place = { chainId: parent.chainId, parentId: parent.hopId, depth: parent.depth + 1, hopId };
    const aad = placeAad(place);
    const { wrapTByKey } = await relay.addHop(parent.hopId, { hopId, content: await seal(k, 'hop-content', content, aad) });
    const t = await open(parent.secret, 'chain-key', wrapTByKey, placeAad(parent));
    await relay.completeHop(hopId, {
      wrapKeyByT: await seal(t, 'hop-key', k, aad),
      wrapTByKey: await seal(k, 'chain-key', t, aad),
    });
    return { hop: { ...place, secret: k }, chainSecret: t };
  });
}

export interface OpenedHop {
  readonly hopId: string;
  readonly parentId: string | null;
  readonly depth: number;
  readonly day: number;
  readonly seq: number;
  /** `null` when the box would not open: tampered, moved, or a wrong `T`. */
  readonly content: Uint8Array<ArrayBuffer> | null;
  readonly secret: Secret | null;
}

/** The whole tree, opened with `T`. One bad box never hides the others. */
export async function readTree(relay: Relay, chainId: string, chainSecret: Secret): Promise<{ limits: Limits; expiresDay: number; hops: OpenedHop[] }> {
  const tree = await relay.getTree(chainId);
  if (tree.chainId !== chainId) throw new TesseraError('locked');
  const hops = await Promise.all(tree.hops.map(async (h): Promise<OpenedHop> => {
    const aad = placeAad({ chainId, parentId: h.parentId, depth: h.depth, hopId: h.hopId });
    try {
      const secret = await open(chainSecret, 'hop-key', h.wrapKeyByT, aad);
      const content = await open(secret, 'hop-content', h.content, aad);
      return { hopId: h.hopId, parentId: h.parentId, depth: h.depth, day: h.day, seq: h.seq, content, secret };
    } catch {
      return { hopId: h.hopId, parentId: h.parentId, depth: h.depth, day: h.day, seq: h.seq, content: null, secret: null };
    }
  }));
  hops.sort((a, b) => a.seq - b.seq);
  return { limits: { maxStops: tree.maxStops, maxBranches: tree.maxBranches }, expiresDay: tree.expiresDay, hops };
}
