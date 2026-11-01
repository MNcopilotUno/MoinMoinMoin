import { describe, expect, it } from 'vitest';
import { decodeMeme, encodeMeme, FIRST_MEME, MemeError, memeTitle, tidy, toMeme } from '../src/index.js';

describe('the meme value', () => {
  it('round-trips through bytes', () => {
    expect(decodeMeme(encodeMeme(FIRST_MEME))).toEqual(FIRST_MEME);
  });
  it('accepts 140 characters, counting emoji as one', () => {
    const top = '🐟'.repeat(140);
    expect(toMeme({ ...FIRST_MEME, top }).top).toBe(top);
  });
  it.each([
    ['not JSON', new TextEncoder().encode('{nope')],
    ['bad UTF-8', Uint8Array.of(0x7b, 0xff, 0x7d)],
  ])('decode rejects %s', (_, bytes) => {
    expect(() => decodeMeme(bytes)).toThrow(MemeError);
  });
  it.each([
    ['an array', []],
    ['null', null],
    ['a version 2', { ...FIRST_MEME, v: 2 }],
    ['an unknown field', { ...FIRST_MEME, url: 'https://x' }],
    ['an unknown cast member', { ...FIRST_MEME, who: 'mayor' }],
    ['an unknown place', { ...FIRST_MEME, where: 'moon' }],
    ['a recoloured bubble', { ...FIRST_MEME, bubble: 'blue' }],
    ['141 characters', { ...FIRST_MEME, top: 'x'.repeat(141) }],
    ['a caption that is not text', { ...FIRST_MEME, bottom: 7 }],
    ['an untidy caption', { ...FIRST_MEME, top: ' two  spaces ' }],
    ['a control character', { ...FIRST_MEME, top: 'a\u0007b' }],
    ['a 25-character nickname', { ...FIRST_MEME, nick: 'n'.repeat(25) }],
    ['gull as a string', { ...FIRST_MEME, gull: 'yes' }],
    ['a missing mood', { ...FIRST_MEME, mood: undefined }],
    ['budget 0', { ...FIRST_MEME, budget: 0 }],
    ['unknown weather', { ...FIRST_MEME, weather: 'tornado' }],
    ['budget 4', { ...FIRST_MEME, budget: 4 }],
    ['budget 1.5', { ...FIRST_MEME, budget: 1.5 }],
  ])('rejects %s', (_, value) => {
    expect(() => toMeme(value)).toThrow(MemeError);
  });
  it('a meme stored before weather existed opens as clear', () => {
    const { weather: _w, ...old } = FIRST_MEME;
    void _w;
    expect(toMeme(old).weather).toBe('clear');
  });
  it('knows the whole cast and every place', () => {
    for (const who of ['gull', 'harbourmaster', 'netmender'] as const) expect(toMeme({ ...FIRST_MEME, who }).who).toBe(who);
    expect(toMeme({ ...FIRST_MEME, where: 'water' }).where).toBe('water');
  });
  it('tidies whitespace and control characters', () => {
    expect(tidy('  When\tthe\n\ncaptain\u2028 ')).toBe('When the captain');
  });
  it('titles a meme by its captions', () => {
    expect(memeTitle(FIRST_MEME)).toBe('When the captain finally says Moin');
    expect(memeTitle({ ...FIRST_MEME, top: '', bottom: '' })).toBe('A Moin');
  });
});
