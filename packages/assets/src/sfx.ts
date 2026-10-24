/**
 * Small synthesised harbour sounds for the ambient life around the puzzle (no sample files).
 * Call only after a user gesture, like `playMoin`.
 */

/** A cheeky gull: a falling, noisy "kee-aw". */
export function playSquawk(ctx: BaseAudioContext, volume = 0.25): void {
  const t0 = ctx.currentTime;
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
    osc.connect(band).connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.17);
  }
}

/** A small boat's horn: two low, slightly detuned tones. */
export function playHorn(ctx: BaseAudioContext, volume = 0.22): void {
  const t0 = ctx.currentTime;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.06);
  gain.gain.setValueAtTime(volume, t0 + 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.8);
  const low = ctx.createBiquadFilter();
  low.type = 'lowpass';
  low.frequency.value = 600;
  low.connect(gain).connect(ctx.destination);
  for (const f of [146.8, 148.2]) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = f;
    osc.connect(low);
    osc.start(t0);
    osc.stop(t0 + 0.82);
  }
}
