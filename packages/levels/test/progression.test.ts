import { describe, expect, it } from 'vitest';
import { createGame, solve, targets } from '@moin/core';
import { generate, levelRevision, levels, sets, toBoard } from '../src/index.js';
import type { Level } from '../src/index.js';

// .agents/features/levels-progression.md — bigger and progressive.
const LESSONS = new Set(['harbour-01', 'harbour-02', 'harbour-03', 'harbour-04', 'harbour-05', 'market-01']);
const cells = (l: { width: number; height: number }) => l.width * l.height;

describe('the curve', () => {
  it('from harbour-06 on, no level is smaller or easier than the one before (lessons excepted)', () => {
    const curve = levels.filter((l) => !LESSONS.has(l.id));
    expect(curve[0]!.id).toBe('harbour-06');
    for (let i = 1; i < curve.length; i++) {
      const [a, b] = [curve[i - 1]!, curve[i]!];
      expect(cells(b), `${b.id} is smaller than ${a.id}`).toBeGreaterThanOrEqual(cells(a));
      expect(b.par, `${b.id} has a lower par than ${a.id}`).toBeGreaterThanOrEqual(a.par);
    }
  });

  it('every set ends harder than it starts', () => {
    for (const set of sets) {
      const real = set.levels.filter((l) => !LESSONS.has(l.id));
      expect(real[real.length - 1]!.par).toBeGreaterThan(real[0]!.par);
    }
  });

  it('the finale uses the whole board and the whole crowd', () => {
    const last = levels[levels.length - 1]!;
    expect(last.id).toBe('mudflats-10');
    expect([last.width, last.height]).toEqual([7, 7]);
    expect(last.par).toBeGreaterThanOrEqual(10);
    expect(last.cells.filter((c) => c.kind === 'person').length).toBe(16);
  });

  it("the lighthouse's finale keeps its one answer", () => {
    const end = sets.find((s) => s.id === 'lighthouse')!.levels[9]!;
    expect(solve(createGame(toBoard(end)), 5)?.minimumSolutions).toBe(1);
  });

  it('the ferry has gulls again', () => {
    const ferry = sets.find((s) => s.id === 'ferry')!;
    expect(ferry.levels.some((l) => l.cells.some((c) => c.kind === 'seagull'))).toBe(true);
  });
});

// .agents/features/lighthouse.md — the fourth part of town continues the curve after the ferry.
describe('the lighthouse', () => {
  const lighthouse = sets.find((s) => s.id === 'lighthouse')!;
  const ferry = sets.find((s) => s.id === 'ferry')!;

  it('comes after the ferry and starts no easier than the ferry ends', () => {
    expect(sets.map((s) => s.id).slice(0, 4)).toEqual(['harbour', 'market', 'ferry', 'lighthouse']);
    const [ferryEnd, first] = [ferry.levels[ferry.levels.length - 1]!, lighthouse.levels[0]!];
    expect(first.par).toBeGreaterThanOrEqual(Math.max(8, ferryEnd.par));
    expect(cells(first)).toBeGreaterThanOrEqual(cells(ferryEnd));
  });

  it('every board is the whole 7 × 7 harbour with at least three captains and a gull or a fender', () => {
    for (const l of lighthouse.levels) {
      expect([l.width, l.height], l.id).toEqual([7, 7]);
      expect(l.cells.filter((c) => c.kind === 'person' && c.needs === 2).length, l.id).toBeGreaterThanOrEqual(3);
      expect(l.cells.some((c) => c.kind === 'seagull' || c.kind === 'fender'), l.id).toBe(true);
    }
  });
});

// .agents/features/mudflats.md — the fifth part of town: par 9 → 10 at the people cap.
describe('the mudflats', () => {
  const mudflats = sets.find((s) => s.id === 'mudflats')!;
  const lighthouse = sets.find((s) => s.id === 'lighthouse')!;
  const captains = (l: Level) => l.cells.filter((c) => c.kind === 'person' && c.needs === 2).length;

  it('comes last, after the lighthouse, and starts no easier than the lighthouse ends', () => {
    expect(sets.map((s) => s.id)).toEqual(['harbour', 'market', 'ferry', 'lighthouse', 'mudflats']);
    const [end, first] = [lighthouse.levels[lighthouse.levels.length - 1]!, mudflats.levels[0]!];
    expect(first.par).toBeGreaterThanOrEqual(Math.max(9, end.par));
    expect(cells(first)).toBeGreaterThanOrEqual(cells(end));
    expect(captains(first)).toBeGreaterThanOrEqual(4);
  });

  it('every board is 7 × 7 with 15–16 people, at least four captains, a gull and a fender', () => {
    for (const l of mudflats.levels) {
      expect([l.width, l.height], l.id).toEqual([7, 7]);
      expect(l.cells.filter((c) => c.kind === 'person').length, l.id).toBeGreaterThanOrEqual(15);
      expect(captains(l), l.id).toBeGreaterThanOrEqual(4);
      expect(l.cells.some((c) => c.kind === 'seagull'), l.id).toBe(true);
      expect(l.cells.some((c) => c.kind === 'fender'), l.id).toBe(true);
    }
  });

  it('reaches par 10, which no earlier part of town does, and ends on it', () => {
    expect(levels.filter((l) => l.par >= 10).every((l) => l.id.startsWith('mudflats-'))).toBe(true);
    expect(mudflats.levels.filter((l) => l.par === 10).length).toBeGreaterThanOrEqual(5);
    expect(mudflats.levels[9]!.par).toBe(10);
  });

  it('five or more of the par taps on every board need thought (a Moin could reach that person)', () => {
    for (const l of mudflats.levels) {
      const game = createGame(toBoard(l));
      const reached = new Set(targets(game).flatMap((t) => (t.kind === 'person' ? [t.index] : [])));
      const forced = game.people.reduce((n, p, i) => n + (reached.has(i) ? 0 : p.needs), 0);
      expect(l.par - forced, l.id).toBeGreaterThanOrEqual(5);
    }
  });
});

describe('revisions', () => {
  it('regenerated boards are revision 2; lessons and new levels revision 1', () => {
    expect(levelRevision('harbour-01')).toBe(1);
    expect(levelRevision('market-01')).toBe(1);
    expect(levelRevision('harbour-06')).toBe(2);
    expect(levelRevision('ferry-10')).toBe(2);
    expect(levelRevision('lighthouse-01')).toBe(1);
    expect(levelRevision('lighthouse-10')).toBe(1);
    expect(levelRevision('mudflats-01')).toBe(1);
    expect(levelRevision('mudflats-10')).toBe(1);
    expect(levelRevision('daily-2026-10-24')).toBe(1);
  });
});

describe('generator at the people cap', () => {
  it('never throws when a candidate overshoots 16 people', () => {
    const recipe = { width: 7, height: 7, people: [15, 16], captains: [3, 4], chatterboxes: [0, 1], gulls: [1, 2], fenders: [2, 3], par: [7, 8], maxMinimumSolutions: 2, minChoices: 2, maxForced: 4 } as const;
    for (let seed = 0; seed < 25; seed++) expect(() => generate(seed, recipe, 40)).not.toThrow();
  });
});
