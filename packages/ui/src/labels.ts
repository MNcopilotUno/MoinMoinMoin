import type { Cell, MoinEvent, PersonCell } from '@moin/core';
import { copy } from './copy/en.js';

/** The role a person is drawn as: captains are whoever needs two greetings. */
export function roleOf(person: PersonCell): 'fisherman' | 'captain' | 'market' | 'kid' {
  if (person.needs === 2) return 'captain';
  return person.role === 'captain' ? 'fisherman' : person.role ?? 'fisherman';
}

/**
 * Accessible name for a person button (CLAUDE.md §7), e.g.
 * "Grumpy captain, facing east, needs two greetings".
 */
export function personLabel(person: PersonCell, greetings: number): string {
  const role = copy.role[roleOf(person)] + (person.chatterbox === true ? `, ${copy.chatterbox}` : '');
  const facing = `facing ${copy.facing[person.facing]}`;
  if (greetings >= person.needs) return `Smiling ${role}, ${facing}`;
  const left = person.needs - greetings;
  const needs = greetings > 0
    ? `half-greeted, needs ${copy.count[left]} more`
    : `needs ${copy.count[person.needs]} ${person.needs === 1 ? 'greeting' : 'greetings'}`;
  return `Grumpy ${role}, ${facing}, ${needs}`;
}

export function cellLabel(cell: Cell, greetings = 0): string {
  if (cell.kind === 'person') return personLabel(cell, greetings);
  if (cell.kind === 'seagull') return copy.seagull;
  return copy.fender[cell.slant];
}

/** One sentence for the screen reader announcing what a tap did (CLAUDE.md §7). */
export function announceTap(events: readonly MoinEvent[], solved: boolean): string {
  if (events.length === 0) return '';
  const parts: string[] = [];
  const smiles = events.filter((e) => e.type === 'smiled').length;
  if (smiles > 0) parts.push(copy.announce.smiled(smiles));
  const last = events[events.length - 1];
  if (last?.type === 'chainEnded' && !solved) parts.push(copy.announce[last.reason]);
  if (solved) parts.push(copy.announce.solved);
  return parts.join(' ');
}
