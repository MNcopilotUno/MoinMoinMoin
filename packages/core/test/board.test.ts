import { describe, expect, it } from 'vitest';
import { BoardError, createGame, personAt } from '../src/index.js';
import type { Cell } from '../src/index.js';

const person = (x: number, y: number): Cell => ({ x, y, kind: 'person', facing: 'E', needs: 1 });

describe('createGame', () => {
  it('indexes people in cell order', () => {
    const game = createGame({ width: 3, height: 1, cells: [{ x: 1, y: 0, kind: 'seagull' }, person(2, 0), person(0, 0)] });
    expect(game.people.map((p) => p.x)).toEqual([2, 0]);
    expect(personAt(game, 0, 0)).toBe(1);
    expect(personAt(game, 1, 0)).toBe(-1);
    expect(personAt(game, -1, 0)).toBe(-1);
  });

  it.each([
    [{ width: 8, height: 2, cells: [person(0, 0)] }, /larger than 7 × 7/],
    [{ width: 0, height: 2, cells: [person(0, 0)] }, /positive whole size/],
    [{ width: 2, height: 2, cells: [person(2, 0)] }, /outside the 2 × 2 grid/],
    [{ width: 2, height: 2, cells: [person(0, 0), { x: 0, y: 0, kind: 'seagull' } as Cell] }, /two cells on square \(0, 0\)/],
    [{ width: 2, height: 2, cells: [{ x: 0, y: 0, kind: 'seagull' } as Cell] }, /0 people/],
    [{ width: 7, height: 7, cells: Array.from({ length: 17 }, (_, i) => person(i % 7, Math.floor(i / 7))) }, /17 people/],
  ])('rejects %#', (spec, message) => {
    expect(() => createGame(spec)).toThrow(BoardError);
    expect(() => createGame(spec)).toThrow(message);
  });
});
