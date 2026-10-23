import type { BoardSpec } from '@moin/core';
import type { Level } from './level.generated.js';
import h01 from '../levels/harbour-01.json' with { type: 'json' };
import h02 from '../levels/harbour-02.json' with { type: 'json' };
import h03 from '../levels/harbour-03.json' with { type: 'json' };
import h04 from '../levels/harbour-04.json' with { type: 'json' };
import h05 from '../levels/harbour-05.json' with { type: 'json' };
import h06 from '../levels/harbour-06.json' with { type: 'json' };
import h07 from '../levels/harbour-07.json' with { type: 'json' };
import h08 from '../levels/harbour-08.json' with { type: 'json' };
import h09 from '../levels/harbour-09.json' with { type: 'json' };
import h10 from '../levels/harbour-10.json' with { type: 'json' };

export type { Cell, FenderCell, Level, PersonCell, SeagullCell } from './level.generated.js';

/**
 * Play order. Validated by `pnpm validate:levels` (schema + solver), so the app may trust it.
 * The first three are the tutorial set (R10 warnings do not apply).
 */
export const levels: readonly Level[] = [h01, h02, h03, h04, h05, h06, h07, h08, h09, h10] as Level[];

export const TUTORIAL_LEVELS = 3;

/** A level is a board plus metadata; core needs only the board. */
export function toBoard(level: Level): BoardSpec {
  return { width: level.width, height: level.height, cells: level.cells };
}

export function levelIndex(id: string): number {
  return levels.findIndex((l) => l.id === id);
}
