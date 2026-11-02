import { describe, expect, it } from 'vitest';
import { domi } from '../src/copy/domi.js';
import source from '../src/copy/domi.ts?raw';

/** Every string in the copy, with its path; functions are called with sample arguments. */
function leaves(value: unknown, path = 'domi'): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, `${path}[${i}]`));
  if (typeof value === 'object' && value !== null) return Object.entries(value).flatMap(([k, v]) => leaves(v, `${path}.${k}`));
  return [];
}

describe('Moin Domi copy (CLAUDE.md §7)', () => {
  it('imports nothing, so the subpath stays light (no barrel, no paintings)', () => {
    expect(source).not.toMatch(/^\s*import\s/m);
    expect(source).not.toMatch(/\bimport\(/);
  });

  it('writes ’ and never a straight apostrophe', () => {
    const straight = leaves(domi).filter(([, s]) => /[A-Za-z]'[A-Za-z]/.test(s));
    expect(straight).toEqual([]);
  });

  it('has no empty entry except the silent bubble', () => {
    const empty = leaves(domi).filter(([path, s]) => s === '' && path !== 'domi.bubble.none');
    expect(empty).toEqual([]);
  });

  it.each([
    [domi.common.step(2), '2 of 3'],
    [domi.home.chainLine(3, 6, 'Moin · Moin'), 'Stop 3 of 6 · Moin · Moin'],
    [domi.home.postcardLine('Moin', '3 November'), 'Moin · until 3 November'],
    [domi.rules.branches.spoken(1), 'one person'],
    [domi.rules.branches.spoken(3), '3 people'],
    [domi.rules.budget.spoken(1), 'one word'],
    [domi.rules.fewer('Stops', '6 people'), 'Fewer: Stops, now 6 people'],
    [domi.rules.nameHint('', false), 'Letters, numbers and hyphens, 3 to 32.'],
    [domi.rules.nameHint('ab', true), '…/m/ab — too short or not allowed'],
    [domi.ready.chainBody(2, 6), 'Send it to one person. They are stop 2 of 6.'],
    [domi.ready.lockFailed('The relay didn’t answer. Try again in a moment.'), 'The password couldn’t be set (The relay didn’t answer. Try again in a moment.) This link opens with its key instead.'],
    [domi.turn.left(1, 1), '1 of 1 word left'],
    [domi.turn.left(0, 2), '0 of 2 words left'],
    [domi.turn.swapFor('Moin'), 'Swap “Moin” for…'],
    [domi.turn.bubbleSays(''), 'The bubble now says nothing'],
    [domi.tree.label(1, 1, 6), 'A tree of 1 version over 1 of 6 stops.'],
    [domi.tree.node(2, true, { top: 'Moin', bottom: 'moin' }), 'Stop 2, yours: Moin moin'],
    [domi.tree.node(3, false, null), 'Stop 3: unreadable'],
    [domi.tree.detail(1, true, 'Hein'), 'Stop 1 · yours · Hein'],
    [domi.tree.intro(true, '3 November'), 'You’re in. Now you see every version. Gone after 3 November.'],
    [domi.finale.kicker(6), 'Stop 6 of 6 · the last stop'],
    [domi.yours.line(domi.yours.started(6), domi.yours.until('3 November')), 'You started it · 6 stops · gone after 3 November'],
    [domi.settings.rememberNickHint('Hein'), 'Keeps “Hein” here, so you needn’t type it each time'],
    [domi.settings.rememberNickHint(''), 'Keeps the name you sign with here, on this phone'],
    [domi.meme.caption('', ''), 'no words'],
    [domi.meme.caption('Moin', 'moin'), 'Moin / moin'],
    [domi.meme.label('the grumpy captain', 'grumpy', 'at the harbour', ['a “Moin” bubble', 'a gull'], 'Moin'), 'Meme: the grumpy captain, grumpy, at the harbour, with a “Moin” bubble and a gull. “Moin”'],
    [domi.meme.label('a fisherman', 'smiling', 'on the open water', [], 'no words'), 'Meme: a fisherman, smiling, on the open water. “no words”'],
  ])('%#: %s', (got, want) => {
    expect(got).toBe(want);
  });

  it('keeps a sentence with marked words whole, in parts', () => {
    expect(domi.rules.touchHint.join('')).toBe('Each stop also gets one small touch. Passing it on unchanged is fine too. At most 100 stops in a whole tree.');
    expect(domi.about.reportHow.join('')).toBe('To report a chain, use Report this chain under a meme: it puts the full link in the mail for you.');
    expect(domi.about.reportHow[1]).toBe(domi.report.link);
    expect(domi.postcard.from('Hein').join('')).toBe('Moin from Hein');
  });

  it('writes the report mail with the link on its own line', () => {
    const body = domi.report.body('https://x/m/abcdefgh#key');
    expect(body.split('\n')[1]).toBe('https://x/m/abcdefgh#key');
    expect(body.endsWith('I believe in good faith that this report is accurate and complete.')).toBe(true);
  });
});
