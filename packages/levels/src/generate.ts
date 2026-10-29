import { createGame, fly, solve, targets } from '@moin/core';
import type { Cell, Facing, Game, PersonCell, Solution } from '@moin/core';
import type { Level } from './level.generated.js';

/**
 * Deterministic level generator: the same seed gives the same level on every engine (integer
 * arithmetic only — `Math.imul` and bit operations, no `Math.random`). Used for the daily level
 * and for drafting hand-curated levels. Par always comes from the solver.
 */

/** mulberry32: a small, well-mixed 32-bit PRNG. Returns an integer in [0, 2^32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  };
}

/** Mix two integers into one seed. */
export function mix(a: number, b: number): number {
  let h = Math.imul((a >>> 0) ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (b >>> 0) ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

export interface Recipe {
  readonly width: number;
  readonly height: number;
  readonly people: readonly [number, number];
  readonly captains: readonly [number, number];
  readonly chatterboxes: readonly [number, number];
  readonly gulls: readonly [number, number];
  readonly fenders: readonly [number, number];
  readonly par: readonly [number, number];
  /** Upper bound for R10's minimum-solution count. */
  readonly maxMinimumSolutions: number;
  /** Minimum par taps on people a Moin could reach — taps that need thought. */
  readonly minChoices: number;
  /** Maximum taps forced on people nobody's Moin reaches. */
  readonly maxForced: number;
}

export interface Quality {
  readonly ok: boolean;
  readonly reasons: readonly string[];
  readonly solution: Solution | null;
}

const DIRS: readonly Facing[] = ['N', 'E', 'S', 'W'];

/**
 * What makes a generated level worth playing (CLAUDE.md §8, `.agents/lessons/puzzles.md`):
 * par in range, few minimum solutions, most first taps do NOT reach par, every gull and fender
 * on somebody's flight path, no captain nobody can reach (tap twice — no thought), and at least
 * `minChoices` par taps on people a Moin could reach (not just "tap whoever nobody faces").
 */
export function assess(game: Game, recipe: Recipe): Quality {
  const reasons: string[] = [];
  const solution = solve(game, recipe.maxMinimumSolutions + 1);
  if (solution === null) return { ok: false, reasons: ['unsolvable'], solution };
  if (solution.par < recipe.par[0] || solution.par > recipe.par[1]) reasons.push(`par ${solution.par}`);
  if (solution.minimumSolutions > recipe.maxMinimumSolutions) reasons.push('too many minimum solutions');
  if (solution.firstTapsToPar * 2 > solution.people) reasons.push('random tapping');
  const hits = targets(game);
  const bounced = new Set<string>();
  for (const p of game.people) for (const e of fly(game, p, 0).path) if (e.type === 'bounced') bounced.add(`${e.x},${e.y}`);
  const reached = new Set<number>();
  hits.forEach((h) => { if (h.kind === 'person') reached.add(h.index); });
  const robbed = new Set<string>();
  game.people.forEach((p) => {
    const f = fly(game, p, 0);
    if (f.target.kind === 'seagull') robbed.add(`${f.x},${f.y}`);
  });
  for (const c of game.cells) {
    if (c.kind === 'fender' && !bounced.has(`${c.x},${c.y}`)) reasons.push(`idle fender ${c.x},${c.y}`);
    if (c.kind === 'seagull' && !robbed.has(`${c.x},${c.y}`)) reasons.push(`idle gull ${c.x},${c.y}`);
  }
  game.people.forEach((p, i) => {
    if (p.needs === 2 && !reached.has(i)) reasons.push(`unreachable captain ${p.x},${p.y}`);
  });
  const forced = game.people.reduce((n, p, i) => n + (reached.has(i) ? 0 : p.needs), 0);
  if (solution.par - forced < recipe.minChoices) reasons.push('no real choice');
  if (forced > recipe.maxForced) reasons.push('too many forced taps');
  return { ok: reasons.length === 0, reasons, solution };
}

function between(next: () => number, [lo, hi]: readonly [number, number]): number {
  return lo + (next() % (hi - lo + 1));
}

const STEP: Readonly<Record<Facing, readonly [number, number]>> = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const TURN: Readonly<Record<'rising' | 'falling', Readonly<Record<Facing, Facing>>>> = {
  rising: { E: 'N', N: 'E', W: 'S', S: 'W' },
  falling: { E: 'S', S: 'E', W: 'N', N: 'W' },
};

/**
 * One candidate board from one seed (may still be poor; `generate` filters with `assess`).
 * Built by growing chains of greetings: each new person, fender or gull is placed on the line of
 * flight of the one before, so objects sit where Moins actually fly.
 */
export function candidate(seed: number, recipe: Recipe): Cell[] {
  const next = rng(seed);
  const { width, height } = recipe;
  const grid: (Cell | null)[] = new Array<Cell | null>(width * height).fill(null);
  const cells: Cell[] = [];
  const incoming = new Map<Cell, number>();
  const want = between(next, recipe.people);
  let captains = between(next, recipe.captains);
  let chatterboxes = between(next, recipe.chatterboxes);
  let gulls = between(next, recipe.gulls);
  let fenders = between(next, recipe.fenders);
  const at = (x: number, y: number) => (x >= 0 && y >= 0 && x < width && y < height ? grid[y * width + x] : undefined);
  const put = (cell: Cell) => { grid[cell.y * width + cell.x] = cell; cells.push(cell); return cell; };
  const replace = (old: Cell, cell: Cell) => {
    grid[cell.y * width + cell.x] = cell;
    cells[cells.indexOf(old)] = cell;
    incoming.set(cell, incoming.get(old) ?? 0);
    return cell;
  };
  const peopleCount = () => cells.filter((c) => c.kind === 'person').length;
  /** Free water squares from (x, y) going `dir`, and what blocks the ray (undefined = edge). */
  const ray = (x: number, y: number, dir: Facing) => {
    const free: [number, number][] = [];
    let [cx, cy] = [x + STEP[dir][0], y + STEP[dir][1]];
    while (at(cx, cy) === null) { free.push([cx, cy]); cx += STEP[dir][0]; cy += STEP[dir][1]; }
    return { free, blocker: at(cx, cy) ?? undefined };
  };
  const pick = <T,>(list: readonly T[]): T => list[next() % list.length] as T;

  for (let chain = 0; peopleCount() < want && chain < 12; chain++) {
    const empty = grid.flatMap((c, i) => (c === null ? [i] : []));
    if (empty.length === 0) break;
    const start = pick(empty);
    let cur = put({ x: start % width, y: Math.floor(start / width), kind: 'person', facing: 'N', needs: 1 }) as PersonCell;
    let length = 2 + (next() % 4);
    while (length-- > 0 && peopleCount() <= want) {
      const dirs = DIRS.filter((d) => ray(cur.x, cur.y, d).free.length > 0 || ray(cur.x, cur.y, d).blocker?.kind === 'person');
      if (dirs.length === 0) break;
      const dir = pick(dirs);
      cur = replace(cur, { ...cur, facing: dir }) as PersonCell;
      const { free, blocker } = ray(cur.x, cur.y, dir);
      // Join an existing person: feeding them a second Moin makes them a captain.
      if (blocker?.kind === 'person' && (free.length === 0 || next() % 3 === 0)) {
        const fed = (incoming.get(blocker) ?? 0) + 1;
        const joined = fed >= 2 && captains > 0 && blocker.needs === 1 ? replace(blocker, { ...blocker, needs: 2 }) : blocker;
        if (joined !== blocker) captains--;
        incoming.set(joined, fed);
        break;
      }
      if (free.length === 0) break;
      const [fx, fy] = pick(free);
      if (fenders > 0 && next() % 3 === 0) {
        const slant = next() % 2 === 0 ? 'rising' : 'falling';
        const turned = TURN[slant][dir];
        const after = ray(fx, fy, turned);
        if (after.free.length > 0) {
          put({ x: fx, y: fy, kind: 'fender', slant });
          fenders--;
          const [px, py] = pick(after.free);
          const person = put({ x: px, y: py, kind: 'person', facing: 'N', needs: 1 }) as PersonCell;
          incoming.set(person, 1);
          cur = person;
          continue;
        }
      }
      if (length === 0 && gulls > 0 && next() % 2 === 0) {
        put({ x: fx, y: fy, kind: 'seagull' });
        gulls--;
        break;
      }
      const person = put({ x: fx, y: fy, kind: 'person', facing: 'N', needs: 1 }) as PersonCell;
      incoming.set(person, 1);
      cur = person;
    }
  }
  // Captains left over go to people already fed once; chatterboxes to whoever feeds a captain.
  for (const c of [...cells]) {
    if (captains > 0 && c.kind === 'person' && c.needs === 1 && (incoming.get(c) ?? 0) >= 1 && next() % 2 === 0) {
      replace(c, { ...c, needs: 2 });
      captains--;
    }
  }
  for (const c of [...cells]) {
    if (chatterboxes === 0 || c.kind !== 'person') continue;
    const target = ray(c.x, c.y, c.facing).blocker;
    if (target?.kind === 'person' && target.needs === 2 && next() % 2 === 0) {
      replace(c, { ...c, chatterbox: true });
      chatterboxes--;
    }
  }
  // Spare gulls go where a Moin already flies off the board.
  for (const c of [...cells]) {
    if (gulls === 0 || c.kind !== 'person') continue;
    const { free, blocker } = ray(c.x, c.y, c.facing);
    if (blocker === undefined && free.length > 0 && next() % 2 === 0) {
      const [gx, gy] = pick(free);
      put({ x: gx, y: gy, kind: 'seagull' });
      gulls--;
    }
  }
  return cells;
}

/** First candidate from `seed` that passes `assess`, trying up to `attempts` derived seeds. */
export function generate(seed: number, recipe: Recipe, attempts = 400): { cells: Cell[]; solution: Solution; attempt: number } | null {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const cells = candidate(mix(seed, attempt), recipe);
    // A candidate can overshoot the people cap by one (chains end after placing); at 16 that is
    // not a board at all (§6), so skip it rather than throw (levels-progression.md).
    let game: Game;
    try {
      game = createGame({ width: recipe.width, height: recipe.height, cells });
    } catch {
      continue;
    }
    const q = assess(game, recipe);
    if (q.ok && q.solution) return { cells, solution: q.solution, attempt };
  }
  return null;
}

export const DAILY_RECIPE: Recipe = {
  width: 6,
  height: 6,
  people: [7, 10],
  captains: [1, 2],
  chatterboxes: [0, 1],
  gulls: [1, 2],
  fenders: [1, 3],
  par: [3, 5],
  maxMinimumSolutions: 2,
  minChoices: 1,
  maxForced: 3,
};

export interface DayStamp { readonly year: number; readonly month: number; readonly day: number }

export const dayId = ({ year, month, day }: DayStamp): string =>
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

/**
 * The daily level for a calendar day. Everyone whose local calendar shows the same date gets the
 * same puzzle (ROADMAP open question — decided: local day; `.agents/features/daily-level.md`).
 */
export function dailyLevel(stamp: DayStamp): Level {
  const seed = mix(stamp.year * 10_000 + stamp.month * 100 + stamp.day, 0x4d6f696e /* "Moin" */);
  const found = generate(seed, DAILY_RECIPE);
  if (found === null) throw new Error(`no daily level for ${dayId(stamp)}`);
  return {
    formatVersion: '1.1.0',
    id: `daily-${dayId(stamp)}`,
    title: 'Daily Moin',
    width: DAILY_RECIPE.width,
    height: DAILY_RECIPE.height,
    cells: cast(found.cells),
    par: found.solution.par,
  };
}

/** Give a generated crowd its cast (CLAUDE.md §7). Looks only: roles never change the rules. */
export function cast(cells: readonly Cell[]): Cell[] {
  const pool = ['fisherman', 'kid', 'market'] as const;
  let k = 0;
  return cells.map((c) => {
    if (c.kind !== 'person') return c;
    if (c.needs === 2) return { ...c, role: 'captain' };
    if (c.chatterbox === true) return { ...c, role: 'market' };
    return { ...c, role: pool[k++ % pool.length] };
  });
}
