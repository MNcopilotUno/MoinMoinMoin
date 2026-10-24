import { personAt } from './board.js';
import { CELL, HALF_CELL, SMILE_DELAY } from './constants.js';
import { fly, moinAmount } from './flight.js';
import type { Game, MoinEvent, State, TapResult } from './types.js';

export function initialState(game: Game): State {
  return { greetings: game.people.map(() => 0), taps: 0 };
}

export function isSmiling(game: Game, state: State, index: number): boolean {
  const person = game.people[index];
  return person !== undefined && (state.greetings[index] ?? 0) >= person.needs;
}

/** §6.1: solved when every person smiles. */
export function isSolved(game: Game, state: State): boolean {
  return game.people.every((_, i) => isSmiling(game, state, i));
}

/** R7: 3 at par, 2 at par + 1, 1 otherwise. */
export function stars(taps: number, par: number): 1 | 2 | 3 {
  if (taps <= par) return 3;
  if (taps === par + 1) return 2;
  return 1;
}

/**
 * Tap the square (x, y). Pure: returns the next state and the ordered events (§5).
 * An ignored tap (R1, R2) returns the same state object and no events.
 */
export function tap(game: Game, state: State, x: number, y: number): TapResult {
  const first = personAt(game, x, y);
  if (first < 0 || isSmiling(game, state, first)) return { state, events: [] };

  const greetings = state.greetings.slice();
  const events: MoinEvent[] = [];
  let current = first;
  let source: 'tap' | 'moin' = 'tap';
  let amount: 1 | 2 = 1;
  let t = 0;
  let px = x * CELL + HALF_CELL;
  let py = y * CELL + HALF_CELL;

  for (;;) {
    const person = game.people[current];
    if (person === undefined) throw new Error(`no person ${current}`);
    const now = Math.min(person.needs, (greetings[current] ?? 0) + amount);
    greetings[current] = now;
    events.push({
      type: 'greeted', t, px, py, x: person.x, y: person.y, source, amount, greetings: now, needs: person.needs,
    });
    if (now < person.needs) {
      events.push({ type: 'chainEnded', t, px, py, reason: 'waiting' });
      break;
    }
    events.push({
      type: 'smiled', t, px: person.x * CELL + HALF_CELL, py: person.y * CELL + HALF_CELL,
      x: person.x, y: person.y,
    });
    const flight = fly(game, person, t + SMILE_DELAY);
    events.push(...flight.path);
    ({ t, px, py } = flight);
    const target = flight.target;
    if (target.kind === 'edge') {
      events.push({ type: 'chainEnded', t, px, py, reason: 'edge' });
      break;
    }
    if (target.kind === 'seagull') {
      events.push({ type: 'stolen', t, px, py, x: flight.x, y: flight.y });
      events.push({ type: 'chainEnded', t, px, py, reason: 'seagull' });
      break;
    }
    if ((greetings[target.index] ?? 0) >= (game.people[target.index]?.needs ?? 0)) {
      events.push({ type: 'chainEnded', t, px, py, reason: 'alreadySmiling' });
      break;
    }
    amount = moinAmount(person);
    current = target.index;
    source = 'moin';
  }
  return { state: { greetings, taps: state.taps + 1 }, events };
}

/** Apply a sequence of taps; convenience for replays, tests and the solver's checks. */
export function replay(
  game: Game,
  taps: readonly (readonly [number, number])[],
  from: State = initialState(game),
): { state: State; events: MoinEvent[][] } {
  let state = from;
  const events: MoinEvent[][] = [];
  for (const [x, y] of taps) {
    const result = tap(game, state, x, y);
    state = result.state;
    events.push([...result.events]);
  }
  return { state, events };
}
