import { CELL, HALF_CELL, SPEED } from './constants.js';
import type {
  BouncedEvent,
  Facing,
  Game,
  LaunchedEvent,
  PersonCell,
  Slant,
  Target,
} from './types.js';

const DX: Readonly<Record<Facing, number>> = { N: 0, E: 1, S: 0, W: -1 };
const DY: Readonly<Record<Facing, number>> = { N: -1, E: 0, S: 1, W: 0 };

const RISING: Readonly<Record<Facing, Facing>> = { E: 'N', N: 'E', W: 'S', S: 'W' };
const FALLING: Readonly<Record<Facing, Facing>> = { E: 'S', S: 'E', W: 'N', N: 'W' };

/** R11: the direction after a fender of the given slant. */
export function deflect(dir: Facing, slant: Slant): Facing {
  return slant === 'rising' ? RISING[dir] : FALLING[dir];
}

export class FlightCapError extends Error {
  override readonly name = 'FlightCapError';
}

export interface Flight {
  /** `launched` followed by any `bounced`, in order. */
  readonly path: readonly (LaunchedEvent | BouncedEvent)[];
  readonly target: Target;
  /** Tick at which the Moin reaches its target. */
  readonly t: number;
  /** Sub-unit point where it reaches its target. */
  readonly px: number;
  readonly py: number;
  /** Cell of the person or seagull reached; for `edge`, the last cell flown over. */
  readonly x: number;
  readonly y: number;
}

/**
 * Fly the Moin of `from`, launched at tick `t0`, on the fixed step (R12).
 * Integer arithmetic only: the point moves `SPEED` sub-units per tick and every decision is taken
 * exactly on a cell boundary or a cell centre.
 */
export function fly(game: Game, from: PersonCell, t0: number): Flight {
  let dir: Facing = from.facing;
  let px = from.x * CELL + HALF_CELL;
  let py = from.y * CELL + HALF_CELL;
  let t = t0;
  const path: (LaunchedEvent | BouncedEvent)[] = [
    { type: 'launched', t, px, py, x: from.x, y: from.y, dir },
  ];
  // Termination (GAME_RULES §3): at most one visit per (cell, direction) state, 2 decisions each.
  const maxTicks = 4 * game.width * game.height * CELL + CELL;
  for (let step = 0; step <= maxTicks; step++) {
    px += DX[dir] * SPEED;
    py += DY[dir] * SPEED;
    t += 1;
    const onBoundary = DX[dir] !== 0 ? px % CELL === 0 : py % CELL === 0;
    if (onBoundary) {
      // The square the Moin is about to enter: half a cell ahead lies its centre.
      const nx = (px + DX[dir] * HALF_CELL - HALF_CELL) / CELL;
      const ny = (py + DY[dir] * HALF_CELL - HALF_CELL) / CELL;
      const cx = nx - DX[dir];
      const cy = ny - DY[dir];
      if (nx < 0 || ny < 0 || nx >= game.width || ny >= game.height) {
        return { path, target: { kind: 'edge' }, t, px, py, x: cx, y: cy };
      }
      const cellIndex = game.grid[ny * game.width + nx] ?? -1;
      const cell = cellIndex >= 0 ? game.cells[cellIndex] : undefined;
      if (cell?.kind === 'person') {
        const index = game.personGrid[ny * game.width + nx] ?? -1;
        return { path, target: { kind: 'person', index }, t, px, py, x: nx, y: ny };
      }
      if (cell?.kind === 'seagull') {
        return { path, target: { kind: 'seagull' }, t, px, py, x: nx, y: ny };
      }
      continue;
    }
    const onCentre = px % CELL === HALF_CELL && py % CELL === HALF_CELL;
    if (onCentre) {
      const x = (px - HALF_CELL) / CELL;
      const y = (py - HALF_CELL) / CELL;
      const cell = game.cells[game.grid[y * game.width + x] ?? -1];
      if (cell?.kind === 'fender') {
        dir = deflect(dir, cell.slant);
        path.push({ type: 'bounced', t, px, py, x, y, dir });
      }
    }
  }
  throw new FlightCapError(`Moin from (${from.x}, ${from.y}) exceeded ${maxTicks} ticks`);
}

/** Where each person's Moin lands, in `game.people` order. Static (R9). */
export function targets(game: Game): readonly Target[] {
  return game.people.map((p) => fly(game, p, 0).target);
}
