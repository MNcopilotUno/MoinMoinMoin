import { describe, expect, it } from 'vitest';
import { GAME_NAME } from '@moin/core';
import { noteFor, shareText, TUNE } from '../src/index.js';

describe('the chain tune', () => {
  it('climbs one note per Moin on a pentatonic scale and tops out', () => {
    expect([0, 1, 2, 3, 4, 5].map(noteFor)).toEqual([0, 2, 4, 7, 9, 12]);
    expect(noteFor(99)).toBe(TUNE[TUNE.length - 1]);
    expect(noteFor(-1)).toBe(0);
    for (let i = 1; i < TUNE.length; i++) expect(TUNE[i]!).toBeGreaterThan(TUNE[i - 1]!);
  });
});

describe('daily share text', () => {
  const board = { width: 3, height: 2, cells: [
    { x: 0, y: 0, kind: 'person' as const, facing: 'E' as const, needs: 1 as const },
    { x: 2, y: 0, kind: 'person' as const, facing: 'S' as const, needs: 2 as const },
    { x: 1, y: 1, kind: 'seagull' as const },
    { x: 2, y: 1, kind: 'fender' as const, slant: 'falling' as const },
  ] };

  it('names the game and day, the stars and taps, and maps the woken harbour', () => {
    expect(shareText('2026-10-24', board, 4, 3, 2)).toBe(
      `${GAME_NAME} · daily 2026-10-24\n⭐⭐☆ 4 taps (par 3)\n😊🟦😄\n🟦🐦↘️`,
    );
  });

  it('is text only: no link, no URL', () => {
    expect(shareText('2026-10-24', board, 1, 1, 3)).not.toMatch(/https?:|www\./);
  });
});
