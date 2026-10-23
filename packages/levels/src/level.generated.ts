/* Generated from level.schema.json by `pnpm --filter @moin/levels gen:types`. Do not edit. */

export type Cell = PersonCell | SeagullCell | FenderCell;
export type Facing = 'N' | 'E' | 'S' | 'W';

/**
 * A Moin Moin Moin level, formatVersion 1.x (CLAUDE.md §6).
 */
export interface Level {
  $schema?: string;
  formatVersion: string;
  id: string;
  title: string;
  width: number;
  height: number;
  cells: Cell[];
  /**
   * Must equal the solver's optimum.
   */
  par: number;
}
export interface PersonCell {
  x: number;
  y: number;
  kind: 'person';
  facing: Facing;
  needs: 1 | 2;
  role?: 'fisherman' | 'captain' | 'market' | 'kid';
}
export interface SeagullCell {
  x: number;
  y: number;
  kind: 'seagull';
}
export interface FenderCell {
  x: number;
  y: number;
  kind: 'fender';
  slant: 'rising' | 'falling';
}
