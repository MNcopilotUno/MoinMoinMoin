import { describe, expect, it } from 'vitest';
import { createGame, initialState, tap } from '@moin/core';
import type { BoardSpec, Cell } from '@moin/core';
import { freshMemory, lines, pickLine, triggerForTap } from '../src/index.js';
import type { Trigger } from '../src/index.js';

const row = (tokens: string): BoardSpec => ({
  width: tokens.split(' ').length,
  height: 1,
  cells: tokens.split(' ').flatMap((t, x): Cell[] => {
    if (t === '.') return [];
    if (t === 'g') return [{ x, y: 0, kind: 'seagull' as const }];
    return [{ x, y: 0, kind: 'person' as const, facing: t[0] as 'E', needs: Number(t[1]) as 1 | 2, ...(t[2] === '*' ? { chatterbox: true } : {}) }];
  }),
});
const firstTap = (tokens: string) => {
  const game = createGame(row(tokens));
  return tap(game, initialState(game), 0, 0).events;
};

describe('lines (data)', () => {
  it('one intro per level for all thirty, plus the reactions', () => {
    expect(lines.filter((l) => l.trigger === 'levelStart')).toHaveLength(30);
    expect(new Set(lines.filter((l) => l.trigger === 'levelStart').map((l) => l.levelId)).size).toBe(30);
    expect(lines.filter((l) => l.trigger !== 'levelStart' && l.trigger !== 'setComplete').length).toBeGreaterThanOrEqual(18);
  });

  it('the story: each part of town gets a line when it wakes up', () => {
    for (const set of ['harbour', 'market', 'ferry']) {
      expect(pickLine({ trigger: 'setComplete', levelId: set }, freshMemory).line?.id).toBe(`set-${set}`);
    }
  });

  it('every line is one sentence and ids are unique', () => {
    expect(new Set(lines.map((l) => l.id)).size).toBe(lines.length);
    for (const l of lines) {
      expect(l.text.length, l.id).toBeLessThanOrEqual(90);
      expect(l.text, l.id).toMatch(/[.!?]$/);
      expect(l.text.slice(0, -1), l.id).not.toMatch(/[.!?] [A-Z]/);
    }
  });
});

describe('triggerForTap', () => {
  it.each<[string, string, Trigger | null]>([
    ['long chain', 'E1 E1 E1', 'longChain'],
    ['stolen', 'E1 g', 'stolen'],
    ['captain half-greeted', 'E1 E2', 'waiting'],
    ['lost at sea', 'E1 .', 'edge'],
    ['smiled back', 'E1 W1', null],
    ['own captain tap, needs two', 'E2 .', 'waiting'],
    ['chatterbox wakes a captain in one go', 'E1* E2 .', 'chatterbox'],
    ['chatterbox into a fisherman is just a chain', 'E1* E1 .', 'edge'],
  ])('%s', (_, tokens, trigger) => {
    expect(triggerForTap(firstTap(tokens))).toBe(trigger);
  });

  it('an ignored tap says nothing', () => {
    expect(triggerForTap([])).toBeNull();
  });
});

describe('pickLine', () => {
  it('plays the intro of the level being started', () => {
    const { line } = pickLine({ trigger: 'levelStart', levelId: 'harbour-04' }, freshMemory);
    expect(line?.id).toBe('intro-04');
    expect(pickLine({ trigger: 'levelStart', levelId: 'ferry-09' }, freshMemory).line?.id).toBe('intro-ferry-09');
  });

  it('never repeats the same line twice in a row', () => {
    let memory = freshMemory;
    let last: string | null = null;
    for (let i = 0; i < 30; i++) {
      const r = pickLine({ trigger: (['stolen', 'longChain', 'solvedPar'] as const)[i % 2 === 0 ? 0 : 1] }, memory);
      expect(r.line?.id).not.toBe(last);
      last = r.line?.id ?? last;
      memory = r.memory;
    }
  });

  it('stays quiet rather than repeat a trigger with a single line', () => {
    const first = pickLine({ trigger: 'undo' }, freshMemory);
    expect(first.line?.id).toBe('undo-1');
    const second = pickLine({ trigger: 'undo' }, first.memory);
    expect(second.line).toBeNull();
  });

  it('is deterministic', () => {
    const a = pickLine({ trigger: 'stolen' }, { lastLineId: null, spoken: 7, quietTaps: 0 });
    const b = pickLine({ trigger: 'stolen' }, { lastLineId: null, spoken: 7, quietTaps: 0 });
    expect(a).toEqual(b);
  });

  it('remarks on a Moin lost at sea only after a quiet spell', () => {
    const spoke = pickLine({ trigger: 'stolen' }, freshMemory).memory;
    expect(pickLine({ trigger: 'edge' }, spoke).line).toBeNull();
    let memory = spoke;
    for (let i = 0; i < 3; i++) memory = pickLine({ trigger: 'edge' }, memory).memory;
    expect(pickLine({ trigger: 'edge' }, memory).line?.trigger).toBe('edge');
  });

  it('an unknown level has no intro', () => {
    expect(pickLine({ trigger: 'levelStart', levelId: 'nowhere-99' }, freshMemory).line).toBeNull();
  });
});
