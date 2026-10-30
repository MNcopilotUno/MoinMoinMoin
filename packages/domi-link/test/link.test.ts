import { describe, expect, it } from 'vitest';
import { encode, hasFaded, holderNumber, lock, LIMITS, passOn, read, start, validate } from '../src/index.js';
import type { Moin } from '../src/index.js';
import { anna, counting } from './helpers.js';

// docs/DOMI_FORMAT.md, mirrored.
describe('open Moins', () => {
  it('round-trips through the fragment', async () => {
    const link = await encode(anna);
    expect(link).toMatch(/^#m1\.[A-Za-z0-9_-]+$/);
    expect(await read(link)).toEqual({ ok: true, locked: false, moin: anna });
  });

  it('start() makes a Moin held by its sender', () => {
    const m = start({ wave: 'moin', words: '', from: '', day: '2026-10-30', fade: 'day', passOn: false, reach: false });
    expect(m.holders).toEqual(['']);
    expect(m.held).toBe(1);
    expect(holderNumber(m)).toBe(2);
  });
});

describe('locked Moins', () => {
  it('round-trip with the password; the link never contains it', async () => {
    const link = await lock(anna, 'kutter am kai', counting());
    expect(link).toMatch(/^#m1l\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]+$/);
    expect(link).not.toContain('kutter');
    expect(await read(link, 'kutter am kai')).toEqual({ ok: true, locked: true, moin: anna });
  });

  it('without a password the reader asks for one', async () => {
    const r = await read(await lock(anna, 'pw pw pw', counting()));
    expect(r).toMatchObject({ ok: false, code: 'locked' });
  });

  it('a wrong password fails calmly, without saying which part was wrong', async () => {
    const r = await read(await lock(anna, 'kutter am kai', counting()), 'kutter am kay');
    expect(r).toMatchObject({ ok: false, code: 'wrong-password' });
    if (!r.ok) expect(r.message).toMatch(/password|damaged/i);
  });

  it('the password is NFC-normalised (é typed two ways opens the same Moin)', async () => {
    const link = await lock(anna, 'Moin café', counting());
    expect(await read(link, 'Moin café')).toMatchObject({ ok: true });
  });

  it('every link gets a fresh salt and IV', async () => {
    const random = counting();
    expect(await lock(anna, 'pw', random)).not.toBe(await lock(anna, 'pw', random));
  });
});

describe('passing it on', () => {
  it('adds the holder and counts', () => {
    const r = passOn(anna, 'Ben');
    expect(r).toEqual({ ok: true, moin: { ...anna, holders: ['Anna', 'Ben'], held: 2 } });
  });

  it('keeps the first 24 names and goes on counting', () => {
    let m: Moin = anna;
    for (let i = 2; i <= 30; i++) {
      const r = passOn(m, `P${i}`);
      if (!r.ok) throw new Error(r.message);
      m = r.moin;
    }
    expect(m.holders).toHaveLength(24);
    expect(m.holders[0]).toBe('Anna');
    expect(m.held).toBe(30);
    expect(holderNumber(m)).toBe(31);
  });

  it('a closed Moin cannot be passed on', () => {
    expect(passOn({ ...anna, passOn: false }, 'Ben')).toMatchObject({ ok: false, code: 'closed' });
  });

  it('a name that breaks the rules is refused', () => {
    expect(passOn(anna, 'x'.repeat(LIMITS.name + 1))).toMatchObject({ ok: false, code: 'invalid' });
  });
});

describe('validation (FORMAT §2)', () => {
  const cases: [string, Partial<Moin>, RegExp][] = [
    ['unknown wave', { wave: 'hello' as never }, /wave/],
    ['words too long', { words: 'w'.repeat(81) }, /words.*80/],
    ['control characters', { words: 'a\u0007b' }, /words.*control/],
    ['no holders', { holders: [] }, /holders/],
    ['too many holders', { holders: Array(25).fill('a'), held: 25 }, /holders.*24/],
    ['name too long', { holders: ['n'.repeat(25)] }, /name.*24/],
    ['count below names', { held: 0 }, /held/],
    ['count too big', { held: 1_000_001 }, /held/],
    ['not a date', { day: '2026-02-30' }, /day/],
    ['unknown fade', { fade: 'year' as never }, /fade/],
  ];
  it.each(cases)('%s', (_name, change, message) => {
    const problems = validate({ ...anna, ...change });
    expect(problems.join(' ')).toMatch(message);
  });

  it('a valid Moin has no problems', () => {
    expect(validate(anna)).toEqual([]);
  });

  it('encode refuses an invalid Moin', async () => {
    await expect(encode({ ...anna, words: 'w'.repeat(81) })).rejects.toThrow(/80/);
  });

  it('words count code points, not UTF-16 units (80 emoji fit)', () => {
    expect(validate({ ...anna, words: '🌊'.repeat(80) })).toEqual([]);
  });
});

describe('fading (FORMAT §5)', () => {
  it.each([
    ['day', '2026-10-31', false], ['day', '2026-11-01', true],
    ['week', '2026-11-06', false], ['week', '2026-11-07', true],
    ['month', '2026-11-29', false], ['month', '2026-11-30', true],
  ] as const)('%s Moin on %s faded: %s', (fade, today, faded) => {
    expect(hasFaded({ ...anna, fade }, today)).toBe(faded);
  });
});

describe('size (the D0 gate)', () => {
  it('a locked ten-hop Moin with full words and names stays under 2 000 characters', async () => {
    let m: Moin = { ...anna, words: 'Ein Moin aus dem Hafen für dich, weil heute alle so grimmig gucken! Moin!!'.padEnd(80, '.').slice(0, 80), holders: ['Wiebke-Johanna Petersen'] };
    for (let i = 1; i < 10; i++) {
      const r = passOn(m, `Holder number ${i} Hansen`.slice(0, 24));
      if (!r.ok) throw new Error(r.message);
      m = r.moin;
    }
    const link = await lock(m, 'drei wörter reichen', counting());
    expect(m.held).toBe(10);
    expect(link.length).toBeLessThan(2000);
  });
});
