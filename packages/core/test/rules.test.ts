import { describe, expect, it } from 'vitest';
import {
  CELL, HALF_CELL, SMILE_DELAY, initialState, isSolved, replay, stars, tap,
} from '../src/index.js';
import type { MoinEvent } from '../src/index.js';
import { board } from './helpers.js';

const types = (events: readonly MoinEvent[]) => events.map((e) => e.type);
const ended = (events: readonly MoinEvent[]) => {
  const last = events[events.length - 1];
  return last?.type === 'chainEnded' ? last.reason : undefined;
};

describe('R1 — only people can be tapped', () => {
  const game = board(`E1 . g /`);
  it.each([[1, 0, 'water'], [2, 0, 'seagull'], [3, 0, 'fender'], [9, 9, 'off the board']])(
    'tap on (%i, %i) %s does nothing and does not count',
    (x, y) => {
      const s0 = initialState(game);
      const r = tap(game, s0, x, y);
      expect(r.events).toEqual([]);
      expect(r.state).toBe(s0);
    },
  );
});

describe('R2 — a smiling person cannot be tapped', () => {
  it('second tap on a smiling person is ignored and not counted', () => {
    const game = board(`E1 .`);
    const once = tap(game, initialState(game), 0, 0).state;
    const twice = tap(game, once, 0, 0);
    expect(twice.events).toEqual([]);
    expect(twice.state).toBe(once);
    expect(once.taps).toBe(1);
  });
});

describe('a tap', () => {
  it('greets, smiles, launches and is lost at the edge', () => {
    const game = board(`E1 . .`);
    const r = tap(game, initialState(game), 0, 0);
    expect(types(r.events)).toEqual(['greeted', 'smiled', 'launched', 'chainEnded']);
    expect(ended(r.events)).toBe('edge');
    expect(r.state.taps).toBe(1);
    const edge = r.events[3];
    expect(edge?.px).toBe(3 * CELL);
    // centre of cell 0 → right edge of cell 2 is 2.5 cells
    expect(edge?.t).toBe(SMILE_DELAY + HALF_CELL + 2 * CELL);
  });

  it('counts exactly one tap however long the chain', () => {
    const game = board(`E1 E1 E1 E1`);
    const r = tap(game, initialState(game), 0, 0);
    expect(r.state.taps).toBe(1);
    expect(isSolved(game, r.state)).toBe(true);
  });
});

describe("R3′ — line of flight", () => {
  it('reaches a person over open water, at the edge of their square', () => {
    const game = board(`E1 . . S1`);
    const r = tap(game, initialState(game), 0, 0);
    const hit = r.events.find((e) => e.type === 'greeted' && e.source === 'moin');
    expect(hit).toMatchObject({ x: 3, y: 0, px: 3 * CELL, py: HALF_CELL });
    expect(hit?.t).toBe(SMILE_DELAY + HALF_CELL + 2 * CELL);
    expect(isSolved(game, r.state)).toBe(true);
  });

  it('stops at the first thing in its way', () => {
    const game = board(`E1 S1 W1`);
    const r = tap(game, initialState(game), 0, 0);
    const greeted = r.events.filter((e) => e.type === 'greeted').map((e) => (e as { x: number }).x);
    expect(greeted).toEqual([0, 1]);
    expect(isSolved(game, r.state)).toBe(false);
  });
});

describe('R4 — seagulls steal and stay', () => {
  it('a Moin into a seagull is stolen and the chain ends', () => {
    const game = board(`E1 . g E1`);
    const r = tap(game, initialState(game), 0, 0);
    expect(types(r.events).slice(-2)).toEqual(['stolen', 'chainEnded']);
    expect(ended(r.events)).toBe('seagull');
    expect(r.events.find((e) => e.type === 'stolen')).toMatchObject({ x: 2, y: 0, px: 2 * CELL });
    // the seagull is still there for the next Moin
    const again = tap(game, r.state, 3, 0);
    expect(ended(again.events)).toBe('edge');
    const back = board(`W1 . g E1`);
    expect(ended(tap(back, initialState(back), 3, 0).events)).toBe('edge');
  });
});

describe('a smiling person smiles back', () => {
  it('a Moin into a smiling person ends the chain without a greeting', () => {
    const game = board(`E1 W1`);
    const r = tap(game, initialState(game), 0, 0);
    expect(types(r.events)).toEqual([
      'greeted', 'smiled', 'launched', 'greeted', 'smiled', 'launched', 'chainEnded',
    ]);
    expect(ended(r.events)).toBe('alreadySmiling');
    expect(r.state.greetings).toEqual([1, 1]);
  });
});

describe('R5 — greetings persist', () => {
  it('a captain greeted once waits, half-greeted, until a second greeting', () => {
    const game = board(`E1 E2 .`);
    const first = tap(game, initialState(game), 0, 0);
    expect(ended(first.events)).toBe('waiting');
    expect(first.state.greetings).toEqual([1, 1]);
    expect(isSolved(game, first.state)).toBe(false);
    const second = tap(game, first.state, 1, 0);
    expect(second.events[0]).toMatchObject({ type: 'greeted', source: 'tap', greetings: 2, needs: 2 });
    expect(isSolved(game, second.state)).toBe(true);
    expect(second.state.taps).toBe(2);
  });

  it('a captain tapped once waits', () => {
    const game = board(`S2`);
    const r = tap(game, initialState(game), 0, 0);
    expect(types(r.events)).toEqual(['greeted', 'chainEnded']);
    expect(ended(r.events)).toBe('waiting');
  });
});

describe('R11 — fenders deflect', () => {
  it('rising turns east to north, at the fender centre', () => {
    const game = board(`
      . S1
      E1 /
    `);
    const r = tap(game, initialState(game), 0, 1);
    const bounce = r.events.find((e) => e.type === 'bounced');
    expect(bounce).toMatchObject({ x: 1, y: 1, dir: 'N', px: CELL + HALF_CELL, py: CELL + HALF_CELL });
    expect(bounce?.t).toBe(SMILE_DELAY + CELL);
    expect(r.events.find((e) => e.type === 'greeted' && e.source === 'moin')).toMatchObject({ x: 1, y: 0 });
  });

  it.each([
    ['rising', 'E', 'N'], ['rising', 'N', 'E'], ['rising', 'W', 'S'], ['rising', 'S', 'W'],
    ['falling', 'E', 'S'], ['falling', 'S', 'E'], ['falling', 'W', 'N'], ['falling', 'N', 'W'],
  ])('%s fender turns %s into %s', async (slant, from, to) => {
    const { deflect } = await import('../src/index.js');
    expect(deflect(from as 'E', slant as 'rising')).toBe(to);
  });

  it('a fender loop back to the sender ends at the smiling sender', () => {
    // E1 → / up → \ left... back down into the sender
    const game = board(`
      \\ /
      N1 \\
    `);
    // sender at (0,1) faces N → (0,0) falling: N→W → edge. Use a real loop:
    const loop = board(`
      / \\
      N1 /
    `);
    const a = tap(game, initialState(game), 0, 1);
    expect(ended(a.events)).toBe('edge');
    // (0,1) N → (0,0) rising N→E → (1,0) falling E→S → (1,1) rising S→W → back into (0,1)
    const b = tap(loop, initialState(loop), 0, 1);
    expect(b.events.filter((e) => e.type === 'bounced')).toHaveLength(3);
    expect(ended(b.events)).toBe('alreadySmiling');
  });

  it('fenders never receive greetings and never stop a Moin', () => {
    const game = board(`E1 \\ .
      . . .
      . W1 /`);
    // (0,0) E → (1,0) falling E→S → (1,1) water → (1,2) person W1
    const r = tap(game, initialState(game), 0, 0);
    expect(r.events.filter((e) => e.type === 'greeted').map((e) => [(e as { x: number }).x, (e as { y: number }).y]))
      .toEqual([[0, 0], [1, 2]]);
  });
});

describe('R12 — fixed step', () => {
  it('every tick and point is an integer and ticks never go backwards', () => {
    const game = board(`E1 . \\ .
      . . . .
      g . W2 N1`);
    const r = tap(game, initialState(game), 0, 0);
    let t = 0;
    for (const e of r.events) {
      expect(Number.isInteger(e.t) && Number.isInteger(e.px) && Number.isInteger(e.py)).toBe(true);
      expect(e.t).toBeGreaterThanOrEqual(t);
      t = e.t;
    }
  });

  it('a smile launches its Moin SMILE_DELAY ticks later', () => {
    const game = board(`E1 . S1`);
    const r = tap(game, initialState(game), 0, 0);
    const smiled = r.events.filter((e) => e.type === 'smiled');
    const launched = r.events.filter((e) => e.type === 'launched');
    smiled.forEach((s, i) => expect(launched[i]?.t).toBe(s.t + SMILE_DELAY));
  });
});

describe('R6, R7, R8 — winning', () => {
  it('stars: 3 at par, 2 at par + 1, 1 otherwise', () => {
    expect(stars(2, 2)).toBe(3);
    expect(stars(3, 2)).toBe(2);
    expect(stars(4, 2)).toBe(1);
    expect(stars(9, 2)).toBe(1);
  });

  it('undo is the previous state: tap never mutates its input', () => {
    const game = board(`E1 E2 S1`);
    const s0 = initialState(game);
    const frozen = JSON.stringify(s0);
    const { state } = replay(game, [[0, 0], [1, 0]]);
    expect(JSON.stringify(s0)).toBe(frozen);
    expect(state.taps).toBe(2);
  });

  it('there is no fail state: tapping everyone to needs always solves', () => {
    const game = board(`E2 g W2
      N1 / S2`);
    let state = initialState(game);
    for (const p of game.people) for (let k = 0; k < p.needs; k++) state = tap(game, state, p.x, p.y).state;
    expect(isSolved(game, state)).toBe(true);
  });
});
