import type { BoardSpec } from '@moin/core';
import type { Level } from './level.generated.js';
import harbour01 from '../levels/harbour-01.json' with { type: 'json' };
import harbour02 from '../levels/harbour-02.json' with { type: 'json' };
import harbour03 from '../levels/harbour-03.json' with { type: 'json' };
import harbour04 from '../levels/harbour-04.json' with { type: 'json' };
import harbour05 from '../levels/harbour-05.json' with { type: 'json' };
import harbour06 from '../levels/harbour-06.json' with { type: 'json' };
import harbour07 from '../levels/harbour-07.json' with { type: 'json' };
import harbour08 from '../levels/harbour-08.json' with { type: 'json' };
import harbour09 from '../levels/harbour-09.json' with { type: 'json' };
import harbour10 from '../levels/harbour-10.json' with { type: 'json' };
import market01 from '../levels/market-01.json' with { type: 'json' };
import market02 from '../levels/market-02.json' with { type: 'json' };
import market03 from '../levels/market-03.json' with { type: 'json' };
import market04 from '../levels/market-04.json' with { type: 'json' };
import market05 from '../levels/market-05.json' with { type: 'json' };
import market06 from '../levels/market-06.json' with { type: 'json' };
import market07 from '../levels/market-07.json' with { type: 'json' };
import market08 from '../levels/market-08.json' with { type: 'json' };
import market09 from '../levels/market-09.json' with { type: 'json' };
import market10 from '../levels/market-10.json' with { type: 'json' };
import ferry01 from '../levels/ferry-01.json' with { type: 'json' };
import ferry02 from '../levels/ferry-02.json' with { type: 'json' };
import ferry03 from '../levels/ferry-03.json' with { type: 'json' };
import ferry04 from '../levels/ferry-04.json' with { type: 'json' };
import ferry05 from '../levels/ferry-05.json' with { type: 'json' };
import ferry06 from '../levels/ferry-06.json' with { type: 'json' };
import ferry07 from '../levels/ferry-07.json' with { type: 'json' };
import ferry08 from '../levels/ferry-08.json' with { type: 'json' };
import ferry09 from '../levels/ferry-09.json' with { type: 'json' };
import ferry10 from '../levels/ferry-10.json' with { type: 'json' };
import lighthouse01 from '../levels/lighthouse-01.json' with { type: 'json' };
import lighthouse02 from '../levels/lighthouse-02.json' with { type: 'json' };
import lighthouse03 from '../levels/lighthouse-03.json' with { type: 'json' };
import lighthouse04 from '../levels/lighthouse-04.json' with { type: 'json' };
import lighthouse05 from '../levels/lighthouse-05.json' with { type: 'json' };
import lighthouse06 from '../levels/lighthouse-06.json' with { type: 'json' };
import lighthouse07 from '../levels/lighthouse-07.json' with { type: 'json' };
import lighthouse08 from '../levels/lighthouse-08.json' with { type: 'json' };
import lighthouse09 from '../levels/lighthouse-09.json' with { type: 'json' };
import lighthouse10 from '../levels/lighthouse-10.json' with { type: 'json' };

export type { Cell, FenderCell, Level, PersonCell, SeagullCell } from './level.generated.js';

export interface LevelSet {
  readonly id: 'harbour' | 'market' | 'ferry' | 'lighthouse';
  /** One part of town, woken up level by level (ROADMAP Phase 2, the story). */
  readonly title: string;
  readonly levels: readonly Level[];
}

/**
 * Play order, in four sets. Validated by `pnpm validate:levels` (schema + solver), so the app
 * may trust it.
 */
export const sets: readonly LevelSet[] = [
  { id: 'harbour', title: 'The harbour', levels: [harbour01, harbour02, harbour03, harbour04, harbour05, harbour06, harbour07, harbour08, harbour09, harbour10] as Level[] },
  { id: 'market', title: 'The market', levels: [market01, market02, market03, market04, market05, market06, market07, market08, market09, market10] as Level[] },
  { id: 'ferry', title: 'The ferry', levels: [ferry01, ferry02, ferry03, ferry04, ferry05, ferry06, ferry07, ferry08, ferry09, ferry10] as Level[] },
  { id: 'lighthouse', title: 'The lighthouse', levels: [lighthouse01, lighthouse02, lighthouse03, lighthouse04, lighthouse05, lighthouse06, lighthouse07, lighthouse08, lighthouse09, lighthouse10] as Level[] },
];

export const levels: readonly Level[] = sets.flatMap((s) => s.levels);

/**
 * Each level's board revision (levels-progression.md). The 24 non-lesson levels of the first
 * three sets were regenerated bigger and on a curve (revision 2); a saved best from another
 * revision is not shown as stars. Levels born later (the lighthouse) start at revision 1; the
 * next regeneration of any level needs an explicit per-level map here.
 */
const LESSONS = new Set(['harbour-01', 'harbour-02', 'harbour-03', 'harbour-04', 'harbour-05', 'market-01']);
const REGENERATED: ReadonlySet<string> = new Set(
  sets.filter((s) => s.id === 'harbour' || s.id === 'market' || s.id === 'ferry').flatMap((s) => s.levels.map((l) => l.id)).filter((id) => !LESSONS.has(id)),
);
export function levelRevision(id: string): number {
  return REGENERATED.has(id) ? 2 : 1;
}

/**
 * Tutorial levels introduce one idea each and may have many minimum solutions or many par-first
 * taps (R10 warnings do not apply): the first three of the harbour and the chatterbox's debut.
 */
export const TUTORIAL_IDS: ReadonlySet<string> = new Set(['harbour-01', 'harbour-02', 'harbour-03', 'market-01']);

export function setOf(id: string): LevelSet | undefined {
  return sets.find((s) => s.levels.some((l) => l.id === id));
}

/** A level is a board plus metadata; core needs only the board. */
export function toBoard(level: Level): BoardSpec {
  return { width: level.width, height: level.height, cells: level.cells };
}

export function levelIndex(id: string): number {
  return levels.findIndex((l) => l.id === id);
}

export { DAILY_RECIPE, assess, candidate, cast, dailyLevel, dayId, generate, mix, rng } from './generate.js';
export type { DayStamp, Recipe, Quality } from './generate.js';
