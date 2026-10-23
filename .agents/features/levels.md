# Feature: levels package (schema, validator, fixtures, ten levels)

## Problem
The level file is the contract between authoring and the game (CLAUDE.md §6). Authors miscount
par; a broken level must never reach the app.

## Design
- `level.schema.json` (draft-07, `formatVersion` 1.0.0) with a `kind` discriminator; types in
  `src/level.generated.ts` are generated from it (`gen:types`) and a test fails if they drift.
- `validateLevel` = ajv (errors translated into messages that name the problem) → major version
  → `createGame` (board rules) → `solve` (par must equal the solver, R10/random-tap warnings
  after the tutorial set).
- `pnpm validate:levels` checks every file in `levels/` *and* that every file in `fixtures/` fails
  with the message in `fixtures/expected.json`. A passing fixture fails the run.
- Ten harbour levels, one idea at a time: first Moin → follow the faces → two ripples → the gull
  → the captain → upstream → fender → round the bend → two for the captain → everything.

## Risks / gaps
- Level quality is unproven until the Phase 1 playtest (see `.agents/lessons/puzzles.md`).
- No level select, by design (Phase 2).

## Test matrix
| Case | Expected |
|:--|:--|
| each real level | passes, par = solver, solution solves in par taps |
| levels 4–10 | no R10 or random-tapping warning |
| each of 12 fixtures | fails with its named message |
| fixture that passes | reported as failure |
| ring level | warns R10 and random tapping; not in tutorial mode |
| schema changed, types not regenerated | test fails |
