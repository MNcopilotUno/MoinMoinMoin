import { decode, encode } from './base64url.js';
import { TesseraError } from './errors.js';
import { SECRET_BYTES, type Secret } from './keys.js';

/** Domain separation: one secret, one derived AES key per purpose (tessera.md, Keys). */
export type Purpose = 'hop-content' | 'chain-key' | 'hop-key';

const VERSION = 1;
const NONCE = 12;
const SALT = new TextEncoder().encode('tessera/v1');
const text = new TextEncoder();

async function aesKey(secret: Secret, purpose: Purpose): Promise<CryptoKey> {
  if (secret.length !== SECRET_BYTES) throw new TesseraError('bad-key', 'a secret is 16 bytes');
  const base = await crypto.subtle.importKey('raw', secret, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: SALT, info: text.encode(purpose) },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** `0x01 ‖ nonce(12) ‖ AES-GCM-256(bytes) ‖ tag(16)`, base64url. `aad` binds the box to its place. */
export async function seal(secret: Secret, purpose: Purpose, bytes: Uint8Array<ArrayBuffer>, aad: string): Promise<string> {
  const key = await aesKey(secret, purpose);
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE));
  const body = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, additionalData: text.encode(aad) }, key, bytes));
  const out = new Uint8Array(1 + NONCE + body.length);
  out[0] = VERSION;
  out.set(nonce, 1);
  out.set(body, 1 + NONCE);
  return encode(out);
}

/** Opens a box or throws `TesseraError('locked')` — whatever was wrong. */
export async function open(secret: Secret, purpose: Purpose, box: string, aad: string): Promise<Uint8Array<ArrayBuffer>> {
  let raw: Uint8Array<ArrayBuffer>;
  try {
    raw = decode(box);
  } catch {
    throw new TesseraError('locked');
  }
  if (raw.length < 1 + NONCE + 16 || raw[0] !== VERSION) throw new TesseraError('locked');
  const key = await aesKey(secret, purpose);
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: raw.slice(1, 1 + NONCE), additionalData: text.encode(aad) },
      key,
      raw.slice(1 + NONCE),
    );
    return new Uint8Array(plain);
  } catch {
    throw new TesseraError('locked');
  }
}

/** Where a box lives, as additional data: a relay that moves or re-parents it breaks it. */
export interface Place {
  readonly chainId: string;
  readonly parentId: string | null;
  readonly depth: number;
  readonly hopId: string;
}

export function placeAad({ chainId, parentId, depth, hopId }: Place): string {
  return `tessera/v1|${chainId}|${parentId ?? '-'}|${depth}|${hopId}`;
}
