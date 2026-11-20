import type { IncomingMessage, ServerResponse } from 'node:http';
import { createLimiter, type Kind, type Limiter } from './limit.ts';
import { LIMITS, type Outcome, type Store } from './store.ts';

const ID = /^[A-Za-z0-9_-]{8}$/;
const BOX = /^[A-Za-z0-9_-]+$/;
// Lock names (password-links.md): a custom name, or a random 8-character id.
const LOCK = /^(?:[A-Za-z0-9_-]{8}|[a-z][a-z0-9]*(?:-[a-z0-9]+)*)$/;
const RESERVED = new Set(['m', 'v1', 'api', 'admin', 'health', 'locks', 'share', 'domi', 'moin', 'help', 'about', 'report']);
const lockName = (v: unknown): string => {
  if (typeof v !== 'string' || v.length < 3 || v.length > 32 || !LOCK.test(v) || RESERVED.has(v)) throw new HttpError(422, 'bad-request');
  return v;
};
const KDF = { m: [8192, 65536], t: [1, 10], p: [1, 4] } as const;
const kdfOf = (v: unknown): string => {
  const k = v as { m?: unknown; t?: unknown; p?: unknown } | null;
  if (!k || typeof k !== 'object' || !isInt(k.m, ...KDF.m) || !isInt(k.t, ...KDF.t) || !isInt(k.p, ...KDF.p) || Object.keys(k).length !== 3) throw new HttpError(422, 'bad-request');
  return JSON.stringify({ m: k.m, t: k.t, p: k.p });
};
const fixed = (v: unknown, chars: number): string => {
  if (typeof v !== 'string' || v.length !== chars || !BOX.test(v)) throw new HttpError(422, 'bad-request');
  return v;
};
const MAX_BODY = 8 * 1024;

export interface Options {
  readonly store: Store;
  readonly now?: () => number;
  /** The app's origin for CORS; `*` is safe because nothing uses cookies. */
  readonly origin?: string;
  readonly limiter?: Limiter;
  /** Behind a reverse proxy: take the address from `X-Forwarded-For` (first entry). */
  readonly trustProxy?: boolean;
  /** Refuse new chains (507) once the database is this big. */
  readonly maxBytes?: number;
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

/**
 * The request body, refused with 413 as soon as it passes `limit` (or declares it will). The rest
 * is not read: the error answer closes the connection, so no client reuses a half-read socket.
 */
function readRaw(req: IncomingMessage, limit: number): Promise<Buffer> {
  if (Number(req.headers['content-length']) > limit) return Promise.reject(new HttpError(413));
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        req.pause();
        reject(new HttpError(413));
      } else chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readBody(req: IncomingMessage): Promise<Body> {
  const raw = await readRaw(req, MAX_BODY);
  try {
    const value: unknown = JSON.parse(raw.toString('utf8'));
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) return value as Body;
  } catch {
    // fall through
  }
  throw new HttpError(422, 'bad-request');
}

/**
 * A8: what may be posted publicly — a JSON object of at most 2 KB without an uploaded picture.
 * Only that: every phone checks each post with the strict meme validation and skips what fails.
 */
function publicMeme(value: unknown): string {
  if (typeof value !== 'string' || value.length > LIMITS.postChars) throw new HttpError(422, 'bad-request');
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new HttpError(422, 'bad-request');
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new HttpError(422, 'bad-request');
  if ('image' in parsed) throw new HttpError(422, 'not-public');
  return value;
}

/** A8: a sealed picture, raw bytes, up to the media limit. */
async function readBytes(req: IncomingMessage): Promise<Uint8Array> {
  const raw = await readRaw(req, LIMITS.mediaBytes);
  if (raw.length < 29) throw new HttpError(422, 'bad-request');
  return new Uint8Array(raw);
}

function unwrap<T>(outcome: Outcome<T>): T {
  if (outcome.ok) return outcome.value;
  throw new HttpError(outcome.status, outcome.error);
}

/** The whole relay as one request handler. Writes nothing about requests anywhere. */
export function createHandler({ store, now = () => Date.now(), origin = '*', limiter = createLimiter({ now }), trustProxy = false, maxBytes = 512 * 1024 * 1024 }: Options) {
  const addressOf = (req: IncomingMessage): string => {
    const forwarded = trustProxy ? String(req.headers['x-forwarded-for'] ?? '').split(',')[0]?.trim() : '';
    return forwarded || req.socket.remoteAddress || 'unknown';
  };
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
      if (path === '/v1/health') {
        if (method !== 'GET') throw new HttpError(405);
        return send(200, { ok: true, api: 1 });
      }
      const kind: Kind = method !== 'POST' ? 'read' : path === '/v1/posts' ? 'post' : path === '/v1/chains' || path === '/v1/locks' || path.startsWith('/v1/media/') ? 'create' : 'write';
      const wait = limiter.take(kind, addressOf(req));
      if (wait > 0) {
        headers['retry-after'] = String(wait);
        throw new HttpError(429, 'slow-down');
      }
      const t = now();
      let m: RegExpExecArray | null;
      if (path === '/v1/chains') {
        if (method !== 'POST') throw new HttpError(405);
        const b = await readBody(req);
        if (store.sizeBytes() >= maxBytes) throw new HttpError(507, 'full');
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
      if ((m = /^\/v1\/media\/([^/]+)$/.exec(path))) {
        const mediaId = id(decodeURIComponent(m[1]!));
        if (method === 'GET') {
          const box = unwrap(store.getMedia(mediaId, t));
          res.writeHead(200, { ...headers, 'cache-control': 'private, max-age=86400, immutable', 'content-type': 'application/octet-stream', 'content-length': String(box.length) });
          res.end(Buffer.from(box));
          return;
        }
        if (method !== 'POST') throw new HttpError(405);
        if (store.sizeBytes() >= maxBytes) throw new HttpError(507, 'full');
        const chainId = id(new URL(req.url ?? '/', 'http://relay').searchParams.get('chain'));
        return send(201, unwrap(store.putMedia(mediaId, chainId, await readBytes(req), t)));
      }
      if (path === '/v1/posts') {
        if (method === 'GET') {
          const before = new URL(req.url ?? '/', 'http://relay').searchParams.get('before');
          if (before !== null && !/^[1-9][0-9]{0,15}$/.test(before)) throw new HttpError(422, 'bad-request');
          return send(200, { posts: store.listPosts(before === null ? null : Number(before), t) });
        }
        if (method !== 'POST') throw new HttpError(405);
        const b = await readBody(req);
        if (store.sizeBytes() >= maxBytes) throw new HttpError(507, 'full');
        return send(201, store.createPost(publicMeme(b.content), t));
      }
      if ((m = /^\/v1\/posts\/([^/]+)$/.exec(path))) {
        if (method !== 'GET') throw new HttpError(405);
        return send(200, unwrap(store.getPost(id(decodeURIComponent(m[1]!)), t)));
      }
      if (path === '/v1/locks') {
        if (method !== 'POST') throw new HttpError(405);
        const b = await readBody(req);
        const value = unwrap(store.createLock({ name: lockName(b.name), hopId: id(b.hopId), salt: fixed(b.salt, 22), kdf: kdfOf(b.kdf), verifier: fixed(b.verifier, 43), wrapped: fixed(b.wrapped, 60) }, t));
        return send(201, value);
      }
      if ((m = /^\/v1\/locks\/([^/]+)$/.exec(path))) {
        if (method !== 'GET') throw new HttpError(405);
        return send(200, unwrap(store.getLock(decodeURIComponent(m[1]!), t)));
      }
      if ((m = /^\/v1\/locks\/([^/]+)\/open$/.exec(path))) {
        if (method !== 'POST') throw new HttpError(405);
        const b = await readBody(req);
        const result = store.openLock(decodeURIComponent(m[1]!), fixed(b.authKey, 43), t);
        if (result.ok) return send(200, result.value);
        if (result.status === 404) throw new HttpError(404);
        return send(result.status, { error: result.status === 401 ? 'wrong' : 'wait', waitUntil: result.waitUntil });
      }
      if ((m = /^\/v1\/chains\/([^/]+)\/tree$/.exec(path))) {
        if (method !== 'GET') throw new HttpError(405);
        return send(200, unwrap(store.getTree(decodeURIComponent(m[1]!), t)));
      }
      throw new HttpError(404);
    } catch (error) {
      if (error instanceof HttpError && error.status === 413) headers.connection = 'close';
      if (error instanceof HttpError) return send(error.status, error.error ? { error: error.error } : { error: String(error.status) });
      // A bug, not a request: say so without anything about who asked.
      console.error('cursus: internal error', error instanceof Error ? error.message : 'unknown');
      return send(500, { error: 'internal' });
    }
  };
}
