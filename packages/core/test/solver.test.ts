import { describe, expect, it } from 'vitest';
import { solve } from '../src/index.js';
import { board } from './helpers.js';

describe('solve', () => {
  it('one ripple across a row is par 1, and only the first person gets there', () => {
    const s = solve(board(`E1 . E1 . E1`));
    expect(s).toMatchObject({ par: 1, minimumSolutions: 1, firstTapsToPar: 1, people: 3 });
    expect(s?.solution).toEqual([{ x: 0, y: 0, taps: 1 }]);
  });

  it('a seagull splits the row into two ripples', () => {
    expect(solve(board(`E1 g E1 E1`))?.par).toBe(2);
  });

  it('a captain nobody can reach must be tapped twice', () => {
    expect(solve(board(`E2 . .`))?.par).toBe(2);
  });

  it('a ring has as many minimum solutions as people', () => {
    const s = solve(board(`
      E1 S1
      N1 W1
    `));
    expect(s).toMatchObject({ par: 1, minimumSolutions: 4, firstTapsToPar: 4 });
  });

  it('a chatterbox makes a captain free', () => {
    expect(solve(board(`E1 . E2 .`))?.par).toBe(2);
    expect(solve(board(`E1* . E2 .`))?.par).toBe(1);
  });

  it('counts minimum solutions up to the limit', () => {
    const s = solve(board(`N1 N1 N1 N1`), 2);
    expect(s).toMatchObject({ par: 4, minimumSolutions: 1, capped: false });
    const ring = solve(board(`E1 S1
      N1 W1`), 2);
    expect(ring).toMatchObject({ minimumSolutions: 2, capped: true });
  });
});
