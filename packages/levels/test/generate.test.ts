import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createGame, fly, targets } from '@moin/core';
import { assess, candidate, DAILY_RECIPE, dailyLevel, dayId, generate, mix, rng } from '../src/index.js';
import { validateLevel } from '../src/validate.js';
import { GOLDEN_DAYS } from './daily-scenario.js';

describe('rng and mix (integer-only, engine-independent)', () => {
  it('pins the first values so a change in the generator is a visible decision', () => {
    const next = rng(42);
    expect([next(), next(), next()]).toEqual([2581720956, 1925393290, 3661312704]);
    expect(mix(20261024, 0x4d6f696e)).toBe(mix(20261024, 0x4d6f696e));
    expect(mix(1, 2)).not.toBe(mix(2, 1));
  });
});

describe('generate', () => {
  it('is deterministic: same seed, same board', () => {
    expect(candidate(7, DAILY_RECIPE)).toEqual(candidate(7, DAILY_RECIPE));
    expect(generate(99, DAILY_RECIPE)).toEqual(generate(99, DAILY_RECIPE));
  });

  it('every object it keeps is on somebody\'s flight path', () => {
    for (let seed = 0; seed < 20; seed++) {
      const found = generate(seed, DAILY_RECIPE);
      expect(found, `seed ${seed}`).not.toBeNull();
      const game = createGame({ width: DAILY_RECIPE.width, height: DAILY_RECIPE.height, cells: found!.cells });
      expect(assess(game, DAILY_RECIPE).reasons).toEqual([]);
      const bounced = new Set(game.people.flatMap((p) => fly(game, p, 0).path.filter((e) => e.type === 'bounced').map((e) => `${e.x},${e.y}`)));
      for (const c of game.cells) if (c.kind === 'fender') expect(bounced.has(`${c.x},${c.y}`)).toBe(true);
      expect(targets(game).length).toBe(game.people.length);
    }
  });
});

describe('daily level', () => {
  it('pins two days, so the daily puzzle never silently changes for players', () => {
    const a = dailyLevel({ year: 2026, month: 10, day: 24 });
    const b = dailyLevel({ year: 2026, month: 10, day: 25 });
    expect(a.id).toBe('daily-2026-10-24');
    expect([a.par, a.cells.length]).toEqual([3, 10]);
    expect([b.par, b.cells.length]).toEqual([4, 12]);
    expect(dailyLevel({ year: 2026, month: 10, day: 24 })).toEqual(a);
  });

  it('matches the pinned golden days (also replayed in every browser engine)', () => {
    const golden = fileURLToPath(new URL('./daily.golden.json', import.meta.url));
    const actual = JSON.stringify(GOLDEN_DAYS.map((d) => dailyLevel(d))) + '\n';
    if (process.env.UPDATE_GOLDEN === '1') writeFileSync(golden, actual);
    expect(actual).toBe(readFileSync(golden, 'utf8'));
  });

  it('every day of a whole year yields a valid level, par within 3–5, with no warnings', () => {
    for (let d = 0; d < 365; d++) {
      const date = new Date(Date.UTC(2027, 0, 1 + d));
      const level = dailyLevel({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() });
      const report = validateLevel(level);
      expect(report.errors, level.id).toEqual([]);
      expect(report.warnings, level.id).toEqual([]);
      expect(level.par).toBeGreaterThanOrEqual(3);
      expect(level.par).toBeLessThanOrEqual(5);
    }
  });

  it('formats day ids with leading zeros', () => {
    expect(dayId({ year: 2026, month: 3, day: 7 })).toBe('2026-03-07');
  });
});
