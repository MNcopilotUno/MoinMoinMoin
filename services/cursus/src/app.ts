import type { IncomingMessage, ServerResponse } from 'node:http';
import { LIMITS, type Outcome, type Store } from './store.ts';

const ID = /^[A-Za-z0-9_-]{8}$/;
const BOX = /^[A-Za-z0-9_-]+$/;
const MAX_BODY = 8 * 1024;

export interface Options {
  readonly store: Store;
  readonly now?: () => number;
  /** The app's origin for CORS; `*` is safe because nothing uses cookies. */
  readonly origin?: string;
}

type Body = Record<string, unknown>;
class HttpError extends Error {
  readonly status: number;
  readonly error: string | undefined;
  constructor(status: number, error?: string) {
    super(error ?? String(status));
    this.status = status;
    this.error = error;
  }
}

const isBox = (v: unknown, max: number): v is string => typeof v === 'string' && v.length > 0 && v.length <= max && BOX.test(v);
const isWrap = (v: unknown): v is string => typeof v === 'string' && v.length === LIMITS.wrapChars && BOX.test(v);
const isInt = (v: unknown, lo: number, hi: number): v is number => Number.isInteger(v) && (v as number) >= lo && (v as number) <= hi;

function content(v: unknown): string {
  if (typeof v === 'string' && v.length > LIMITS.contentChars) throw new HttpError(422, 'too-big');
  if (!isBox(v, LIMITS.contentChars)) throw new HttpError(422, 'bad-request');
  return v;
}
function id(v: unknown): string {
  if (typeof v !== 'string' || !ID.test(v)) throw new HttpError(422, 'bad-request');
  return v;
}

async function readBody(req: IncomingMessage): Promise<Body> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY) throw new HttpError(413);
    chunks.push(chunk as Buffer);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) return value as Body;
  } catch {
    // fall through
  }
  throw new HttpError(422, 'bad-request');
}

function unwrap<T>(outcome: Outcome<T>): T {
  if (outcome.ok) return outcome.value;
  throw new HttpError(outcome.status, outcome.error);
}

/** The whole relay as one request handler. Writes nothing about requests anywhere. */
export function createHandler({ store, now = () => Date.now(), origin = '*' }: Options) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const headers: Record<string, string> = {
      'cache-control': 'no-store',
      'referrer-policy': 'no-referrer',
      'x-content-type-options': 'nosniff',
      'access-control-allow-origin': origin,
      vary: 'origin',
    };
    const send = (status: number, body?: unknown) => {
      res.writeHead(status, body === undefined ? headers : { ...headers, 'content-type': 'application/json; charset=utf-8' });
      res.end(body === undefined ? undefined : JSON.stringify(body));
    };
    try {
      const path = new URL(req.url ?? '/', 'http://relay').pathname;
      const method = req.method ?? 'GET';
      if (method === 'OPTIONS') {
        headers['access-control-allow-methods'] = 'GET, POST';
        headers['access-control-allow-headers'] = 'content-type';
        headers['access-control-max-age'] = '86400';
        return send(204);
      }
      const t = now();
      let m: RegExpExecArray | null;
      if (path === '/v1/chains') {
        if (method !== 'POST') throw new HttpError(405);
        const b = await readBody(req);
        if (!isInt(b.maxStops, 1, 12) || !isInt(b.maxBranches, 1, 3) || !isWrap(b.wrapKeyByT) || !isWrap(b.wrapTByKey)) throw new HttpError(422, 'bad-request');
        const value = unwrap(store.createChain({ chainId: id(b.chainId), hopId: id(b.hopId), maxStops: b.maxStops, maxBranches: b.maxBranches, content: content(b.content), wrapKeyByT: b.wrapKeyByT, wrapTByKey: b.wrapTByKey }, t));
        return send(201, value);
      }
      if ((m = /^\/v1\/hops\/([^/]+)$/.exec(path))) {
        if (method !== 'GET') throw new HttpError(405);
        return send(200, unwrap(store.getHop(decodeURIComponent(m[1]!), t)));
      }
      if ((m = /^\/v1\/hops\/([^/]+)\/children$/.exec(path))) {
        if (method !== 'POST') throw new HttpError(405);
        const b = await readBody(req);
        return send(201, unwrap(store.addHop(decodeURIComponent(m[1]!), { hopId: id(b.hopId), content: content(b.content) }, t)));
      }
      if ((m = /^\/v1\/hops\/([^/]+)\/complete$/.exec(path))) {
        if (method !== 'POST') throw new HttpError(405);
        const b = await readBody(req);
        if (!isWrap(b.wrapKeyByT) || !isWrap(b.wrapTByKey)) throw new HttpError(422, 'bad-request');
        return send(200, unwrap(store.completeHop(decodeURIComponent(m[1]!), { wrapKeyByT: b.wrapKeyByT, wrapTByKey: b.wrapTByKey }, t)));
      }
      if ((m = /^\/v1\/chains\/([^/]+)\/tree$/.exec(path))) {
        if (method !== 'GET') throw new HttpError(405);
        return send(200, unwrap(store.getTree(decodeURIComponent(m[1]!), t)));
      }
      throw new HttpError(404);
    } catch (error) {
      if (error instanceof HttpError) return send(error.status, error.error ? { error: error.error } : { error: String(error.status) });
      // A bug, not a request: say so without anything about who asked.
      console.error('cursus: internal error', error instanceof Error ? error.message : 'unknown');
      return send(500, { error: 'internal' });
    }
  };
}
