// pnpm validate:levels — schema + solver on every level; every negative fixture must FAIL.
import { checkFixtures, checkLevels } from '../src/check-all.js';

let failed = false;
const levels = checkLevels();
console.log('Levels');
for (const { file, report } of levels.results) {
  const s = report.solution;
  const stats = s ? `par ${s.par}, ${s.minimumSolutions} minimum solution(s), ${s.firstTapsToPar}/${s.people} first taps reach par` : '';
  console.log(`  ${report.ok ? 'ok  ' : 'FAIL'} ${file.padEnd(18)} ${stats}`);
  for (const e of report.errors) console.log(`         error: ${e}`);
  for (const w of report.warnings) console.log(`         warning: ${w}`);
  failed ||= !report.ok;
}
for (const p of levels.problems) { console.log(`  FAIL ${p}`); failed = true; }

const fixtures = checkFixtures();
console.log('Negative fixtures (each must fail with its message)');
for (const { file, expected, report, ok } of fixtures.results) {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${file.padEnd(26)} ${report.ok ? 'PASSED — should have failed' : report.errors.join('; ')}`);
  if (!ok) console.log(`         expected a message containing: ${expected}`);
  failed ||= !ok;
}
for (const p of fixtures.problems) { console.log(`  FAIL ${p}`); failed = true; }

console.log(`${levels.results.length} levels, ${fixtures.results.length} fixtures: ${failed ? 'FAILED' : 'all as expected'}`);
process.exit(failed ? 1 : 0);
