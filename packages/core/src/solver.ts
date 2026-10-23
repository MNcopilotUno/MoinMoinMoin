import { targets } from './flight.js';
import type { Game } from './types.js';

export interface SolutionStep {
  readonly x: number;
  readonly y: number;
  /** How many times to tap this person (order does not matter, R9). */
  readonly taps: number;
}

export interface Solution {
  /** Minimum number of taps (R7). */
  readonly par: number;
  /** One minimum solution. */
  readonly solution: readonly SolutionStep[];
  /** How many tap-count vectors reach par (R10), capped at `limit`. */
  readonly minimumSolutions: number;
  /** True when `minimumSolutions` hit the cap. */
  readonly capped: boolean;
  /** People who can be tapped first and still finish at par (CLAUDE.md §8). */
  readonly firstTapsToPar: number;
  /** People on the board (all can be tapped first). */
  readonly people: number;
}

/**
 * Smile set after applying tap counts (any order, R9), using the static flight targets.
 * Mirrors `tap` exactly; `core`'s tests check the two agree.
 */
export function smilesAfter(
  game: Game,
  counts: readonly number[],
  hits: ReturnType<typeof targets> = targets(game),
): boolean[] {
  const n = game.people.length;
  const greetings = counts.slice(0, n);
  const smiling: boolean[] = new Array<boolean>(n).fill(false);
  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if ((greetings[i] ?? 0) >= (game.people[i]?.needs ?? 0)) queue.push(i);
  }
  while (queue.length > 0) {
    const i = queue.pop() as number;
    if (smiling[i]) continue;
    smiling[i] = true;
    const hit = hits[i];
    if (hit?.kind !== 'person' || smiling[hit.index]) continue;
    const g = (greetings[hit.index] ?? 0) + 1;
    greetings[hit.index] = g;
    if (g >= (game.people[hit.index]?.needs ?? 0)) queue.push(hit.index);
  }
  return smiling;
}

/**
 * §8: search tap counts per person, smallest total first. Returns `null` only for a board the
 * search cannot finish — with the v1 rules that is a board with no people.
 */
export function solve(game: Game, limit = 100_000): Solution | null {
  const n = game.people.length;
  if (n === 0) return null;
  const hits = targets(game);
  const needs = game.people.map((p) => p.needs as number);
  const reachable: boolean[] = new Array<boolean>(n).fill(false);
  for (const hit of hits) if (hit.kind === 'person') reachable[hit.index] = true;

  // A person no Moin can reach must be tapped `needs` times.
  const counts: number[] = needs.map((need, i) => (reachable[i] ? 0 : need));
  const free = needs.map((_, i) => i).filter((i) => reachable[i]);
  const fixedTaps = counts.reduce((a, b) => a + b, 0);
  const maxExtra = free.reduce((a, i) => a + (needs[i] ?? 0), 0);

  for (let extra = 0; extra <= maxExtra; extra++) {
    let found = 0;
    let first: number[] | null = null;
    const usable: boolean[] = new Array<boolean>(n).fill(false);
    const assign = (k: number, left: number): boolean => {
      if (k === free.length) {
        if (left !== 0) return true;
        if (!smilesAfter(game, counts, hits).every(Boolean)) return true;
        found++;
        if (first === null) first = counts.slice();
        counts.forEach((c, i) => { if (c > 0) usable[i] = true; });
        return found < limit;
      }
      const i = free[k] as number;
      const top = Math.min(needs[i] ?? 0, left);
      for (let c = 0; c <= top; c++) {
        counts[i] = c;
        if (!assign(k + 1, left - c)) { counts[i] = 0; return false; }
      }
      counts[i] = 0;
      return true;
    };
    assign(0, extra);
    if (first !== null) {
      const best: number[] = first;
      return {
        par: fixedTaps + extra,
        solution: game.people
          .map((p, i) => ({ x: p.x, y: p.y, taps: best[i] ?? 0 }))
          .filter((s) => s.taps > 0),
        minimumSolutions: found,
        capped: found >= limit,
        firstTapsToPar: usable.filter(Boolean).length,
        people: n,
      };
    }
  }
  return null;
}
