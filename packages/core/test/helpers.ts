import fc from 'fast-check';
import { createGame } from '../src/index.js';
import type { BoardSpec, Cell, Facing, Game } from '../src/index.js';

/**
 * Build a board from rows of space-separated tokens:
 * `.` water, `g` seagull, `/` rising fender, `\` falling fender,
 * `E1` person facing east needing 1 greeting, `N2` facing north needing 2, …;
 * a trailing `*` makes a chatterbox (`E1*`, R13).
 */
export function spec(rows: string): BoardSpec {
  const lines = rows.trim().split('\n').map((l) => l.trim().split(/\s+/));
  const cells: Cell[] = [];
  lines.forEach((tokens, y) =>
    tokens.forEach((tok, x) => {
      if (tok === '.') return;
      if (tok === 'g') cells.push({ x, y, kind: 'seagull' });
      else if (tok === '/') cells.push({ x, y, kind: 'fender', slant: 'rising' });
      else if (tok === '\\') cells.push({ x, y, kind: 'fender', slant: 'falling' });
      else {
        const facing = tok[0] as Facing;
        const needs = Number(tok[1]) as 1 | 2;
        if (!'NESW'.includes(facing) || (needs !== 1 && needs !== 2)) throw new Error(`bad token ${tok}`);
        cells.push({ x, y, kind: 'person', facing, needs, ...(tok[2] === '*' ? { chatterbox: true } : {}) });
      }
    }),
  );
  return { width: lines[0]?.length ?? 0, height: lines.length, cells };
}

export function board(rows: string): Game {
  return createGame(spec(rows));
}

const facing = fc.constantFrom<Facing>('N', 'E', 'S', 'W');
const token = fc.oneof(
  { weight: 4, arbitrary: fc.constant('.') },
  { weight: 4, arbitrary: fc.tuple(facing, fc.constantFrom(1, 2, 1), fc.constantFrom('', '', '', '*')).map(([f, n, c]) => `${f}${n}${c}`) },
  { weight: 1, arbitrary: fc.constant('g') },
  { weight: 2, arbitrary: fc.constantFrom('/', '\\') },
);

/** Random small boards with at least one person. */
export const arbBoard = (maxSide = 5): fc.Arbitrary<Game> =>
  fc
    .tuple(fc.integer({ min: 1, max: maxSide }), fc.integer({ min: 1, max: maxSide }))
    .chain(([w, h]) => fc.array(fc.array(token, { minLength: w, maxLength: w }), { minLength: h, maxLength: h }))
    .filter((rows) => {
      const people = rows.flat().filter((t) => /^[NESW]/.test(t)).length;
      return people >= 1 && people <= 16;
    })
    .map((rows) => board(rows.map((r) => r.join(' ')).join('\n')));

/** A board plus a random tap sequence over its squares (including non-people). */
export const arbBoardAndTaps = (maxSide = 5, maxTaps = 12) =>
  arbBoard(maxSide).chain((game) =>
    fc.tuple(
      fc.constant(game),
      fc.array(
        fc.tuple(fc.integer({ min: 0, max: game.width - 1 }), fc.integer({ min: 0, max: game.height - 1 })),
        { maxLength: maxTaps },
      ),
    ),
  );
