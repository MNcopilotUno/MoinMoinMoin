import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { initialState, isSolved, personAt, replay, smilesAfter, solve, tap, targets } from '../src/index.js';
import type { Game, State } from '../src/index.js';
import { arbBoard, arbBoardAndTaps } from './helpers.js';

const smileSet = (game: Game, state: State) =>
  game.people.map((p, i) => (state.greetings[i] ?? 0) >= p.needs);

describe('termination (GAME_RULES §3)', () => {
  it('every tap ends in exactly one chainEnded, at most `people` smiles, never the flight cap', () => {
    fc.assert(
      fc.property(arbBoardAndTaps(6, 16), ([game, taps]) => {
        let state = initialState(game);
        for (const [x, y] of taps) {
          const r = tap(game, state, x, y);
          if (r.events.length > 0) {
            expect(r.events.filter((e) => e.type === 'chainEnded')).toHaveLength(1);
            expect(r.events[r.events.length - 1]?.type).toBe('chainEnded');
            expect(r.events.filter((e) => e.type === 'smiled').length).toBeLessThanOrEqual(game.people.length);
          }
          r.state.greetings.forEach((g, i) => expect(g).toBeLessThanOrEqual(game.people[i]?.needs ?? 0));
          state = r.state;
        }
      }),
      { numRuns: 400 },
    );
  });
});

describe('R9 — order of taps does not matter', () => {
  // The board, not the tap count: in one order a tap may land on someone a ripple already made
  // smile, and R2 does not count it. See .agents/lessons/design.md.
  it('a tap sequence and any shuffle of it end on the same board', () => {
    fc.assert(
      fc.property(
        arbBoardAndTaps(5, 12).chain(([game, taps]) =>
          fc.tuple(fc.constant(game), fc.constant(taps), fc.shuffledSubarray(taps, { minLength: taps.length })),
        ),
        ([game, taps, shuffled]) => {
          const a = replay(game, taps).state;
          const b = replay(game, shuffled).state;
          expect(b.greetings).toEqual(a.greetings);
        },
      ),
      { numRuns: 400 },
    );
  });
});

describe('solver', () => {
  it('smilesAfter agrees with the engine for any tap counts', () => {
    fc.assert(
      fc.property(
        arbBoard(5).chain((game) =>
          fc.tuple(fc.constant(game), fc.tuple(...game.people.map((p) => fc.integer({ min: 0, max: p.needs })))),
        ),
        ([game, counts]) => {
          let state = initialState(game);
          game.people.forEach((p, i) => {
            for (let k = 0; k < (counts[i] ?? 0); k++) state = tap(game, state, p.x, p.y).state;
          });
          expect(smilesAfter(game, counts, targets(game))).toEqual(smileSet(game, state));
        },
      ),
      { numRuns: 400 },
    );
  });

  /** Breadth-first search over real tap sequences: the slow, obviously-correct par. */
  function bruteForcePar(game: Game): number {
    const key = (s: State) => s.greetings.join(',');
    let frontier: State[] = [initialState(game)];
    const seen = new Set([key(frontier[0] as State)]);
    for (let depth = 0; depth <= 40; depth++) {
      if (frontier.some((s) => isSolved(game, s))) return depth;
      const next: State[] = [];
      for (const s of frontier) {
        for (const p of game.people) {
          const r = tap(game, s, p.x, p.y);
          if (r.state === s || seen.has(key(r.state))) continue;
          seen.add(key(r.state));
          next.push(r.state);
        }
      }
      frontier = next;
    }
    throw new Error('no solution within 40 taps');
  }

  it('par equals breadth-first search over tap sequences', () => {
    fc.assert(
      fc.property(arbBoard(4), (game) => {
        const solved = solve(game);
        expect(solved).not.toBeNull();
        expect(solved?.par).toBe(bruteForcePar(game));
      }),
      { numRuns: 300 },
    );
  });

  it('the returned solution solves the board in exactly par taps', () => {
    fc.assert(
      fc.property(arbBoard(5), (game) => {
        const solved = solve(game);
        if (solved === null) throw new Error('unsolved');
        let state = initialState(game);
        for (const step of solved.solution) {
          for (let k = 0; k < step.taps; k++) state = tap(game, state, step.x, step.y).state;
        }
        expect(isSolved(game, state)).toBe(true);
        expect(state.taps).toBe(solved.par);
        expect(solved.firstTapsToPar).toBeGreaterThanOrEqual(1);
        expect(solved.firstTapsToPar).toBeLessThanOrEqual(solved.people);
        expect(solved.minimumSolutions).toBeGreaterThanOrEqual(1);
        expect(personAt(game, solved.solution[0]?.x ?? -1, solved.solution[0]?.y ?? -1)).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 300 },
    );
  });
});
