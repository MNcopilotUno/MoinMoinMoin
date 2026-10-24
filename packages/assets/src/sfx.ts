/**
 * Small synthesised harbour sounds for the ambient life around the puzzle (no sample files).
 * Call only after a user gesture, like `playMoin`.
 */

/** A cheeky gull: a falling, noisy "kee-aw". */
export interface Cue {
  readonly when?: number;
  readonly destination?: AudioNode;
}

export function playSquawk(ctx: BaseAudioContext, volume = 0.6, cue: Cue = {}): void {
  const t0 = cue.when ?? ctx.currentTime;
  const dest = cue.destination ?? ctx.destination;
  for (let k = 0; k < 2; k++) {
    const t = t0 + k * 0.16;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1500 - k * 200, t);
    osc.frequency.exponentialRampToValueAtTime(700 - k * 120, t + 0.14);
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 1800;
    band.Q.value = 3;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    osc.connect(band).connect(gain).connect(dest);
    osc.start(t);
    osc.stop(t + 0.17);
  }
}

/** A small boat's horn: two low, slightly detuned tones. */
export function playHorn(ctx: BaseAudioContext, volume = 0.1, cue: Cue = {}): void {
  const t0 = cue.when ?? ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.06);
  gain.gain.setValueAtTime(volume, t0 + 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.8);
  const low = ctx.createBiquadFilter();
  low.type = 'lowpass';
  low.frequency.value = 600;
  low.connect(gain).connect(cue.destination ?? ctx.destination);
  for (const f of [146.8, 148.2]) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = f;
    osc.connect(low);
    osc.start(t0);
    osc.stop(t0 + 0.82);
  }
}

/** A Moin hitting a fender: a short wooden "tok", a little lower with each bounce. */
export function playTok(ctx: BaseAudioContext, bounce = 0, cue: Cue = {}): void {
  const t0 = cue.when ?? ctx.currentTime;
  const ratio = 2 ** (-2 * bounce / 12);
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(190 * ratio, t0);
  osc.frequency.exponentialRampToValueAtTime(120 * ratio, t0 + 0.06);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1);
  osc.connect(gain).connect(cue.destination ?? ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.11);
}

/** One soft bell: a sine with an inharmonic partial, long exponential decay. */
function bell(ctx: BaseAudioContext, freq: number, t0: number, dest: AudioNode, gainValue = 0.22): void {
  for (const [mult, level] of [[1, 1], [2.76, 0.3]] as const) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * mult;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(gainValue * level, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);
    osc.connect(gain).connect(dest);
    osc.start(t0);
    osc.stop(t0 + 1.25);
  }
}

/** The win: one bell per star, timed with the stars popping in (0, 120, 240 ms). */
export function playBells(ctx: BaseAudioContext, stars: 1 | 2 | 3, cue: Cue = {}): void {
  const t0 = cue.when ?? ctx.currentTime;
  const base = 190;
  [12, 16, 19].slice(0, stars).forEach((st, i) => bell(ctx, base * 2 ** (st / 12), t0 + i * 0.12, cue.destination ?? ctx.destination));
}

/** Undo / restart: a soft two-note fall. */
export function playUndo(ctx: BaseAudioContext, cue: Cue = {}): void {
  const t0 = cue.when ?? ctx.currentTime;
  const dest = cue.destination ?? ctx.destination;
  bell(ctx, 190 * 2 ** (4 / 12) * 2, t0, dest, 0.15);
  bell(ctx, 190 * 2, t0 + 0.12, dest, 0.15);
}
