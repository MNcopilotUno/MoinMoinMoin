import { describe, expect, it } from 'vitest';
import {
  formatLockLink, isLockName, LockRefusal, lockHop, lockKeys, lockNameIn, openHop, passwordProblem, slugify, startChain,
  TesseraError, toBase64url, unlockHop, type Relay,
} from '../src/index.js';
import { fakeRelay } from './fake-relay.js';

const bytes = (s: string) => new TextEncoder().encode(s);
const PW = 'Möwe Teer Nebel Kutter';
const limits = { maxStops: 6, maxBranches: 1 };

async function reason(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return 'ok';
  } catch (error) {
    return (error as TesseraError).reason;
  }
}

describe('password and custom links (D12, D13)', () => {
  it('a password link opens with its password and gives the hop’s own secret', async () => {
    const { relay } = fakeRelay();
    const { hop } = await startChain(relay, limits, bytes('v1'));
    const { name } = await lockHop(relay, hop, PW);
    expect(isLockName(name)).toBe(true);
    const { hopId, secret } = await unlockHop(relay, name, PW);
    expect(hopId).toBe(hop.hopId);
    expect(secret).toEqual(hop.secret);
    expect(new TextDecoder().decode((await openHop(relay, hopId, secret)).content)).toBe('v1');
  });

  it('a custom name: taken names are refused, bad names never sent', async () => {
    const { relay } = fakeRelay();
    const { hop } = await startChain(relay, limits, bytes('v1'));
    await lockHop(relay, hop, PW, 'kapitaen-hein');
    expect(await reason(lockHop(relay, hop, PW, 'kapitaen-hein'))).toBe('conflict');
    for (const bad of ['ab', 'Kapitaen', '-hein', 'hein-', 'kap--hein', 'admin', 'x'.repeat(33), 'hein hein']) {
      expect(await reason(lockHop(relay, hop, PW, bad)), bad).toBe('bad-name');
    }
  });

  it('a wrong password is refused and the relay never learns the password', async () => {
    const { relay, locks } = fakeRelay();
    const { hop } = await startChain(relay, limits, bytes('v1'));
    const { name } = await lockHop(relay, hop, PW);
    expect(await reason(unlockHop(relay, name, 'Möwe Teer Nebel Kutterx'))).toBe('wrong-password');
    expect(JSON.stringify([...locks.values()])).not.toMatch(/Möwe|Teer|Nebel|Kutter/);
  });

  it('after five wrong tries it slows down: 1 minute, then 2; the right one resets it', async () => {
    const { relay, tick } = fakeRelay();
    const { hop } = await startChain(relay, limits, bytes('v1'));
    const { name } = await lockHop(relay, hop, PW);
    for (let i = 0; i < 4; i++) expect(await reason(unlockHop(relay, name, `wrong guess number ${i}`))).toBe('wrong-password');
    const fifth = await unlockHop(relay, name, 'wrong guess number 5').catch((e: unknown) => e as LockRefusal);
    expect(fifth).toBeInstanceOf(LockRefusal);
    expect((fifth as LockRefusal).waitUntil).toBe(60_000);
    expect(await reason(unlockHop(relay, name, PW))).toBe('wait');
    tick(60_000);
    const sixth = await unlockHop(relay, name, 'wrong guess number 6').catch((e: unknown) => e as LockRefusal);
    expect((sixth as LockRefusal).waitUntil).toBe(60_000 + 120_000);
    tick(120_000);
    expect((await unlockHop(relay, name, PW)).hopId).toBe(hop.hopId);
    expect(await reason(unlockHop(relay, name, 'wrong again but counted from zero'))).toBe('wrong-password');
  });

  it('a relay that swaps the hop id behind a lock gives a box that will not open', async () => {
    const { relay, locks } = fakeRelay();
    const one = (await startChain(relay, limits, bytes('one'))).hop;
    const two = (await startChain(relay, limits, bytes('two'))).hop;
    const { name } = await lockHop(relay, one, PW);
    (locks.get(name) as { hopId: string }).hopId = two.hopId;
    expect(await reason(unlockHop(relay, name, PW))).toBe('locked');
  });

  it('refuses a weak password before anything is sent', async () => {
    const calls: string[] = [];
    const spy = new Proxy({} as Relay, { get: (_, k) => async () => { calls.push(String(k)); throw new Error('no'); } });
    const hop = { chainId: 'chainAAA', hopId: 'hopAAAAA', parentId: null, depth: 1, secret: new Uint8Array(16) };
    expect(await reason(lockHop(spy, hop, 'moinmoin'))).toBe('weak-password');
    expect(calls).toEqual([]);
  });

  it('refuses an unreasonable key derivation (a lock made to freeze phones)', async () => {
    expect(await reason(lockKeys(PW, new Uint8Array(16), { m: 1 << 20, t: 2, p: 1 }))).toBe('locked');
    expect(await reason(lockKeys(PW, new Uint8Array(16), { m: 19456, t: 99, p: 1 }))).toBe('locked');
  });

  it('derivation is deterministic and splits auth from wrap', async () => {
    const salt = new Uint8Array(16).fill(7);
    const a = await lockKeys(PW, salt), b = await lockKeys(PW.normalize('NFD'), salt);
    expect(a).toEqual(b); // NFC: "ö" typed two ways is one password
    expect(a.authKey).not.toBe(toBase64url(a.wrapKey));
    expect(a.authKey).toHaveLength(43);
    expect(a.wrapKey).toHaveLength(16);
  });
});

describe('password strength and names', () => {
  it.each([
    ['moinmoin', 'common'], ['Hamburg', 'common'], ['hafen', 'too-short'], ['zwei worte', 'too-short'],
    ['drei kleine worte', null], ['Möwe-Teer-Nebel', null], ['twelvecharsx', null],
  ])('%s → %s', (pw, problem) => {
    expect(passwordProblem(pw)).toBe(problem);
  });
  it('slugifies German names', () => {
    expect(slugify('Kapitän Hein!')).toBe('kapitaen-hein');
    expect(slugify('  Straße am Hafen  ')).toBe('strasse-am-hafen');
    expect(slugify('Café Möwe')).toBe('cafe-moewe');
  });
  it('lock links carry no key and are recognised only without one', () => {
    const base = 'https://example.org/domi/';
    expect(formatLockLink(base, 'kapitaen-hein')).toBe('https://example.org/domi/m/kapitaen-hein');
    expect(lockNameIn('https://example.org/domi/m/kapitaen-hein')).toBe('kapitaen-hein');
    expect(lockNameIn('https://example.org/domi/?m=abcdEFGH')).toBe('abcdEFGH');
    expect(lockNameIn('https://example.org/domi/m/abcdEFGH#AAAAAAAAAAAAAAAAAAAAAA')).toBeNull();
    expect(lockNameIn('https://example.org/domi/m/Bad Name')).toBeNull();
    expect(() => formatLockLink(base, 'x')).toThrow(TesseraError);
  });
});
