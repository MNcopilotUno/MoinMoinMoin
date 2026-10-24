import type { BoardSpec } from '../src/index.js';

/**
 * A recorded solution on a board with every kind of thing in it. Its events are pinned in
 * `replay.golden.json` and replayed in Node (vitest) and in Chromium, Firefox and WebKit
 * (apps/moin-moin-moin/e2e/replay.spec.ts). Change the golden file only with a rule change.
 */
export const replayBoard: BoardSpec = {
  width: 6,
  height: 5,
  cells: [
    { x: 0, y: 0, kind: 'person', facing: 'E', needs: 1 },
    { x: 3, y: 0, kind: 'fender', slant: 'falling' },
    { x: 3, y: 2, kind: 'person', facing: 'W', needs: 2 },
    { x: 0, y: 2, kind: 'fender', slant: 'rising' },
    { x: 5, y: 2, kind: 'person', facing: 'W', needs: 1 },
    { x: 1, y: 4, kind: 'seagull' },
    { x: 5, y: 4, kind: 'person', facing: 'W', needs: 1 },
    { x: 2, y: 4, kind: 'person', facing: 'N', needs: 1 },
    { x: 0, y: 4, kind: 'person', facing: 'E', needs: 1 },
    { x: 5, y: 3, kind: 'person', facing: 'N', needs: 1 },
    { x: 4, y: 1, kind: 'person', facing: 'W', needs: 1, chatterbox: true },
    { x: 1, y: 1, kind: 'person', facing: 'S', needs: 2 },
  ],
};

export const replayTaps: readonly (readonly [number, number])[] = [
  [0, 0], [3, 3], [5, 4], [5, 2], [2, 4], [5, 3], [4, 1], [0, 0],
];
