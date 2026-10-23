/**
 * The Moin sound: an original, synthesised "Mo-in" — a voiced source through vowel formant
 * filters gliding from [o] to [i], with a nasal hum at both ends ([m] … [n]). No sample file:
 * nothing to license, a few hundred bytes, and pitchable.
 *
 * Call only after a user gesture (CLAUDE.md §8: audio before a user gesture).
 */
export interface MoinVoice {
  /** Semitones above the base voice (the Phase 2 tune can use this). */
  readonly pitch?: number;
  /** 0–1. */
  readonly volume?: number;
  /** AudioContext time to start; defaults to now. */
  readonly when?: number;
}

const O = [450, 820, 2600] as const;
const I = [300, 2200, 2950] as const;

export function playMoin(ctx: BaseAudioContext, voice: MoinVoice = {}): number {
  const t0 = voice.when ?? ctx.currentTime;
  const ratio = 2 ** ((voice.pitch ?? 0) / 12);
  const volume = voice.volume ?? 0.5;
  const dur = 0.5;

  const source = ctx.createOscillator();
  source.type = 'sawtooth';
  source.frequency.setValueAtTime(190 * ratio, t0);
  source.frequency.linearRampToValueAtTime(215 * ratio, t0 + 0.16);
  source.frequency.exponentialRampToValueAtTime(150 * ratio, t0 + dur);

  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, t0);
  out.gain.exponentialRampToValueAtTime(volume, t0 + 0.04);
  out.gain.setValueAtTime(volume, t0 + 0.34);
  out.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  out.connect(ctx.destination);

  // Nasal [m] and [n]: a low hum that fades out under the vowel and back in at the end.
  const nasal = ctx.createBiquadFilter();
  nasal.type = 'lowpass';
  nasal.frequency.value = 320;
  const nasalGain = ctx.createGain();
  nasalGain.gain.setValueAtTime(0.9, t0);
  nasalGain.gain.linearRampToValueAtTime(0.15, t0 + 0.1);
  nasalGain.gain.linearRampToValueAtTime(0.15, t0 + 0.34);
  nasalGain.gain.linearRampToValueAtTime(0.8, t0 + 0.42);
  source.connect(nasal).connect(nasalGain).connect(out);

  // The vowel: three formants gliding [o] → [i].
  const vowelGain = ctx.createGain();
  vowelGain.gain.setValueAtTime(0, t0);
  vowelGain.gain.linearRampToValueAtTime(1, t0 + 0.09);
  vowelGain.gain.linearRampToValueAtTime(1, t0 + 0.34);
  vowelGain.gain.linearRampToValueAtTime(0.1, t0 + 0.44);
  vowelGain.connect(out);
  O.forEach((from, k) => {
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 9;
    band.frequency.setValueAtTime(from, t0);
    band.frequency.setValueAtTime(from, t0 + 0.18);
    band.frequency.exponentialRampToValueAtTime(I[k] ?? from, t0 + 0.32);
    const g = ctx.createGain();
    g.gain.value = [1.4, 0.9, 0.35][k] ?? 0.5;
    source.connect(band).connect(g).connect(vowelGain);
  });

  source.start(t0);
  source.stop(t0 + dur + 0.02);
  return t0 + dur;
}
