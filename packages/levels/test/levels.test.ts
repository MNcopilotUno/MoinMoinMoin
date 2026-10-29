import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createGame, initialState, isSolved, tap } from '@moin/core';
import { levels, sets, toBoard, TUTORIAL_IDS } from '../src/index.js';
import { checkFixtures, checkLevels } from '../src/check-all.js';
import { validateLevel } from '../src/validate.js';
import { generate } from '../scripts/gen-types.js';

describe('real levels', () => {
  const { results, problems } = checkLevels();

  it('forty levels in four sets of ten, each file listed once under its own id', () => {
    expect(sets.map((s) => [s.id, s.levels.length])).toEqual([['harbour', 10], ['market', 10], ['ferry', 10], ['lighthouse', 10]]);
    expect(levels).toHaveLength(40);
    expect(results).toHaveLength(40);
    expect(problems).toEqual([]);
    for (const set of sets) for (const l of set.levels) expect(l.id.startsWith(`${set.id}-`)).toBe(true);
  });

  it('the market set is where the chatterbox lives: every market level has one', () => {
    const market = sets.find((s) => s.id === 'market')!;
    for (const l of market.levels) expect(l.cells.some((c) => c.kind === 'person' && c.chatterbox === true), l.id).toBe(true);
    expect(levels.slice(0, 10).some((l) => l.cells.some((c) => c.kind === 'person' && c.chatterbox))).toBe(false);
  });

  it.each(results.map((r) => [r.file, r.report] as const))('%s passes schema and solver', (_, report) => {
    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it('levels after the tutorial raise no R10 / random-tapping warnings', () => {
    const after = levels.filter((l) => !TUTORIAL_IDS.has(l.id)).map((l) => validateLevel(l));
    expect(after.flatMap((r) => r.warnings)).toEqual([]);
  });

  it("each level's solver solution really solves it in par taps", () => {
    for (const level of levels) {
      const report = validateLevel(level);
      const game = createGame(toBoard(level));
      let state = initialState(game);
      for (const step of report.solution?.solution ?? []) {
        for (let k = 0; k < step.taps; k++) state = tap(game, state, step.x, step.y).state;
      }
      expect(isSolved(game, state), level.id).toBe(true);
      expect(state.taps, level.id).toBe(level.par);
    }
  });

  it('level 1 is solved by one tap (the ten-second rule)', () => {
    expect(levels[0]?.par).toBe(1);
  });
});

describe('negative fixtures', () => {
  const { results, problems } = checkFixtures();

  it('every fixture has an expected message and every expected message a fixture', () => {
    expect(problems).toEqual([]);
    expect(results.length).toBeGreaterThanOrEqual(12);
  });

  it.each(results.map((r) => [r.file, r] as const))('%s fails, naming its problem', (_, r) => {
    expect(r.report.ok).toBe(false);
    expect(r.report.errors.join('\n')).toContain(r.expected);
    expect(r.ok).toBe(true);
  });

  it('a fixture that passes is reported as a failure', () => {
    const dir = mkdtempSync(join(tmpdir(), 'moin-fixtures-'));
    const levelsDir = fileURLToPath(new URL('../levels/', import.meta.url));
    writeFileSync(join(dir, 'fine.json'), readFileSync(join(levelsDir, 'harbour-01.json')));
    writeFileSync(join(dir, 'expected.json'), JSON.stringify({ 'fine.json': 'anything' }));
    const { results: [only] } = checkFixtures(dir);
    expect(only?.report.ok).toBe(true);
    expect(only?.ok).toBe(false);
  });
});

describe('validateLevel', () => {
  const base = { formatVersion: '1.0.0', id: 'test-01', title: 'T', width: 3, height: 1, par: 1 };
  it('warns about many minimum solutions after the tutorial', () => {
    const ring = { ...base, width: 2, height: 2, cells: [
      { x: 0, y: 0, kind: 'person', facing: 'E', needs: 1 }, { x: 1, y: 0, kind: 'person', facing: 'S', needs: 1 },
      { x: 1, y: 1, kind: 'person', facing: 'W', needs: 1 }, { x: 0, y: 1, kind: 'person', facing: 'N', needs: 1 }] };
    const r = validateLevel(ring);
    expect(r.ok).toBe(true);
    expect(r.warnings.join()).toMatch(/R10: 4 minimum solutions/);
    expect(r.warnings.join()).toMatch(/random tapping: 4 of 4/);
    expect(validateLevel(ring, { tutorial: true }).warnings).toEqual([]);
  });

  it('rejects unknown top-level fields and non-objects', () => {
    expect(validateLevel({ ...base, cells: [], extra: 1 }).ok).toBe(false);
    expect(validateLevel(null).ok).toBe(false);
    expect(validateLevel('level').ok).toBe(false);
  });
});

describe('generated level types', () => {
  it('src/level.generated.ts is up to date with the schema', async () => {
    const onDisk = readFileSync(fileURLToPath(new URL('../src/level.generated.ts', import.meta.url)), 'utf8');
    expect(onDisk).toBe(await generate());
  });
});
