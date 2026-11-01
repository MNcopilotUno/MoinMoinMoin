import { describe, expect, it } from 'vitest';
import { checkTurn, FIRST_MEME, swapWord, touchesChanged, words, wordsChanged, type Meme } from '../src/index.js';

const m = FIRST_MEME;

describe('a turn (D3–D5)', () => {
  it('passing on unchanged is allowed (D5)', () => {
    expect(checkTurn(m, m, 1)).toBeNull();
  });
  it('one word swapped at budget 1 is allowed', () => {
    const next = swapWord(m, 2, 'gull');
    expect(next.top).toBe('When the gull');
    expect(checkTurn(m, next, 1)).toBeNull();
  });
  it('two words at budget 1 are rejected; at budget 2 allowed', () => {
    const next = swapWord(swapWord(m, 2, 'gull'), 4, 'sings');
    expect(wordsChanged(m, next)).toBe(2);
    expect(checkTurn(m, next, 1)).toBe('words');
    expect(checkTurn(m, next, 2)).toBeNull();
  });
  it('one touch is allowed, two are not', () => {
    expect(checkTurn(m, { ...m, gull: true }, 1)).toBeNull();
    expect(checkTurn(m, { ...m, gull: true, bubble: 'none' }, 1)).toBe('touch');
    expect(touchesChanged(m, { ...m, mood: 'grumpy', gull: true })).toEqual(['gull', 'mood']);
  });
  it('weather is one touch, and not on top of another', () => {
    expect(checkTurn(m, { ...m, weather: 'fog' }, 1)).toBeNull();
    expect(checkTurn(m, { ...m, weather: 'rain', gull: true }, 1)).toBe('touch');
  });
  it('a word and a touch together are allowed', () => {
    expect(checkTurn(m, { ...swapWord(m, 0, 'If'), gull: true }, 1)).toBeNull();
  });
  it('the budget travels with the meme and cannot be raised by a turn', () => {
    const two = { ...m, budget: 2 };
    const next = swapWord(swapWord(two, 2, 'gull'), 4, 'sings');
    expect(checkTurn(two, next)).toBeNull();
    expect(checkTurn(m, { ...swapWord(swapWord(m, 2, 'gull'), 4, 'sings'), budget: 2 })).toBe('template');
  });
  it('changing the cast member or the place is rejected', () => {
    expect(checkTurn(m, { ...m, who: 'kid' }, 3)).toBe('template');
    expect(checkTurn(m, { ...m, where: 'ferry' }, 3)).toBe('template');
  });
  it('adding or removing a word is rejected (words are swapped in place)', () => {
    const longer: Meme = { ...m, top: 'When the old captain' };
    expect(checkTurn(m, longer, 3)).toBe('shape');
  });
  it('a new nickname is not a change', () => {
    expect(checkTurn(m, { ...m, nick: 'Hein' }, 1)).toBeNull();
  });
  it('swapWord counts over both captions, squeezes phrases and ignores nonsense', () => {
    expect(words(m)).toEqual(['When', 'the', 'captain', 'finally', 'says', 'Moin']);
    expect(swapWord(m, 5, 'a  Moin').bottom).toBe('finally says aMoin');
    expect(swapWord(m, 9, 'x')).toEqual(m);
    expect(swapWord(m, 0, '   ')).toEqual(m);
    expect(swapWord(m, 0, 'x'.repeat(25))).toEqual(m);
  });
});
