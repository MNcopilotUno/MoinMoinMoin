import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';
import { expect, test } from '@playwright/test';
import { replayBoard, replayTaps } from '../../../packages/core/test/replay-scenario';

// CLAUDE.md §8 — physics that drifts: the recorded solution must produce identical events, tick
// for tick, in every engine. The golden file is the Node result (packages/core/test/replay.test.ts).
const golden = readFileSync(fileURLToPath(new URL('../../../packages/core/test/replay.golden.json', import.meta.url)), 'utf8');
const core = buildSync({
  entryPoints: [fileURLToPath(new URL('../../../packages/core/src/index.ts', import.meta.url))],
  bundle: true, format: 'iife', globalName: 'MoinCore', write: false, target: 'es2020',
}).outputFiles[0]!.text;

test('the recorded solution replays identically in this browser engine', async ({ page }) => {
  await page.setContent('<!doctype html><title>replay</title>');
  await page.addScriptTag({ content: core });
  const actual = await page.evaluate(([board, taps]) => {
    const m = (window as unknown as { MoinCore: typeof import('../../../packages/core/src/index') }).MoinCore;
    const { events, state } = m.replay(m.createGame(board), taps);
    return JSON.stringify({ events, state }, null, 1) + '\n';
  }, [replayBoard, replayTaps] as const);
  expect(actual).toBe(golden);
});
