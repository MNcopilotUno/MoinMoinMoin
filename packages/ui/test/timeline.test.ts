import { describe, expect, it } from 'vitest';
import { CELL, HALF_CELL, SMILE_DELAY, createGame, initialState, tap } from '@moin/core';
import { duration, frameAt, LOOT_TICKS, msAt, rateAfter, tickAt } from '../src/index.js';

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
    expect(frameAt(events, launch).moin).toMatchObject({ px: HALF_CELL, py: HALF_CELL, amount: 1, scale: 0.5, dir: 'E' });
    const mid = frameAt(events, launch + 18).moin!;
    expect(mid.px).toBe(HALF_CELL + 18);
    expect(mid.py).toBeLessThan(HALF_CELL); // a small arc on level flights
    expect(mid.scale).toBe(1);
  });

  it('marks the fender it bounces off, then flies on', () => {
    const f = frameAt(events, bounceAt + 3);
    expect(f.bounce).toEqual({ x: 3, y: 0, key: bounceAt });
    expect(f.moin).toMatchObject({ px: 3 * CELL + HALF_CELL, py: HALF_CELL + 3, amount: 1, dir: 'S' });
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

describe('accelerando (UI only)', () => {
  it('speeds up from the fourth Moin, capped at 1.4×', () => {
    expect([0, 1, 3, 4, 5, 8, 20].map(rateAfter)).toEqual([1, 1, 1, 1.08, 1.16, 1.4, 1.4]);
  });

  it('msAt and tickAt are inverses, and short chains keep real time', () => {
    const row = createGame({ width: 7, height: 1, cells: Array.from({ length: 7 }, (_, x) => ({ x, y: 0, kind: 'person' as const, facing: 'E' as const, needs: 1 as const })) });
    const { events } = tap(row, initialState(row), 0, 0);
    const last = events[events.length - 1]!.t;
    expect(msAt(events, 30)).toBeCloseTo(500, 5);
    expect(msAt(events, last)).toBeLessThan((last * 1000) / 60);
    for (const t of [0, 10, 40, 77, last]) expect(tickAt(events, msAt(events, t))).toBeCloseTo(t, 6);
  });

  it('marks people just reached by a Moin', () => {
    const pair = createGame({ width: 2, height: 1, cells: [{ x: 0, y: 0, kind: 'person', facing: 'E', needs: 1 }, { x: 1, y: 0, kind: 'person', facing: 'E', needs: 1 }] });
    const { events } = tap(pair, initialState(pair), 0, 0);
    const reached = events.find((e) => e.type === 'greeted' && e.source === 'moin')!;
    expect(frameAt(events, reached.t).arrivals.has('1,0')).toBe(true);
    expect(frameAt(events, reached.t + 40).arrivals.size).toBe(0);
  });
});

describe('QA M1: a chatterbox greeting counts double on screen too', () => {
  it('the captain is drawn smiling from the moment the Moin moin arrives', () => {
    const g = createGame({ width: 3, height: 1, cells: [
      { x: 0, y: 0, kind: 'person', facing: 'E', needs: 1, chatterbox: true },
      { x: 2, y: 0, kind: 'person', facing: 'E', needs: 2 },
    ] });
    const { events } = tap(g, initialState(g), 0, 0);
    const arrival = events.find((e) => e.type === 'greeted' && e.source === 'moin')!;
    expect(frameAt(events, arrival.t).greeted.get('2,0')).toBe(2);
  });
});
