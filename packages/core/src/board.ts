import { MAX_PEOPLE, MAX_SIZE, MIN_PEOPLE } from './constants.js';
import type { BoardSpec, Game, PersonCell } from './types.js';

export class BoardError extends Error {
  override readonly name = 'BoardError';
}

/** Index a static board. Throws `BoardError` on a board the rules do not allow (§1). */
export function createGame(spec: BoardSpec): Game {
  const { width, height, cells } = spec;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new BoardError(`grid ${width} × ${height} is not a positive whole size`);
  }
  if (width > MAX_SIZE || height > MAX_SIZE) {
    throw new BoardError(`grid ${width} × ${height} is larger than ${MAX_SIZE} × ${MAX_SIZE}`);
  }
  const grid: number[] = new Array<number>(width * height).fill(-1);
  const personGrid: number[] = new Array<number>(width * height).fill(-1);
  const people: PersonCell[] = [];
  cells.forEach((cell, i) => {
    const { x, y } = cell;
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= width || y >= height) {
      throw new BoardError(`cell (${x}, ${y}) is outside the ${width} × ${height} grid`);
    }
    const at = y * width + x;
    if (grid[at] !== -1) {
      throw new BoardError(`two cells on square (${x}, ${y})`);
    }
    grid[at] = i;
    if (cell.kind === 'person') {
      personGrid[at] = people.length;
      people.push(cell);
    }
  });
  if (people.length < MIN_PEOPLE || people.length > MAX_PEOPLE) {
    throw new BoardError(`${people.length} people; a level has ${MIN_PEOPLE}–${MAX_PEOPLE}`);
  }
  return { width, height, cells, people, grid, personGrid };
}

export function inBounds(game: Game, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < game.width && y < game.height;
}

/** Index into `game.people` of the person on (x, y), or -1. */
export function personAt(game: Game, x: number, y: number): number {
  if (!inBounds(game, x, y)) return -1;
  return game.personGrid[y * game.width + x] ?? -1;
}
