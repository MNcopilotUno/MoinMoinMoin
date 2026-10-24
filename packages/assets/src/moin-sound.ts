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
  /** Where to play (a master bus, or a per-chain gain that can be cut); defaults to the speakers. */
  readonly destination?: AudioNode;
  /** Seconds; shorter voices keep fast chains from smearing (0.3–0.5). */
  readonly duration?: number;
  /** 'mo' is only the first syllable: the captain's grudging half-greeting. */
  readonly syllable?: 'moin' | 'mo';
}

/**
 * Per-note loudness trim in dB for the chain tune (QA: 400 ms K-weighted loudness swung 11 LU across
 * the scale with narrow formants). Measured against a −24 LUFS target after widening the formants.
 */
const TRIM_DB: Readonly<Record<number, number>> = {
  0: -0.8, 2: -0.1, 4: 1.6, 7: 0.1, 9: -3.5, 12: -5.6, 14: -4.7, 16: -0.4, 19: 3.9, 21: 3.8, 24: -1.6,
};

const O = [450, 820, 2600] as const;
const I = [300, 2200, 2950] as const;

export function playMoin(ctx: BaseAudioContext, voice: MoinVoice = {}): number {
  const t0 = voice.when ?? ctx.currentTime;
  const ratio = 2 ** ((voice.pitch ?? 0) / 12);
  const trim = TRIM_DB[Math.round(voice.pitch ?? 0)] ?? 0;
  const volume = (voice.volume ?? 0.5) * 10 ** (trim / 20);
  const mo = voice.syllable === 'mo';
  const dur = mo ? 0.22 : Math.min(0.5, Math.max(0.3, voice.duration ?? 0.5));
  const k = dur / 0.5;
  const dest = voice.destination ?? ctx.destination;

  const source = ctx.createOscillator();
  source.type = 'sawtooth';
  source.frequency.setValueAtTime(190 * ratio, t0);
  source.frequency.linearRampToValueAtTime(215 * ratio, t0 + 0.16 * k);
  source.frequency.exponentialRampToValueAtTime((mo ? 185 : 150) * ratio, t0 + dur);

  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, t0);
  out.gain.exponentialRampToValueAtTime(volume, t0 + 0.04);
  out.gain.setValueAtTime(volume, t0 + (mo ? 0.14 : 0.34 * k));
  out.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  out.connect(dest);

  // Nasal [m] and [n]: a low hum that fades out under the vowel and back in at the end.
  const nasal = ctx.createBiquadFilter();
  nasal.type = 'lowpass';
  nasal.frequency.value = 320;
  const nasalGain = ctx.createGain();
  nasalGain.gain.setValueAtTime(0.9, t0);
  nasalGain.gain.linearRampToValueAtTime(0.15, t0 + 0.1 * k);
  nasalGain.gain.linearRampToValueAtTime(0.15, t0 + (mo ? 0.2 : 0.34 * k));
  if (!mo) nasalGain.gain.linearRampToValueAtTime(0.8, t0 + 0.42 * k);
  source.connect(nasal).connect(nasalGain).connect(out);

  // The vowel: three formants gliding [o] → [i].
  const vowelGain = ctx.createGain();
  vowelGain.gain.setValueAtTime(0, t0);
  vowelGain.gain.linearRampToValueAtTime(1, t0 + 0.09 * k);
  vowelGain.gain.linearRampToValueAtTime(1, t0 + (mo ? 0.18 : 0.34 * k));
  vowelGain.gain.linearRampToValueAtTime(0.1, t0 + (mo ? 0.22 : 0.44 * k));
  vowelGain.connect(out);
  O.forEach((from, f) => {
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 5;
    band.frequency.setValueAtTime(from, t0);
    band.frequency.setValueAtTime(from, t0 + 0.18 * k);
    if (!mo) band.frequency.exponentialRampToValueAtTime(I[f] ?? from, t0 + 0.32 * k);
    const g = ctx.createGain();
    g.gain.value = [1.4, 0.9, 0.35][f] ?? 0.5;
    source.connect(band).connect(g).connect(vowelGain);
  });

  source.start(t0);
  source.stop(t0 + dur + 0.02);
  return t0 + dur;
}
