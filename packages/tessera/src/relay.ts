import { TesseraError } from './errors.js';

/**
 * The Cursus wire format, v1 (`.agents/features/cursus.md`). Boxes are base64url strings from
 * `seal`; the relay never sees anything else of the content. Days are whole UTC days since
 * 1970-01-01.
 */
export interface NewChain {
  readonly chainId: string;
  readonly hopId: string;
  readonly maxStops: number;
  readonly maxBranches: number;
  readonly content: string;
  readonly wrapKeyByT: string;
  readonly wrapTByKey: string;
}

export interface HopView {
  readonly hopId: string;
  readonly chainId: string;
  readonly parentId: string | null;
  readonly depth: number;
  readonly maxStops: number;
  readonly maxBranches: number;
  /** Complete and pending children: how many more this hop may have is `maxBranches - children`. */
  readonly children: number;
  readonly day: number;
  readonly expiresDay: number;
  readonly content: string;
}

export interface TreeHop {
  readonly hopId: string;
  readonly parentId: string | null;
  readonly depth: number;
  readonly day: number;
  /** The order hops were completed in — the wave's order (D8). */
  readonly seq: number;
  readonly content: string;
  readonly wrapKeyByT: string;
}

export interface TreeView {
  readonly chainId: string;
  readonly maxStops: number;
  readonly maxBranches: number;
  readonly expiresDay: number;
  readonly hops: readonly TreeHop[];
}

/** Why the relay refused a turn (HTTP 422). */
export type Refusal = 'last-stop' | 'branches-full' | 'chain-full' | 'too-big' | 'bad-request';

export interface Relay {
  createChain(chain: NewChain): Promise<{ day: number }>;
  getHop(hopId: string): Promise<HopView>;
  /** Stores the hop pending (A4) and returns the parent's `wrapTByKey`. */
  addHop(parentId: string, hop: { hopId: string; content: string }): Promise<{ wrapTByKey: string; day: number }>;
  completeHop(hopId: string, wraps: { wrapKeyByT: string; wrapTByKey: string }): Promise<{ day: number }>;
  getTree(chainId: string): Promise<TreeView>;
}

export class RelayRefusal extends TesseraError {
  readonly refusal: Refusal;
  constructor(refusal: Refusal) {
    super('rejected', refusal);
    this.refusal = refusal;
  }
}

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

/** The fetch client for Cursus. `baseUrl` is the relay's origin plus any prefix, without `/v1`. */
export function httpRelay(baseUrl: string, fetchImpl: Fetch = (i, init) => fetch(i, init)): Relay {
  const root = baseUrl.replace(/\/+$/, '');
  async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetchImpl(`${root}/v1${path}`, {
        method,
        headers: body === undefined ? {} : { 'content-type': 'application/json' },
        body: body === undefined ? null : JSON.stringify(body),
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        cache: 'no-store',
      });
    } catch {
      throw new TesseraError('offline');
    }
    if (res.ok) return (await res.json()) as T;
    if (res.status === 404) throw new TesseraError('not-found');
    if (res.status === 409) throw new TesseraError('conflict');
    if (res.status === 410) throw new TesseraError('gone');
    if (res.status === 422) {
      const refusal = ((await res.json().catch(() => ({}))) as { error?: Refusal }).error ?? 'bad-request';
      throw new RelayRefusal(refusal);
    }
    throw new TesseraError('relay', String(res.status));
  }
  const at = (id: string) => encodeURIComponent(id);
  return {
    createChain: (chain) => call('POST', '/chains', chain),
    getHop: (hopId) => call('GET', `/hops/${at(hopId)}`),
    addHop: (parentId, hop) => call('POST', `/hops/${at(parentId)}/children`, hop),
    completeHop: (hopId, wraps) => call('POST', `/hops/${at(hopId)}/complete`, wraps),
    getTree: (chainId) => call('GET', `/chains/${at(chainId)}/tree`),
  };
}
