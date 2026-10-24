/**
 * The chain plays a tune (ROADMAP Phase 2): each Moin in a chain one note higher, on a major
 * pentatonic scale so any chain sounds like a melody. Values are semitones above the base voice.
 */
export const TUNE: readonly number[] = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];

/** Semitones for the `step`-th Moin of a chain (0 = the first); the top note repeats. */
export function noteFor(step: number): number {
  return TUNE[Math.min(Math.max(step, 0), TUNE.length - 1)] as number;
}
