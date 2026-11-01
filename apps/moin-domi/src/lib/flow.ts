/**
 * The app's side of the chain: Tessera does the cryptography, this turns hops into memes and
 * records. Everything thrown is a `TesseraError` (with `reason`) or a `MemeError`.
 */
import { decodeMeme, encodeMeme, MemeError, type Meme } from '@moin/meme';
import {
  formatLink, openHop, parseLink, readTree, secretFromText, secretToText, startChain, takeTurn,
  TesseraError, type HopKey, type Relay,
} from '@moin/tessera';
import { appBase, today } from './config.js';
import type { Item } from './db.js';

export interface Rules {
  readonly kind: 'chain' | 'postcard';
  readonly maxStops: number;
  readonly maxBranches: number;
}

export const linkFor = (item: Pick<Item, 'hopId' | 'secret'>): string => formatLink(appBase, item.hopId, secretFromText(item.secret));

function keyOf(item: Item): HopKey {
  return { chainId: item.chainId, hopId: item.hopId, parentId: item.parentId, depth: item.depth, secret: secretFromText(item.secret) };
}

export async function start(relay: Relay, rules: Rules, meme: Meme): Promise<Item> {
  const limits = rules.kind === 'postcard' ? { maxStops: 1, maxBranches: 1 } : { maxStops: rules.maxStops, maxBranches: rules.maxBranches };
  const { hop, chainSecret } = await startChain(relay, limits, encodeMeme(meme));
  return {
    chainId: hop.chainId, kind: rules.kind, status: rules.kind === 'postcard' ? 'postcard-out' : 'travelling',
    hopId: hop.hopId, parentId: null, secret: secretToText(hop.secret), chainSecret: secretToText(chainSecret),
    depth: 1, ...limits, meme, expiresDay: today() + 30, updated: Date.now(), mine: true,
  };
}

/** Reads a link someone sent. Throws `TesseraError` (`not-a-link`, `bad-key`, `not-found`, `locked`…). */
export async function receive(relay: Relay, href: string, knownChain: (chainId: string) => Item | null): Promise<Item> {
  const { hopId, secret } = parseLink(href);
  const { view, hop, content } = await openHop(relay, hopId, secret);
  const known = knownChain(view.chainId);
  if (known && known.hopId === hopId) return { ...known, updated: Date.now() };
  let meme: Meme;
  try {
    meme = decodeMeme(content);
  } catch (error) {
    if (error instanceof MemeError) throw new TesseraError('locked', 'not a meme');
    throw error;
  }
  const kind = view.maxStops === 1 ? 'postcard' : 'chain';
  if (known?.chainSecret && kind === 'chain') {
    // Already in this chain: keep your own place, you will see this hop in the tree.
    return { ...known, updated: Date.now() };
  }
  const status = kind === 'postcard' ? 'postcard-in'
    : view.depth >= view.maxStops ? 'last-stop'
      : view.children >= view.maxBranches ? 'full' : 'your-turn';
  return {
    chainId: view.chainId, kind, status, hopId, parentId: view.parentId, secret: secretToText(hop.secret), chainSecret: null,
    depth: view.depth, maxStops: view.maxStops, maxBranches: view.maxBranches, meme, expiresDay: view.expiresDay,
    updated: Date.now(), mine: false,
  };
}

export async function passOn(relay: Relay, received: Item, meme: Meme): Promise<Item> {
  const { hop, chainSecret } = await takeTurn(relay, keyOf(received), encodeMeme(meme));
  const last = hop.depth >= received.maxStops;
  return {
    ...received, status: last ? 'finale' : 'travelling', hopId: hop.hopId, parentId: hop.parentId,
    secret: secretToText(hop.secret), chainSecret: secretToText(chainSecret), depth: hop.depth, meme,
    expiresDay: today() + 30, updated: Date.now(), mine: true,
  };
}

export interface Node {
  readonly hopId: string;
  readonly parentId: string | null;
  readonly depth: number;
  readonly seq: number;
  readonly day: number;
  readonly meme: Meme | null;
}

export async function tree(relay: Relay, item: Item): Promise<{ nodes: Node[]; maxStops: number; expiresDay: number }> {
  if (!item.chainSecret) throw new TesseraError('locked', 'take your turn first');
  const t = await readTree(relay, item.chainId, secretFromText(item.chainSecret));
  const readable = (content: Uint8Array | null): Meme | null => {
    try {
      return content ? decodeMeme(content) : null;
    } catch {
      return null;
    }
  };
  const nodes = t.hops.map((h) => ({ hopId: h.hopId, parentId: h.parentId, depth: h.depth, seq: h.seq, day: h.day, meme: readable(h.content) }));
  return { nodes, maxStops: t.limits.maxStops, expiresDay: t.expiresDay };
}

/** Root → hop, following parents. */
export function pathTo(nodes: readonly Node[], hopId: string): Node[] {
  const by = new Map(nodes.map((n) => [n.hopId, n]));
  const out: Node[] = [];
  for (let n = by.get(hopId); n; n = n.parentId ? by.get(n.parentId) : undefined) out.unshift(n);
  return out;
}

export function errorText(error: unknown): string {
  const reason = error instanceof TesseraError ? error.reason : '';
  switch (reason) {
    case 'offline': return 'You’re offline. Try again when you’re back.';
    case 'not-found': return 'This Moin is gone, or it never existed.';
    case 'not-a-link': case 'no-key': case 'bad-key': case 'bad-id': return 'This link is broken. Ask for it again, all of it.';
    case 'locked': return 'This link doesn’t open. Ask for it again, all of it.';
    case 'rejected': return 'Someone was quicker: this stop is already taken.';
    case 'slow-down': return 'The relay needs a breather. Try again in a few minutes.';
    default: return 'The relay didn’t answer. Try again in a moment.';
  }
}
