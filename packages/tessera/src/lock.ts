import { argon2id } from 'hash-wasm';
import { decode, encode } from './base64url.js';
import type { HopKey } from './chain.js';
import { TesseraError } from './errors.js';
import { isId, newId, type Secret } from './keys.js';
import type { Kdf, Relay } from './relay.js';
import { open, seal } from './seal.js';

/**
 * Password and custom links (D12, D13), after the A2 proposal (`.agents/features/password-links.md`).
 * Argon2id stretches the password into 48 bytes: the first 32 prove it to the relay (`authKey`,
 * stored there only as SHA-256), the last 16 seal the hop's secret (`wrapKey`, never sent).
 */
export const KDF: Kdf = { m: 19456, t: 2, p: 1 }; // OWASP minimum for Argon2id
export const KDF_LIMITS = { m: [8192, 65536], t: [1, 10], p: [1, 4] } as const;

const RESERVED = new Set(['m', 'v1', 'api', 'admin', 'health', 'locks', 'share', 'domi', 'moin', 'help', 'about', 'report']);
const SLUG = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/** A name a person chooses (D13): 3–32 of a–z 0–9 and single hyphens, a letter first, not reserved. */
export function isCustomName(name: string): boolean {
  return name.length >= 3 && name.length <= 32 && SLUG.test(name) && !RESERVED.has(name);
}

/** Any lock name in a link: a custom name, or the random id the app picks for a plain password link. */
export function isLockName(name: string): boolean {
  return isId(name) || isCustomName(name);
}

/** "Kapitän Hein!" → "kapitaen-hein". */
export function slugify(text: string): string {
  return text.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32).replace(/-+$/, '');
}

const COMMON = new Set(['password', 'passwort', 'qwertz', 'qwerty', '123456', '12345678', '123456789', 'moinmoin', 'moin', 'hallo', 'hamburg', 'iloveyou', 'letmein', 'sommer', 'schatz', 'geheim', 'admin', 'welcome', 'football', 'fussball']);

/** D12: "minimum strength is enforced" — three words, or twelve characters, and not a common one. */
export function passwordProblem(password: string): 'too-short' | 'common' | null {
  const p = password.normalize('NFC').trim();
  const words = p.split(/[\s\-_.]+/).filter((w) => w.length >= 2);
  if (COMMON.has(p.toLowerCase().replace(/[\s\-_.]/g, ''))) return 'common';
  if (words.length < 3 && [...p].length < 12) return 'too-short';
  return null;
}

export async function lockKeys(password: string, salt: Uint8Array, kdf: Kdf = KDF): Promise<{ authKey: string; verifier: string; wrapKey: Secret }> {
  const within = (v: number, [lo, hi]: readonly [number, number]) => Number.isInteger(v) && v >= lo && v <= hi;
  if (!within(kdf.m, KDF_LIMITS.m) || !within(kdf.t, KDF_LIMITS.t) || !within(kdf.p, KDF_LIMITS.p)) throw new TesseraError('locked', 'unreasonable kdf');
  const out = await argon2id({ password: password.normalize('NFC'), salt, parallelism: kdf.p, iterations: kdf.t, memorySize: kdf.m, hashLength: 48, outputType: 'binary' });
  const auth = out.slice(0, 32);
  const verifier = new Uint8Array(await crypto.subtle.digest('SHA-256', auth));
  return { authKey: encode(auth), verifier: encode(verifier), wrapKey: out.slice(32, 48) as Secret };
}

export const lockAad = (name: string, hopId: string): string => `tessera/v1|lock|${name}|${hopId}`;

/** Puts a password on a hop. Without a name, a random one is chosen (retrying if taken). */
export async function lockHop(relay: Relay, hop: HopKey, password: string, name?: string): Promise<{ name: string }> {
  if (passwordProblem(password)) throw new TesseraError('weak-password', passwordProblem(password)!);
  if (name !== undefined && !isCustomName(name)) throw new TesseraError('bad-name');
  for (let attempt = 1; ; attempt++) {
    const lockName = name ?? newId();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const { verifier, wrapKey } = await lockKeys(password, salt, KDF);
    const wrapped = await seal(wrapKey, 'lock-key', hop.secret, lockAad(lockName, hop.hopId));
    try {
      await relay.createLock({ name: lockName, hopId: hop.hopId, salt: encode(salt), kdf: KDF, verifier, wrapped });
      return { name: lockName };
    } catch (error) {
      if (name !== undefined || !(error instanceof TesseraError && error.reason === 'conflict') || attempt >= 4) throw error;
    }
  }
}

/** Opens a lock with its password: the hop id and its secret, ready for `openHop`. */
export async function unlockHop(relay: Relay, name: string, password: string): Promise<{ hopId: string; secret: Secret }> {
  const { salt, kdf } = await relay.getLock(name);
  const { authKey, wrapKey } = await lockKeys(password, decode(salt), kdf);
  const { hopId, wrapped } = await relay.openLock(name, authKey);
  const secret = (await open(wrapKey, 'lock-key', wrapped, lockAad(name, hopId))) as Secret;
  if (secret.length !== 16) throw new TesseraError('locked');
  return { hopId, secret };
}

/** `<base>m/<name>` — no `#`: the password is the key (D12, D13). */
export function formatLockLink(base: string, name: string): string {
  if (!isLockName(name)) throw new TesseraError('bad-name');
  return `${base.endsWith('/') ? base : `${base}/`}m/${name}`;
}

/** The lock name in `…/m/<name>` (or `?m=<name>`) when the link carries no key; otherwise `null`. */
export function lockNameIn(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.hash.replace(/^#/, '') !== '') return null;
  const path = /\/m\/([^/]+)\/?$/.exec(url.pathname);
  const name = path ? decodeURIComponent(path[1] ?? '') : url.searchParams.get('m');
  return name !== null && isLockName(name) ? name : null;
}
