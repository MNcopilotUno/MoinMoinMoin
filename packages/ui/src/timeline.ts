import type { MoinEvent } from '@moin/core';

/** Ticks a seagull shows off its loot after a theft. */
export const LOOT_TICKS = 50;
/** Ticks the animation lingers after its last event. */
export const TAIL_TICKS = 12;

export interface Frame {
  /** Greetings applied so far, keyed "x,y" (add to the state before the tap). */
  readonly greeted: ReadonlyMap<string, number>;
  /** The Moin in flight in sub-units, or null between flights. */
  readonly moin: { readonly px: number; readonly py: number; readonly amount: 1 | 2 } | null;
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
  let amount: 1 | 2 = 1;

  events.forEach((e, i) => {
    if (e.t > tick) return;
    if (e.type === 'greeted') greeted.set(`${e.x},${e.y}`, (greeted.get(`${e.x},${e.y}`) ?? 0) + 1);
    if (e.type === 'stolen' && tick < e.t + LOOT_TICKS) thief = { x: e.x, y: e.y };
    if (e.type === 'bounced') bounce = { x: e.x, y: e.y, key: e.t };
    if (e.type === 'launched') {
      amount = e.amount;
      if (e.t > since) launches.push(e);
    }
    if (startsFlight(e)) {
      const end = events.slice(i + 1).find(endsFlight);
      if (end !== undefined && tick < end.t) {
        const span = end.t - e.t;
        const k = span === 0 ? 1 : (tick - e.t) / span;
        moin = { px: e.px + (end.px - e.px) * k, py: e.py + (end.py - e.py) * k, amount };
      }
    }
  });
  return { greeted, moin, thief, bounce, launches, done: tick >= duration(events) };
}
