import { decode, encode } from './base64url.js';
import { TesseraError } from './errors.js';

/** A 128-bit secret (A5): a hop's `K_n` or a chain's `T`. Never an AES key itself. */
export type Secret = Uint8Array<ArrayBuffer>;

export const SECRET_BYTES = 16;
/** 22 base64url characters. */
export const SECRET_CHARS = 22;
export const ID_BYTES = 6;
/** 8 base64url characters (48 bits). */
export const ID_CHARS = 8;
const ID = /^[A-Za-z0-9_-]{8}$/;

export function newSecret(): Secret {
  return crypto.getRandomValues(new Uint8Array(SECRET_BYTES));
}

export function newId(): string {
  return encode(crypto.getRandomValues(new Uint8Array(ID_BYTES)));
}

export function isId(text: string): boolean {
  return ID.test(text);
}

export function secretToText(secret: Secret): string {
  if (secret.length !== SECRET_BYTES) throw new TesseraError('bad-key', 'a secret is 16 bytes');
  return encode(secret);
}

export function secretFromText(text: string): Secret {
  if (text.length !== SECRET_CHARS) throw new TesseraError('bad-key', 'a key is 22 characters');
  try {
    return decode(text);
  } catch {
    throw new TesseraError('bad-key', 'not base64url');
  }
}
