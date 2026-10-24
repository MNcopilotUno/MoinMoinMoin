import { playMoin } from '@moin/assets';

/**
 * Sound is optional and never blocking (CLAUDE.md §7). The AudioContext is created or resumed on
 * the first tap, never on load (§8). Until then the game is silent.
 */
let ctx: AudioContext | null = null;

export function unlockAudio(): void {
  try {
    if (ctx === null) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

/** Say Moin at `pitch` semitones; a chatterbox (`amount` 2) says it twice — Moin moin. */
export function sayMoin(pitch: number, amount: 1 | 2 = 1): void {
  if (ctx === null || ctx.state !== 'running') return;
  try {
    const end = playMoin(ctx, { pitch, volume: 0.35 });
    if (amount === 2) playMoin(ctx, { pitch, volume: 0.3, when: end - 0.12 });
  } catch {
    // never let sound break play
  }
}
