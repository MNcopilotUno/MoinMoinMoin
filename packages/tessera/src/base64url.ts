import { TesseraError } from './errors.js';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const INDEX = new Map([...ALPHABET].map((c, i) => [c, i]));

/** RFC 4648 §5 base64url, no padding. */
export function encode(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!, b = bytes[i + 1], c = bytes[i + 2];
    out += ALPHABET[a >> 2]!;
    out += ALPHABET[((a & 3) << 4) | ((b ?? 0) >> 4)]!;
    if (b !== undefined) out += ALPHABET[((b & 15) << 2) | ((c ?? 0) >> 6)]!;
    if (c !== undefined) out += ALPHABET[c & 63]!;
  }
  return out;
}

/** Strict decode: rejects padding, foreign characters, impossible lengths and non-canonical tails. */
export function decode(text: string): Uint8Array<ArrayBuffer> {
  if (text.length % 4 === 1) throw new TesseraError('bad-encoding', 'impossible length');
  const values: number[] = [];
  for (const ch of text) {
    const v = INDEX.get(ch);
    if (v === undefined) throw new TesseraError('bad-encoding', 'not base64url');
    values.push(v);
  }
  const out = new Uint8Array(Math.floor((values.length * 6) / 8));
  let acc = 0, bits = 0, o = 0;
  for (const v of values) {
    acc = (acc << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[o++] = (acc >> bits) & 255;
    }
  }
  if (bits > 0 && (acc & ((1 << bits) - 1)) !== 0) throw new TesseraError('bad-encoding', 'non-canonical');
  return out;
}
