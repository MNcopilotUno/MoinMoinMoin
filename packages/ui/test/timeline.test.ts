import { describe, expect, it } from 'vitest';
import { CELL, HALF_CELL, SMILE_DELAY, createGame, initialState, tap } from '@moin/core';
import { duration, frameAt, LOOT_TICKS } from '../src/index.js';

const game = createGame({ width: 4, height: 2, cells: [
  { x: 0, y: 0, kind: 'person', facing: 'E', needs: 1 },
  { x: 3, y: 0, kind: 'fender', slant: 'falling' },
  { x: 3, y: 1, kind: 'seagull' },
  { x: 0, y: 1, kind: 'person', facing: 'E', needs: 1 },
] });

describe('frameAt', () => {
  const { events } = tap(game, initialState(game), 0, 0);
  const launch = SMILE_DELAY;
  const bounceAt = launch + 3 * CELL;

  it('greets the tapped person at tick 0, before the Moin leaves', () => {
    const f = frameAt(events, 0);
    expect(f.greeted.get('0,0')).toBe(1);
    expect(f.moin).toBeNull();
  });

  it('moves the Moin linearly between events, in sub-units', () => {
    expect(frameAt(events, launch).moin).toEqual({ px: HALF_CELL, py: HALF_CELL, amount: 1 });
    expect(frameAt(events, launch + 18).moin).toEqual({ px: HALF_CELL + 18, py: HALF_CELL, amount: 1 });
  });

  it('marks the fender it bounces off, then flies on', () => {
    const f = frameAt(events, bounceAt + 3);
    expect(f.bounce).toEqual({ x: 3, y: 0, key: bounceAt });
    expect(f.moin).toEqual({ px: 3 * CELL + HALF_CELL, py: HALF_CELL + 3, amount: 1 });
  });

  it('hands the stolen Moin to the gull, then lets go', () => {
    const stolenAt = bounceAt + HALF_CELL;
    expect(frameAt(events, stolenAt).thief).toEqual({ x: 3, y: 1 });
    expect(frameAt(events, stolenAt).moin).toBeNull();
    expect(frameAt(events, stolenAt + LOOT_TICKS).thief).toBeNull();
    expect(duration(events)).toBe(stolenAt + LOOT_TICKS);
    expect(frameAt(events, duration(events)).done).toBe(true);
    expect(frameAt(events, duration(events) - 1).done).toBe(false);
  });

  it('reports each launch once across consecutive frames', () => {
    expect(frameAt(events, launch, launch - 1).launches).toHaveLength(1);
    expect(frameAt(events, launch + 1, launch).launches).toHaveLength(0);
  });

  it("a chatterbox's Moin is drawn as Moin moin all the way, bounces included", () => {
    const chatty = createGame({ width: 4, height: 2, cells: [
      { x: 0, y: 0, kind: 'person', facing: 'E', needs: 1, chatterbox: true },
      { x: 3, y: 0, kind: 'fender', slant: 'falling' },
    ] });
    const { events: ev } = tap(chatty, initialState(chatty), 0, 0);
    expect(frameAt(ev, launch + 1).moin?.amount).toBe(2);
    expect(frameAt(ev, bounceAt + 2).moin?.amount).toBe(2);
  });

  it('an empty event list is done at once', () => {
    expect(frameAt([], 0).done).toBe(true);
  });
});
