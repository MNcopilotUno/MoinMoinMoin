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

export function sayMoin(pitch: number): void {
  if (ctx === null || ctx.state !== 'running') return;
  try {
    playMoin(ctx, { pitch, volume: 0.35 });
  } catch {
    // never let sound break play
  }
}
