import { playBells, playHorn, playMoin, playSquawk, playTok, playUndo } from '@moin/assets';
import type { MoinEvent } from '@moin/core';
import { noteFor } from '@moin/ui';

/**
 * Sound is optional and never blocking (CLAUDE.md §7). The AudioContext is created or resumed on
 * the first touch, never on load (§8). Everything plays through one master bus with a gentle
 * compressor, so the mix stays even and mute can fade instead of cutting (QA feel M2).
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
/** Master level 0–1 from the volume setting (squared: closer to how loud it sounds). */
let level = 1;
let haptics = true;

const target = () => (muted ? 0 : level);

export function unlockAudio(): void {
  try {
    if (ctx === null) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 3;
      comp.attack.value = 0.005;
      comp.release.value = 0.15;
      master = ctx.createGain();
      master.gain.value = target();
      master.connect(comp).connect(ctx.destination);
    }
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

function ready(): (AudioContext & { state: 'running' }) | null {
  return ctx !== null && master !== null && ctx.state === 'running' ? (ctx as AudioContext & { state: 'running' }) : null;
}

export function setMuted(value: boolean): void {
  muted = value;
  if (ctx && master) master.gain.setTargetAtTime(target(), ctx.currentTime, 0.02);
}

/** Volume setting, 0–100. */
export function setVolume(percent: number): void {
  level = (Math.max(0, Math.min(100, percent)) / 100) ** 2;
  if (ctx && master) master.gain.setTargetAtTime(target(), ctx.currentTime, 0.02);
}

/** Haptics setting, independent of sound (settings.md). */
export function setHaptics(on: boolean): void {
  haptics = on;
}

export interface ChainSound {
  /** Fade out whatever is still to come (skip, undo, restart). */
  cancel(): void;
}

const silent: ChainSound = { cancel() {} };

/**
 * Schedule every sound of a tap up front on the audio clock (QA feel M3), using the animation's
 * own tick → milliseconds mapping: each Moin one note higher with a slight crescendo, a captain's
 * grudging "Mo-", a wooden tok per fender bounce, a squawk when a gull steals.
 */
export function scheduleChain(events: readonly MoinEvent[], msAt: (tick: number) => number): ChainSound {
  const c = ready();
  if (c === null || master === null || muted) return silent;
  try {
    const bus = c.createGain();
    bus.connect(master);
    const base = c.currentTime + 0.03;
    const at = (t: number) => base + msAt(t) / 1000;
    const launches = events.filter((e): e is Extract<MoinEvent, { type: 'launched' }> => e.type === 'launched');
    launches.forEach((e, i) => {
      const next = launches[i + 1];
      const gap = next ? (msAt(next.t) - msAt(e.t)) / 1000 : 0.5;
      const duration = Math.min(0.5, Math.max(0.3, gap + 0.06));
      const volume = 0.35 * 10 ** ((0.4 * Math.min(i, 8)) / 20);
      const end = playMoin(c, { pitch: noteFor(i), volume, when: at(e.t), duration, destination: bus });
      if (e.amount === 2) playMoin(c, { pitch: noteFor(i) - 2, volume: 0.24, when: end - 0.12, duration: 0.32, destination: bus });
    });
    let bounces = 0;
    for (const e of events) {
      if (e.type === 'launched') bounces = 0;
      if (e.type === 'bounced') playTok(c, bounces++, { when: at(e.t), destination: bus });
      if (e.type === 'stolen') playSquawk(c, 0.6, { when: at(e.t), destination: bus });
    }
    const first = events[0];
    if (first?.type === 'greeted' && first.source === 'tap' && first.greetings < first.needs) {
      playMoin(c, { pitch: -3, volume: 0.25, syllable: 'mo', when: base, destination: bus });
    }
    return {
      cancel() {
        try {
          bus.gain.setTargetAtTime(0, c.currentTime, 0.01);
        } catch {
          // already gone
        }
      },
    };
  } catch {
    return silent;
  }
}

/** Ambient sounds for poking the harbour's life; never part of a move. */
export function sayAmbient(kind: 'squawk' | 'horn' | 'moin', pitch = 0): void {
  const c = ready();
  if (c === null || master === null || muted) return;
  try {
    if (kind === 'squawk') playSquawk(c, 0.6, { destination: master });
    else if (kind === 'horn') playHorn(c, 0.1, { destination: master });
    else playMoin(c, { pitch, volume: 0.22, destination: master });
  } catch {
    // never let sound break play
  }
}

export function sayWin(stars: 1 | 2 | 3): void {
  const c = ready();
  if (c && master && !muted) playBells(c, stars, { destination: master });
}

export function sayUndo(): void {
  const c = ready();
  if (c && master && !muted) playUndo(c, { destination: master });
}

/** Light haptics on Android (iOS ignores them); off with the haptics setting. */
export function buzz(pattern: number | number[]): void {
  if (!haptics) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // unsupported
  }
}
