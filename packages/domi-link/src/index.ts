/**
 * The Moin link, format v1 (docs/DOMI_FORMAT.md — normative; this file mirrors it).
 * Pure apart from two platform calls every engine has: WebCrypto and CompressionStream.
 * Randomness (salt, IV) is injected, so every result is reproducible in tests.
 */

export type Wave = 'moin' | 'moinmoin' | 'quay' | 'light';
export type Fade = 'day' | 'week' | 'month';

export interface Moin {
  readonly wave: Wave;
  /** A few words; '' for none. */
  readonly words: string;
  /** Holders' names in order, the sender first; '' = someone who kept it a mystery. */
  readonly holders: readonly string[];
  /** How many people have held it, sender included (keeps counting past 24 names). */
  readonly held: number;
  /** The sender's local calendar day, YYYY-MM-DD. */
  readonly day: string;
  readonly fade: Fade;
  readonly passOn: boolean;
  readonly reach: boolean;
}

/** Returns `n` cryptographically random bytes (the app passes `crypto.getRandomValues`). */
export type Random = (n: number) => Uint8Array;

export type ErrorCode = 'not-a-moin' | 'unsupported-version' | 'too-long' | 'malformed' | 'locked' | 'wrong-password' | 'invalid';
export type ReadResult =
  | { readonly ok: true; readonly locked: boolean; readonly moin: Moin }
  | { readonly ok: false; readonly code: ErrorCode; readonly message: string };
export type PassResult =
  | { readonly ok: true; readonly moin: Moin }
  | { readonly ok: false; readonly code: 'closed' | 'invalid'; readonly message: string };

export const WAVES: readonly Wave[] = ['moin', 'moinmoin', 'quay', 'light'];
export const FADES: Readonly<Record<Fade, number>> = { day: 1, week: 7, month: 30 };
export const LIMITS = { words: 80, name: 24, names: 24, held: 1_000_000, link: 8000 } as const;
export const PBKDF2_ITERATIONS = 600_000;
const AAD = new TextEncoder().encode('m1l');

// ── validation (FORMAT §2) ───────────────────────────────────────────────────────────────────

const codePoints = (s: string) => [...s].length;
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/;

function isDay(day: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}

/** Every rule a Moin breaks, each naming its field; [] when valid. */
export function validate(m: Moin): string[] {
  const problems: string[] = [];
  if (!WAVES.includes(m.wave)) problems.push(`wave must be one of ${WAVES.join(', ')}`);
  if (typeof m.words !== 'string') problems.push('words must be text');
  else {
    if (codePoints(m.words) > LIMITS.words) problems.push(`words must be at most ${LIMITS.words} characters`);
    if (CONTROL.test(m.words)) problems.push('words must not contain control characters');
  }
  if (!Array.isArray(m.holders) || m.holders.length === 0) problems.push('holders must name at least the sender');
  else {
    if (m.holders.length > LIMITS.names) problems.push(`holders keeps at most ${LIMITS.names} names`);
    m.holders.forEach((h, i) => {
      if (typeof h !== 'string' || codePoints(h) > LIMITS.name) problems.push(`name ${i + 1} must be at most ${LIMITS.name} characters`);
      else if (CONTROL.test(h)) problems.push(`name ${i + 1} must not contain control characters`);
    });
  }
  const names = Array.isArray(m.holders) ? m.holders.length : 0;
  if (!Number.isInteger(m.held) || m.held < Math.max(1, names) || m.held > LIMITS.held) {
    problems.push(`held must be a whole number from the number of names (${names}) to ${LIMITS.held}`);
  }
  if (typeof m.day !== 'string' || !isDay(m.day)) problems.push('day must be a real date, YYYY-MM-DD');
  if (!(m.fade in FADES)) problems.push(`fade must be one of ${Object.keys(FADES).join(', ')}`);
  if (typeof m.passOn !== 'boolean') problems.push('passOn must be true or false');
  if (typeof m.reach !== 'boolean') problems.push('reach must be true or false');
  return problems;
}

// ── making and passing on ─────────────────────────────────────────────────────────────────────

export interface StartOptions {
  readonly wave: Wave;
  readonly words: string;
  /** The sender's first name, or '' to stay a mystery. */
  readonly from: string;
  readonly day: string;
  readonly fade: Fade;
  readonly passOn: boolean;
  readonly reach: boolean;
}

/** A new Moin, held by its sender. */
export function start(o: StartOptions): Moin {
  return { wave: o.wave, words: o.words, holders: [o.from], held: 1, day: o.day, fade: o.fade, passOn: o.passOn, reach: o.reach };
}

/** Whoever opens `m` is holder number `held + 1` ("you're the 4th person"). */
export function holderNumber(m: Moin): number {
  return m.held + 1;
}

/** The next holder passes it on: their name joins the first 24, the count goes up. */
export function passOn(m: Moin, name: string): PassResult {
  if (!m.passOn) return { ok: false, code: 'closed', message: 'This Moin was not meant to be passed on.' };
  const next: Moin = { ...m, holders: m.holders.length < LIMITS.names ? [...m.holders, name] : m.holders, held: m.held + 1 };
  const problems = validate(next);
  return problems.length ? { ok: false, code: 'invalid', message: problems.join('; ') } : { ok: true, moin: next };
}

// ── fading (FORMAT §5) ────────────────────────────────────────────────────────────────────────

/** The last day the Moin can be opened. */
export function fadesAfter(m: Moin): string {
  const [y, mo, d] = m.day.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, mo - 1, d + FADES[m.fade])).toISOString().slice(0, 10);
}

/** Faded when `today` (the reader's local day, YYYY-MM-DD) is later than `day + fade`. */
export function hasFaded(m: Moin, today: string): boolean {
  return today > fadesAfter(m);
}

// ── wire format ───────────────────────────────────────────────────────────────────────────────

interface Wire { v: 1; w: Wave; t?: string; h: string[]; n: number; d: string; x: Fade; p: 0 | 1; r: 0 | 1 }
const KEYS = new Set(['v', 'w', 't', 'h', 'n', 'd', 'x', 'p', 'r']);

const toWire = (m: Moin): Wire => ({
  v: 1, w: m.wave, ...(m.words ? { t: m.words } : {}), h: [...m.holders], n: m.held, d: m.day, x: m.fade, p: m.passOn ? 1 : 0, r: m.reach ? 1 : 0,
});

function fromWire(json: unknown): Moin | string {
  if (typeof json !== 'object' || json === null || Array.isArray(json)) return 'the payload is not an object';
  const o = json as Record<string, unknown>;
  const unknown = Object.keys(o).filter((k) => !KEYS.has(k));
  if (unknown.length) return `unknown field ${unknown.join(', ')}`;
  if (o.v !== 1) return `payload version ${String(o.v)} is not 1`;
  if (o.p !== 0 && o.p !== 1) return 'p must be 0 or 1';
  if (o.r !== 0 && o.r !== 1) return 'r must be 0 or 1';
  if (o.t !== undefined && typeof o.t !== 'string') return 'words must be text';
  return {
    wave: o.w as Wave, words: (o.t as string | undefined) ?? '', holders: o.h as string[], held: o.n as number,
    day: o.d as string, fade: o.x as Fade, passOn: o.p === 1, reach: o.r === 1,
  };
}

// ── bytes: base64url, deflate-raw ─────────────────────────────────────────────────────────────

export function toBase64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64url(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text) || text.length % 4 === 1) return null;
  try {
    const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

async function through(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}
const deflate = (b: Uint8Array) => through(b, new CompressionStream('deflate-raw'));
const inflate = (b: Uint8Array) => through(b, new DecompressionStream('deflate-raw'));

async function keyFor(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const raw = await crypto.subtle.importKey('raw', new TextEncoder().encode(password.normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS },
    raw, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  );
}

async function pack(m: Moin): Promise<Uint8Array> {
  const problems = validate(m);
  if (problems.length) throw new Error(`not a valid Moin: ${problems.join('; ')}`);
  return deflate(new TextEncoder().encode(JSON.stringify(toWire(m))));
}

// ── writing ───────────────────────────────────────────────────────────────────────────────────

/** An open Moin: `#m1.<data>`. */
export async function encode(m: Moin): Promise<string> {
  return `#m1.${toBase64url(await pack(m))}`;
}

/** A locked Moin: `#m1l.<salt>.<iv>.<data>`, AES-256-GCM with a PBKDF2 key. Never contains the password. */
export async function lock(m: Moin, password: string, random: Random): Promise<string> {
  const salt = random(16);
  const iv = random(12);
  const key = await keyFor(password, salt);
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource, additionalData: AAD }, key, (await pack(m)) as BufferSource));
  return `#m1l.${toBase64url(salt)}.${toBase64url(iv)}.${toBase64url(data)}`;
}

// ── reading (FORMAT §4) ───────────────────────────────────────────────────────────────────────

const fail = (code: ErrorCode, message: string): ReadResult => ({ ok: false, code, message });

/** Read a fragment (with or without the leading `#`). A locked Moin needs `password`. */
export async function read(fragment: string, password?: string): Promise<ReadResult> {
  const text = fragment.startsWith('#') ? fragment : `#${fragment}`;
  if (text.length > LIMITS.link) return fail('too-long', `This link is too long to be a Moin (${text.length} characters, at most ${LIMITS.link}).`);
  const head = /^#m(\d+)(l?)\./.exec(text);
  if (!head) return fail('not-a-moin', 'This is not a Moin link.');
  if (head[1] !== '1') return fail('unsupported-version', `This Moin uses format version ${head[1]}; this app reads version 1.`);
  const locked = head[2] === 'l';
  const parts = text.slice(head[0].length).split('.');
  if (parts.length !== (locked ? 3 : 1)) return fail('not-a-moin', 'This Moin link has the wrong number of parts.');

  let packed: Uint8Array;
  if (locked) {
    const [salt, iv, data] = parts.map(fromBase64url);
    if (!salt || !iv || !data) return fail('malformed', 'This Moin link is malformed: it is not valid base64url.');
    if (salt.length !== 16 || iv.length !== 12) return fail('malformed', 'This Moin link is malformed: its salt or IV has the wrong length.');
    if (password === undefined) return fail('locked', 'This Moin is locked with a password.');
    try {
      const key = await keyFor(password, salt);
      packed = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource, additionalData: AAD }, key, data as BufferSource));
    } catch {
      return fail('wrong-password', 'That password does not open this Moin — or the link was damaged on the way.');
    }
  } else {
    const data = fromBase64url(parts[0] ?? '');
    if (!data) return fail('malformed', 'This Moin link is malformed: it is not valid base64url.');
    packed = data;
  }

  let json: unknown;
  try {
    json = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(await inflate(packed)));
  } catch {
    return fail('malformed', 'This Moin link is malformed: its contents do not unpack.');
  }
  const moin = fromWire(json);
  if (typeof moin === 'string') return fail('invalid', `This Moin is invalid: ${moin}.`);
  const problems = validate(moin);
  if (problems.length) return fail('invalid', `This Moin is invalid: ${problems.join('; ')}.`);
  return { ok: true, locked, moin };
}
