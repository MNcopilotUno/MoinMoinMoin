import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { createGame, replay } from '../src/index.js';
import { replayBoard, replayTaps } from './replay-scenario.js';

const goldenPath = fileURLToPath(new URL('./replay.golden.json', import.meta.url));

describe('determinism (CLAUDE.md §8, physics that drifts)', () => {
  it('the recorded solution produces the pinned events, tick for tick', () => {
    const { events, state } = replay(createGame(replayBoard), replayTaps);
    const actual = JSON.stringify({ events, state }, null, 1);
    if (process.env.UPDATE_GOLDEN === '1') writeFileSync(goldenPath, actual + '\n');
    expect(actual + '\n').toBe(readFileSync(goldenPath, 'utf8'));
  });
});
