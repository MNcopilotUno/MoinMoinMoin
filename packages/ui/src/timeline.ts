import { CELL, TICKS_PER_SECOND } from '@moin/core';
import type { Facing, MoinEvent } from '@moin/core';

/** Ticks a seagull shows off its loot after a theft. */
export const LOOT_TICKS = 50;
/** Ticks the animation lingers after its last event. */
export const TAIL_TICKS = 12;

export interface Frame {
  /** Greetings applied so far, keyed "x,y" (add to the state before the tap). */
  readonly greeted: ReadonlyMap<string, number>;
  /** The Moin in flight in sub-units, or null between flights. */
  readonly moin: {
    readonly px: number;
    readonly py: number;
    readonly amount: 1 | 2;
    /** Pops in after a launch, shrinks into whoever it reaches. */
    readonly scale: number;
    /** Direction of flight (the bubble's tail trails it). */
    readonly dir: Facing;
  } | null;
  /** People just reached by a Moin, keyed "x,y" (a brief ring on their tile). */
  readonly arrivals: ReadonlySet<string>;
  readonly thief: { readonly x: number; readonly y: number } | null;
  readonly bounce: { readonly x: number; readonly y: number; readonly key: number } | null;
  /** `launched` events whose tick passed since `since` (to play the Moin sound). */
  readonly launches: readonly Extract<MoinEvent, { type: 'launched' }>[];
  readonly done: boolean;
}

const startsFlight = (e: MoinEvent) => e.type === 'launched' || e.type === 'bounced';
const endsFlight = (e: MoinEvent) =>
  e.type === 'bounced' || e.type === 'stolen' || e.type === 'chainEnded' || (e.type === 'greeted' && e.source === 'moin');

/** Total ticks the animation of `events` takes. */
export function duration(events: readonly MoinEvent[]): number {
  const last = events[events.length - 1];
  if (last === undefined) return 0;
  const theft = events.some((e) => e.type === 'stolen');
  return last.t + (theft ? LOOT_TICKS : TAIL_TICKS);
}

/**
 * What to draw `tick` ticks after the tap. Pure: the UI interpolates core's events and decides
 * nothing (CLAUDE.md §4). `since` is the previous frame's tick, for one-off effects.
 */
export function frameAt(events: readonly MoinEvent[], tick: number, since = -1): Frame {
  const greeted = new Map<string, number>();
  let moin: Frame['moin'] = null;
  let thief: Frame['thief'] = null;
  let bounce: Frame['bounce'] = null;
  const launches: Extract<MoinEvent, { type: 'launched' }>[] = [];
  const arrivals = new Set<string>();
  let amount: 1 | 2 = 1;
  let launchedAt = 0;

  events.forEach((e, i) => {
    if (e.t > tick) return;
    if (e.type === 'greeted') {
      greeted.set(`${e.x},${e.y}`, (greeted.get(`${e.x},${e.y}`) ?? 0) + e.amount);
      if (e.source === 'moin' && tick - e.t < ARRIVAL_TICKS) arrivals.add(`${e.x},${e.y}`);
    }
    if (e.type === 'stolen' && tick < e.t + LOOT_TICKS) thief = { x: e.x, y: e.y };
    if (e.type === 'bounced') bounce = { x: e.x, y: e.y, key: e.t };
    if (e.type === 'launched') {
      amount = e.amount;
      launchedAt = e.t;
      if (e.t > since) launches.push(e);
    }
    if (startsFlight(e)) {
      const end = events.slice(i + 1).find(endsFlight);
      if (end !== undefined && tick < end.t) {
        const span = end.t - e.t;
        const k = span === 0 ? 1 : (tick - e.t) / span;
        // A small arc on level flights (UI only: core's path stays straight).
        const level = e.dir === 'E' || e.dir === 'W';
        const lift = level ? ARC * CELL * 4 * k * (1 - k) : 0;
        const sinceLaunch = tick - launchedAt;
        const toEnd = end.t - tick;
        const grow = sinceLaunch < POP_TICKS ? 0.5 + 0.5 * easeOutBack(sinceLaunch / POP_TICKS) : 1;
        const shrink = toEnd < SHRINK_TICKS ? 1 - 0.3 * (1 - toEnd / SHRINK_TICKS) : 1;
        moin = { px: e.px + (end.px - e.px) * k, py: e.py + (end.py - e.py) * k - lift, amount, scale: grow * shrink, dir: e.dir };
      }
    }
  });
  return { greeted, moin, thief, bounce, launches, arrivals, done: tick >= duration(events) };
}

/** Ticks the bubble takes to pop in after a launch, and to shrink into its target. */
export const POP_TICKS = 6;
export const SHRINK_TICKS = 4;
/** Arc height on level flights, as a fraction of a cell. */
export const ARC = 0.15;
/** Ticks a reached person's tile shows its ring. */
export const ARRIVAL_TICKS = 16;

function easeOutBack(x: number): number {
  const c = 1.4;
  return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2;
}

/**
 * Long chains speed up a little (UI only — core's ticks never change): from the 4th Moin each
 * launch adds 8 % playback speed, capped at 1.4×. `msAt` and `tickAt` convert between the
 * animation's wall-clock milliseconds and core ticks; sound is scheduled with the same mapping.
 */
export function rateAfter(launches: number): number {
  return Math.min(1.4, 1 + 0.08 * Math.max(0, launches - 3));
}

const tickMs = 1000 / TICKS_PER_SECOND;

export function msAt(events: readonly MoinEvent[], tick: number): number {
  let ms = 0, prev = 0, n = 0;
  for (const e of events) {
    if (e.type !== 'launched') continue;
    if (e.t > tick) break;
    ms += ((e.t - prev) / rateAfter(n)) * tickMs;
    prev = e.t;
    n++;
  }
  return ms + ((tick - prev) / rateAfter(n)) * tickMs;
}

export function tickAt(events: readonly MoinEvent[], ms: number): number {
  let acc = 0, prev = 0, n = 0;
  for (const e of events) {
    if (e.type !== 'launched') continue;
    const segment = ((e.t - prev) / rateAfter(n)) * tickMs;
    if (acc + segment > ms) break;
    acc += segment;
    prev = e.t;
    n++;
  }
  return prev + ((ms - acc) / tickMs) * rateAfter(n);
}
