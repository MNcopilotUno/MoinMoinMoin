import type { MoinEvent } from '@moin/core';
import { lines as allLines } from './lines.js';
import type { Line, Trigger } from './lines.js';

/** Smiles in one tap from which the narrator calls it a long chain. */
export const LONG_CHAIN = 3;
/** Taps the narrator stays quiet after speaking before remarking on a Moin lost at sea. */
export const EDGE_QUIET_TAPS = 3;

/**
 * What a tap's events are worth talking about, most remarkable first. Pure; reads the same
 * events the UI animates (CLAUDE.md §4).
 */
export function triggerForTap(events: readonly MoinEvent[]): Trigger | null {
  if (events.length === 0) return null;
  if (events.some((e) => e.type === 'greeted' && e.amount === 2 && e.needs === 2 && e.greetings === 2)) return 'chatterbox';
  if (events.filter((e) => e.type === 'smiled').length >= LONG_CHAIN) return 'longChain';
  const last = events[events.length - 1];
  if (last?.type !== 'chainEnded') return null;
  if (last.reason === 'seagull') return 'stolen';
  if (last.reason === 'waiting') {
    const greeted = [...events].reverse().find((e) => e.type === 'greeted');
    return greeted?.type === 'greeted' && greeted.needs === 2 ? 'waiting' : null;
  }
  if (last.reason === 'edge') return 'edge';
  return null;
}

export interface NarratorMemory {
  /** The line spoken last, never repeated twice in a row. */
  readonly lastLineId: string | null;
  /** How many lines have been spoken; rotates through candidates without randomness. */
  readonly spoken: number;
  /** Taps since the narrator last spoke. */
  readonly quietTaps: number;
}

export const freshMemory: NarratorMemory = { lastLineId: null, spoken: 0, quietTaps: EDGE_QUIET_TAPS };

export interface Cue {
  readonly trigger: Trigger;
  /** The level (`levelStart`) or set (`setComplete`) the cue is about. */
  readonly levelId?: string;
}

/**
 * Pick the line for a cue, or `null` to stay quiet. Deterministic: same memory and cue, same
 * line. Never the same line twice in a row; edge remarks only after a quiet spell.
 */
export function pickLine(
  cue: Cue,
  memory: NarratorMemory,
  lines: readonly Line[] = allLines,
): { line: Line | null; memory: NarratorMemory } {
  const quiet = { ...memory, quietTaps: memory.quietTaps + 1 };
  if (cue.trigger === 'edge' && memory.quietTaps < EDGE_QUIET_TAPS) return { line: null, memory: quiet };
  const candidates = lines.filter(
    (l) => l.trigger === cue.trigger && (l.levelId === undefined || l.levelId === cue.levelId),
  );
  const fresh = candidates.filter((l) => l.id !== memory.lastLineId);
  if (fresh.length === 0) return { line: null, memory: quiet };
  const line = fresh[memory.spoken % fresh.length] as Line;
  return { line, memory: { lastLineId: line.id, spoken: memory.spoken + 1, quietTaps: 0 } };
}
