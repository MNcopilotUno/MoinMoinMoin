import { describe, expect, it } from 'vitest';
import { createGame, initialState, tap } from '@moin/core';
import type { PersonCell } from '@moin/core';
import { announceTap, cellLabel, personLabel, roleOf } from '../src/index.js';

const fisherman: PersonCell = { x: 0, y: 0, kind: 'person', facing: 'E', needs: 1 };
const captain: PersonCell = { x: 0, y: 0, kind: 'person', facing: 'S', needs: 2 };

describe('labels (CLAUDE.md §7)', () => {
  it.each([
    [captain, 0, 'Grumpy captain, facing south, needs two greetings'],
    [captain, 1, 'Grumpy captain, facing south, half-greeted, needs one more'],
    [captain, 2, 'Smiling captain, facing south'],
    [fisherman, 0, 'Grumpy fisherman, facing east, needs one greeting'],
    [{ ...fisherman, role: 'market', facing: 'W' } as PersonCell, 0, 'Grumpy market woman, facing west, needs one greeting'],
    [{ ...fisherman, role: 'kid', facing: 'N' } as PersonCell, 1, 'Smiling kid, facing north'],
  ])('%#: %s', (person, greetings, label) => {
    expect(personLabel(person, greetings)).toBe(label);
  });

  it('a person who needs two is drawn as the captain whatever the role says', () => {
    expect(roleOf({ ...captain, role: 'kid' })).toBe('captain');
    expect(roleOf({ ...fisherman, role: 'captain' })).toBe('fisherman');
  });

  it('seagulls and fenders have names too', () => {
    expect(cellLabel({ x: 0, y: 0, kind: 'seagull' })).toBe('Seagull');
    expect(cellLabel({ x: 0, y: 0, kind: 'fender', slant: 'rising' })).toMatch(/^Fender.*east to north/);
  });
});

describe('announceTap', () => {
  const game = createGame({ width: 4, height: 1, cells: [
    { x: 0, y: 0, kind: 'person', facing: 'E', needs: 1 },
    { x: 1, y: 0, kind: 'person', facing: 'E', needs: 1 },
    { x: 2, y: 0, kind: 'seagull' },
  ] });
  it('says how many smiled and how the chain ended', () => {
    const { events } = tap(game, initialState(game), 0, 0);
    expect(announceTap(events, false)).toBe('Two people smiled. A seagull stole the Moin.');
    expect(announceTap(events, true)).toBe('Two people smiled. Everyone is smiling.');
  });
  it('says nothing for an ignored tap', () => {
    expect(announceTap([], false)).toBe('');
  });
});
