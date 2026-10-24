import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { levels, TUTORIAL_IDS } from './index.js';
import { validateLevel } from './validate.js';
import type { Report } from './validate.js';

const here = fileURLToPath(new URL('..', import.meta.url));
export const levelsDir = join(here, 'levels');
export const fixturesDir = join(here, 'fixtures');

export interface LevelResult { readonly file: string; readonly report: Report }
export interface FixtureResult { readonly file: string; readonly expected: string; readonly report: Report; readonly ok: boolean }

const readJson = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8'));

/** Every real level must pass; it must also be in the play order, once, under its own file name. */
export function checkLevels(): { results: LevelResult[]; problems: string[] } {
  const files = readdirSync(levelsDir).filter((f) => f.endsWith('.json')).sort();
  const order = levels.map((l) => l.id);
  const problems: string[] = [];
  const results = files.map((file) => {
    const data = readJson(join(levelsDir, file)) as { id?: string };
    const index = order.indexOf(data.id ?? '');
    const report = validateLevel(data, { tutorial: TUTORIAL_IDS.has(data.id ?? '') });
    if (data.id !== basename(file, '.json')) problems.push(`${file}: id "${data.id}" does not match the file name`);
    if (index < 0) problems.push(`${file}: not in the play order (packages/levels/src/index.ts)`);
    return { file, report };
  });
  if (new Set(order).size !== order.length) problems.push('the play order lists a level twice');
  return { results, problems };
}

/** Every negative fixture must FAIL, with a message naming its problem (CLAUDE.md §6). */
export function checkFixtures(dir: string = fixturesDir): { results: FixtureResult[]; problems: string[] } {
  const expected = readJson(join(dir, 'expected.json')) as Record<string, string>;
  const files = readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'expected.json').sort();
  const problems: string[] = [];
  for (const name of Object.keys(expected)) if (!files.includes(name)) problems.push(`expected.json names a missing fixture ${name}`);
  const results = files.map((file) => {
    const want = expected[file];
    const report = validateLevel(readJson(join(dir, file)));
    const ok = want !== undefined && !report.ok && report.errors.some((e) => e.includes(want));
    if (want === undefined) problems.push(`${file}: no expected message in expected.json`);
    return { file, expected: want ?? '', report, ok };
  });
  return { results, problems };
}
