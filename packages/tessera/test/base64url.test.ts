import { describe, expect, it } from 'vitest';
import { fromBase64url, toBase64url, TesseraError } from '../src/index.js';

describe('base64url', () => {
  it('round-trips every length from 0 to 64 bytes', () => {
    for (let n = 0; n <= 64; n++) {
      const bytes = Uint8Array.from({ length: n }, (_, i) => (i * 37 + n) & 255);
      expect(fromBase64url(toBase64url(bytes))).toEqual(bytes);
    }
  });
  it('matches RFC 4648 test vectors without padding', () => {
    const enc = (s: string) => toBase64url(new TextEncoder().encode(s));
    expect([enc(''), enc('f'), enc('fo'), enc('foo'), enc('foob'), enc('fooba'), enc('foobar')]).toEqual(['', 'Zg', 'Zm8', 'Zm9v', 'Zm9vYg', 'Zm9vYmE', 'Zm9vYmFy']);
    expect(toBase64url(Uint8Array.of(0xfb, 0xff))).toBe('-_8');
  });
  it.each([['A', 'impossible length'], ['Zm9v=', 'padding'], ['Zm+v', 'plus'], ['Zm/v', 'slash'], ['Zh', 'non-canonical tail'], ['Zm9 ', 'space']])('rejects %s (%s)', (text) => {
    expect(() => fromBase64url(text)).toThrow(TesseraError);
  });
});
