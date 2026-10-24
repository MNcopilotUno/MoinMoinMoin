import { GAME_NAME } from '@moin/core';
import type { BoardSpec } from '@moin/core';

/**
 * The daily level's copyable result (ROADMAP Phase 2): text only, no server, no link. Shows the
 * harbour everyone woke up, not the taps — no spoilers.
 */
export function shareText(day: string, board: BoardSpec, taps: number, par: number, stars: 1 | 2 | 3): string {
  const grid: string[][] = Array.from({ length: board.height }, () => Array<string>(board.width).fill('🟦'));
  for (const c of board.cells) {
    const row = grid[c.y];
    if (!row) continue;
    row[c.x] = c.kind === 'person' ? (c.needs === 2 ? '😄' : '😊') : c.kind === 'seagull' ? '🐦' : c.slant === 'rising' ? '↗️' : '↘️';
  }
  const starLine = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  return [
    `${GAME_NAME} · daily ${day}`,
    `${starLine} ${taps} ${taps === 1 ? 'tap' : 'taps'} (par ${par})`,
    ...grid.map((row) => row.join('')),
  ].join('\n');
}
