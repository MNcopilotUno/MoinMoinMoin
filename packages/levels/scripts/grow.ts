// Grow the story's levels along a curve (.agents/features/levels-progression.md, lighthouse.md).
// `pnpm --filter @moin/levels grow [id …]` writes the 34 non-lesson levels from the schedule.
// Deterministic: seeds are searched from a fixed base, so a re-run on the same code writes the
// same files. Par always comes from the solver; `pnpm validate:levels` re-checks every file.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { Cell } from '@moin/core';
import { cast, generate, mix } from '../src/generate.js';
import type { Recipe } from '../src/generate.js';

/** What a level's intro and title promise about its board; checked before a board is kept. */
interface Promised {
  readonly people?: number;
  readonly captains?: number;
  readonly chatterboxes?: number;
  readonly gulls?: number;
  readonly fenders?: number;
}

interface Step {
  readonly id: string;
  readonly recipe: Recipe;
  readonly promise?: Promised;
  /** A new level's title; a regenerated level keeps the title in its file. */
  readonly title?: string;
}

const r =(width: number, height: number, people: [number, number], par: [number, number], more: Partial<Recipe> = {}): Recipe => ({
  width, height, people, par,
  captains: [0, 0], chatterboxes: [0, 0], gulls: [0, 0], fenders: [0, 0],
  maxMinimumSolutions: 2, minChoices: 1, maxForced: 3,
  ...more,
});

/** The lighthouse's base: 7 × 7, 15–16 people, gulls and fenders, more taps that need thought. */
const lh = (par: [number, number], more: Partial<Recipe> = {}): Recipe =>
  r(7, 7, [15, 16], par, { chatterboxes: [0, 1], gulls: [1, 2], fenders: [1, 3], minChoices: 3, maxForced: 5, ...more });

export const SCHEDULE: readonly Step[] = [
  // The harbour, after its five lessons: fenders, then captain and gull, then all of it.
  { id: 'harbour-06', recipe: r(5, 5, [6, 8], [3, 3], { minChoices: 1 }) },
  { id: 'harbour-07', recipe: r(6, 5, [6, 8], [3, 3], { fenders: [1, 2] }), promise: { fenders: 1 } },
  { id: 'harbour-08', recipe: r(6, 5, [7, 8], [3, 3], { fenders: [2, 3] }), promise: { fenders: 2 } },
  { id: 'harbour-09', recipe: r(6, 6, [7, 9], [3, 3], { captains: [1, 2], gulls: [1, 1], fenders: [0, 1] }), promise: { captains: 1, gulls: 1 } },
  { id: 'harbour-10', recipe: r(6, 6, [9, 11], [4, 4], { captains: [1, 2], gulls: [1, 1], fenders: [1, 2], minChoices: 2 }), promise: { captains: 1, gulls: 1, fenders: 1 } },
  // The market, after the chatterbox's debut: chatterboxes everywhere, two captains, a gull.
  { id: 'market-02', recipe: r(6, 6, [8, 10], [4, 4], { captains: [1, 1], chatterboxes: [1, 1], minChoices: 2 }), promise: { chatterboxes: 1 } },
  { id: 'market-03', recipe: r(6, 6, [9, 10], [4, 4], { captains: [1, 2], chatterboxes: [1, 1], fenders: [0, 1], minChoices: 2 }), promise: { chatterboxes: 1 } },
  { id: 'market-04', recipe: r(7, 6, [9, 11], [4, 4], { captains: [2, 2], chatterboxes: [1, 1], fenders: [0, 1], minChoices: 2 }), promise: { captains: 2, chatterboxes: 1 } },
  { id: 'market-05', recipe: r(7, 6, [10, 11], [4, 5], { captains: [1, 2], chatterboxes: [1, 2], fenders: [1, 2], minChoices: 2 }), promise: { chatterboxes: 1 } },
  { id: 'market-06', recipe: r(7, 6, [10, 11], [5, 5], { captains: [1, 2], chatterboxes: [1, 1], fenders: [0, 2], minChoices: 2 }), promise: { captains: 1, chatterboxes: 1 } },
  { id: 'market-07', recipe: r(7, 6, [10, 12], [5, 5], { captains: [1, 2], chatterboxes: [1, 1], fenders: [2, 3], minChoices: 2 }), promise: { fenders: 2, chatterboxes: 1 } },
  { id: 'market-08', recipe: r(7, 6, [10, 12], [5, 5], { captains: [1, 2], chatterboxes: [1, 1], gulls: [1, 2], fenders: [0, 2], minChoices: 2 }), promise: { gulls: 1, chatterboxes: 1 } },
  { id: 'market-09', recipe: r(7, 7, [11, 12], [5, 5], { captains: [2, 2], chatterboxes: [1, 1], fenders: [0, 2], minChoices: 2 }), promise: { captains: 2, chatterboxes: 1 } },
  { id: 'market-10', recipe: r(7, 7, [12, 13], [6, 6], { captains: [2, 3], chatterboxes: [1, 2], gulls: [1, 1], fenders: [1, 2], minChoices: 2, maxForced: 4 }), promise: { chatterboxes: 1, gulls: 1 } },
  // The ferry: the whole board, more people, more captains, gulls and fenders, par 6 to 8.
  { id: 'ferry-01', recipe: r(7, 7, [12, 13], [6, 6], { captains: [2, 2], chatterboxes: [0, 1], gulls: [1, 1], fenders: [1, 2], minChoices: 2, maxForced: 4 }), promise: { gulls: 1 } },
  { id: 'ferry-02', recipe: r(7, 7, [12, 13], [6, 6], { captains: [2, 3], chatterboxes: [0, 1], gulls: [0, 1], fenders: [1, 2], minChoices: 2, maxForced: 4 }) },
  { id: 'ferry-03', recipe: r(7, 7, [12, 14], [6, 6], { captains: [2, 3], chatterboxes: [0, 1], gulls: [1, 1], fenders: [1, 2], minChoices: 2, maxForced: 4 }) },
  { id: 'ferry-04', recipe: r(7, 7, [12, 14], [6, 6], { captains: [2, 3], chatterboxes: [0, 1], gulls: [0, 1], fenders: [2, 3], minChoices: 2, maxForced: 4 }), promise: { fenders: 2 } },
  { id: 'ferry-05', recipe: r(7, 7, [13, 14], [6, 7], { captains: [2, 3], chatterboxes: [0, 1], gulls: [0, 1], fenders: [2, 3], minChoices: 2, maxForced: 4 }), promise: { fenders: 2 } },
  { id: 'ferry-06', recipe: r(7, 7, [13, 14], [7, 7], { captains: [2, 3], chatterboxes: [0, 1], gulls: [1, 2], fenders: [1, 2], minChoices: 2, maxForced: 5 }), promise: { gulls: 1 } },
  { id: 'ferry-07', recipe: r(7, 7, [13, 15], [7, 7], { captains: [2, 3], chatterboxes: [0, 1], gulls: [1, 2], fenders: [1, 3], minChoices: 2, maxForced: 5 }) },
  { id: 'ferry-08', recipe: r(7, 7, [13, 13], [7, 7], { captains: [3, 3], chatterboxes: [0, 1], gulls: [0, 1], fenders: [1, 3], minChoices: 2, maxForced: 5 }), promise: { people: 13, captains: 3 } },
  { id: 'ferry-09', recipe: r(7, 7, [14, 15], [7, 8], { captains: [3, 3], chatterboxes: [0, 1], gulls: [1, 2], fenders: [1, 3], minChoices: 3, maxForced: 5 }), promise: { captains: 3 } },
  { id: 'ferry-10', recipe: r(7, 7, [15, 16], [8, 8], { captains: [3, 4], chatterboxes: [0, 1], gulls: [1, 2], fenders: [2, 3], minChoices: 3, maxForced: 5 }), promise: { captains: 3, gulls: 1, fenders: 2 } },
  // The lighthouse (lighthouse.md): the whole board and the people cap from the start, a gull
  // and a fender on every board. Par 8 → 9 — par 10 fails the random-tapping bar at 16 people
  // (measured) — while captains go 3 → 5, the taps that need thought 3 → 5, and the finale has
  // one answer only.
  { id: 'lighthouse-01', title: 'The mole', recipe: lh([8, 8], { captains: [3, 3] }), promise: { gulls: 1, fenders: 1 } },
  { id: 'lighthouse-02', title: "Keeper's cottage", recipe: lh([8, 8], { captains: [3, 4] }), promise: { gulls: 1, fenders: 1 } },
  { id: 'lighthouse-03', title: 'Breakwater', recipe: lh([8, 8], { captains: [3, 4], fenders: [2, 3] }), promise: { gulls: 1, fenders: 2 } },
  { id: 'lighthouse-04', title: 'Spiral stairs', recipe: lh([8, 8], { captains: [3, 4], minChoices: 4 }), promise: { gulls: 1, fenders: 1 } },
  { id: 'lighthouse-05', title: 'Gulls on the gallery', recipe: lh([8, 8], { captains: [3, 4], gulls: [2, 3], minChoices: 4 }), promise: { gulls: 2, fenders: 1 } },
  { id: 'lighthouse-06', title: 'Four captains', recipe: lh([9, 9], { captains: [4, 4], minChoices: 4 }), promise: { captains: 4, gulls: 1, fenders: 1 } },
  { id: 'lighthouse-07', title: 'Tea with the keeper', recipe: lh([9, 9], { captains: [4, 4], chatterboxes: [1, 1] }), promise: { chatterboxes: 1, gulls: 1, fenders: 1 } },
  { id: 'lighthouse-08', title: 'Fog bell', recipe: lh([9, 9], { captains: [4, 4], minChoices: 5 }), promise: { gulls: 1, fenders: 1 } },
  { id: 'lighthouse-09', title: 'Lamp room', recipe: lh([9, 9], { captains: [4, 5], minChoices: 5 }), promise: { gulls: 1, fenders: 1 } },
  { id: 'lighthouse-10', title: 'Every light on', recipe: lh([9, 9], { people: [16, 16], captains: [4, 5], minChoices: 5, maxMinimumSolutions: 1 }), promise: { gulls: 1, fenders: 1 } },
];

const count = (cells: readonly Cell[]) => ({
  people: cells.filter((c) => c.kind === 'person').length,
  captains: cells.filter((c) => c.kind === 'person' && c.needs === 2).length,
  chatterboxes: cells.filter((c) => c.kind === 'person' && c.chatterbox === true).length,
  gulls: cells.filter((c) => c.kind === 'seagull').length,
  fenders: cells.filter((c) => c.kind === 'fender').length,
});

/** People and captains are exact when promised (an intro counts them); the rest are minimums. */
function keeps(cells: readonly Cell[], recipe: Recipe, promise: Promised = {}): boolean {
  const n = count(cells);
  if (n.people < recipe.people[0] || n.people > recipe.people[1]) return false;
  if (n.captains < recipe.captains[0] || n.captains > recipe.captains[1]) return false;
  if (promise.people !== undefined && n.people !== promise.people) return false;
  if (promise.captains !== undefined && n.captains < promise.captains) return false;
  if ((promise.chatterboxes ?? 0) > n.chatterboxes || (promise.gulls ?? 0) > n.gulls || (promise.fenders ?? 0) > n.fenders) return false;
  return true;
}

const ORDER = ['person', 'seagull', 'fender'] as const;
function write(id: string, step: Step, cells: Cell[], par: number) {
  const file = new URL(`../levels/${id}.json`, import.meta.url);
  if (step.title === undefined && !existsSync(file)) throw new Error(`${id}: a new level needs a title in the schedule`);
  const title = step.title ?? (JSON.parse(readFileSync(file, 'utf8')) as { title: string }).title;
  const sorted = [...cells].sort((a, b) => a.y - b.y || a.x - b.x || ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
  const body = [
    '{',
    `  "formatVersion": "1.1.0",`,
    `  "id": "${id}",`,
    `  "title": ${JSON.stringify(title)},`,
    `  "width": ${step.recipe.width},`,
    `  "height": ${step.recipe.height},`,
    '  "cells": [',
    sorted.map((c) => `    ${JSON.stringify(c).replace(/,"/g, ', "').replace(/":/g, '": ')}`).join(',\n'),
    '  ],',
    `  "par": ${par}`,
    '}',
    '',
  ].join('\n');
  writeFileSync(file, body);
}

const only = process.argv.slice(2);
for (const step of SCHEDULE) {
  if (only.length && !only.includes(step.id)) continue;
  let found: { cells: Cell[]; par: number; seed: number } | null = null;
  // The first board found wins, so a bigger budget leaves every earlier find unchanged; the
  // lighthouse's par-9 boards are rare (about 1 in 900 candidates) and need it.
  for (let k = 0; k < 3000 && !found; k++) {
    const seed = mix(0x6d6f696e, k * 977 + step.id.length * 31 + step.id.charCodeAt(0) * 7 + Number(step.id.slice(-2)));
    const g = generate(seed, step.recipe, 60);
    if (g && keeps(g.cells, step.recipe, step.promise)) found = { cells: cast(g.cells), par: g.solution.par, seed };
  }
  if (!found) throw new Error(`${step.id}: no board on the schedule`);
  write(step.id, step, found.cells, found.par);
  const n = count(found.cells);
  console.log(`${step.id}  ${step.recipe.width}×${step.recipe.height}  par ${found.par}  people ${n.people}  captains ${n.captains}  chatterboxes ${n.chatterboxes}  gulls ${n.gulls}  fenders ${n.fenders}`);
}
