import { describe, expect, it } from 'vitest';
import { fromBase64url, newSecret, open, placeAad, seal, toBase64url, type TesseraError } from '../src/index.js';

const bytes = (s: string) => new TextEncoder().encode(s);
const aad = placeAad({ chainId: 'chainAAA', parentId: null, depth: 1, hopId: 'hopAAAAA' });

async function reason(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return 'opened';
  } catch (error) {
    return (error as TesseraError).reason;
  }
}

describe('seal and open', () => {
  it('round-trips, and two seals of the same text differ (fresh nonce)', async () => {
    const k = newSecret();
    const a = await seal(k, 'hop-content', bytes('Moin'), aad);
    const b = await seal(k, 'hop-content', bytes('Moin'), aad);
    expect(a).not.toBe(b);
    expect(new TextDecoder().decode(await open(k, 'hop-content', a, aad))).toBe('Moin');
  });

  it('a box carries no plaintext', async () => {
    const box = await seal(newSecret(), 'hop-content', bytes('When the captain finally says Moin'), aad);
    expect(new TextDecoder('latin1').decode(fromBase64url(box))).not.toContain('captain');
  });

  it('a wrong key is locked', async () => {
    const box = await seal(newSecret(), 'hop-content', bytes('Moin'), aad);
    expect(await reason(open(newSecret(), 'hop-content', box, aad))).toBe('locked');
  });

  it('a wrong purpose is locked (domain separation)', async () => {
    const k = newSecret();
    const box = await seal(k, 'hop-content', bytes('Moin'), aad);
    expect(await reason(open(k, 'chain-key', box, aad))).toBe('locked');
  });

  it('every single changed byte is locked (GCM tag)', async () => {
    const k = newSecret();
    const raw = fromBase64url(await seal(k, 'hop-content', bytes('Moin moin'), aad));
    for (let i = 0; i < raw.length; i++) {
      const bad = raw.slice();
      bad[i] = bad[i]! ^ 1;
      expect(await reason(open(k, 'hop-content', toBase64url(bad), aad)), `byte ${i}`).toBe('locked');
    }
  });

  it('a truncated box, garbage and an unknown version are locked', async () => {
    const k = newSecret();
    const box = await seal(k, 'hop-content', bytes('Moin'), aad);
    const raw = fromBase64url(box);
    const v2 = raw.slice();
    v2[0] = 2;
    expect(await reason(open(k, 'hop-content', box.slice(0, 30), aad))).toBe('locked');
    expect(await reason(open(k, 'hop-content', 'not a box!', aad))).toBe('locked');
    expect(await reason(open(k, 'hop-content', toBase64url(v2), aad))).toBe('locked');
  });

  it('a box moved to another place is locked (AAD)', async () => {
    const k = newSecret();
    const box = await seal(k, 'hop-content', bytes('Moin'), aad);
    for (const other of [
      { chainId: 'chainBBB', parentId: null, depth: 1, hopId: 'hopAAAAA' },
      { chainId: 'chainAAA', parentId: 'hopZZZZZ', depth: 1, hopId: 'hopAAAAA' },
      { chainId: 'chainAAA', parentId: null, depth: 2, hopId: 'hopAAAAA' },
      { chainId: 'chainAAA', parentId: null, depth: 1, hopId: 'hopBBBBB' },
    ]) expect(await reason(open(k, 'hop-content', box, placeAad(other)))).toBe('locked');
  });

  it('refuses a secret that is not 16 bytes', async () => {
    expect(await reason(seal(new Uint8Array(15), 'hop-content', bytes('x'), aad))).toBe('bad-key');
  });
});
