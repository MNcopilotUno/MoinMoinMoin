export type Facing = 'N' | 'E' | 'S' | 'W';
export type Slant = 'rising' | 'falling';
export type Role = 'fisherman' | 'captain' | 'market' | 'kid';

export interface PersonCell {
  readonly x: number;
  readonly y: number;
  readonly kind: 'person';
  readonly facing: Facing;
  readonly needs: 1 | 2;
  readonly role?: Role;
  /** R13: says *Moin moin* — their Moin carries two greetings. */
  readonly chatterbox?: boolean;
}

export interface SeagullCell {
  readonly x: number;
  readonly y: number;
  readonly kind: 'seagull';
}

export interface FenderCell {
  readonly x: number;
  readonly y: number;
  readonly kind: 'fender';
  readonly slant: Slant;
}

export type Cell = PersonCell | SeagullCell | FenderCell;

/** What `createGame` needs: the shape of a level without its metadata. */
export interface BoardSpec {
  readonly width: number;
  readonly height: number;
  readonly cells: readonly Cell[];
}

/** Where a person's Moin ends up. Static: it depends only on the board. */
export type Target =
  | { readonly kind: 'person'; readonly index: number }
  | { readonly kind: 'seagull' }
  | { readonly kind: 'edge' };

export interface Game {
  readonly width: number;
  readonly height: number;
  readonly cells: readonly Cell[];
  /** People in the order of `cells`; state arrays are indexed the same way. */
  readonly people: readonly PersonCell[];
  /** Row-major `width × height` lookup into `cells`, -1 for empty water. */
  readonly grid: readonly number[];
  /** Row-major lookup into `people`, -1 where there is no person. */
  readonly personGrid: readonly number[];
}

export interface State {
  /** Greetings received per person (same order as `Game.people`), capped at `needs`. */
  readonly greetings: readonly number[];
  /** Counted taps (R1, R2 taps are not counted). */
  readonly taps: number;
}

export type ChainEndReason = 'edge' | 'seagull' | 'alreadySmiling' | 'waiting';

interface At {
  /** Tick at which the event happens, counted from the tap. */
  readonly t: number;
  /** Sub-unit point where it happens (R12). */
  readonly px: number;
  readonly py: number;
}

export interface GreetedEvent extends At {
  readonly type: 'greeted';
  readonly x: number;
  readonly y: number;
  readonly source: 'tap' | 'moin';
  /** Greetings delivered: 1, or 2 from a chatterbox (R13). */
  readonly amount: 1 | 2;
  /** Greetings now held, capped at `needs`. */
  readonly greetings: number;
  readonly needs: 1 | 2;
}
export interface SmiledEvent extends At {
  readonly type: 'smiled';
  readonly x: number;
  readonly y: number;
}
export interface LaunchedEvent extends At {
  readonly type: 'launched';
  readonly x: number;
  readonly y: number;
  readonly dir: Facing;
  /** Greetings the Moin carries: 2 for a chatterbox (R13). */
  readonly amount: 1 | 2;
}
export interface BouncedEvent extends At {
  readonly type: 'bounced';
  readonly x: number;
  readonly y: number;
  readonly dir: Facing;
}
export interface StolenEvent extends At {
  readonly type: 'stolen';
  readonly x: number;
  readonly y: number;
}
export interface ChainEndedEvent extends At {
  readonly type: 'chainEnded';
  readonly reason: ChainEndReason;
}

export type MoinEvent =
  | GreetedEvent
  | SmiledEvent
  | LaunchedEvent
  | BouncedEvent
  | StolenEvent
  | ChainEndedEvent;

export interface TapResult {
  readonly state: State;
  readonly events: readonly MoinEvent[];
}
