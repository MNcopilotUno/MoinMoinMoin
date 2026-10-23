# Feature: narration (lines as data, pure selection)

## Problem
A narrator gives the harbour a voice (CLAUDE.md §1) but must never block play (§8) and never
repeat itself twice in a row (§7).

## Design
- `lines.ts`: 26 placeholder lines — one intro per level, plus long chain, stolen, captain
  waiting, lost at sea, par finish, over-par finish, undo, restart. One sentence each.
- `triggerForTap(events)`: reads core's events (the same list the UI animates) and names the most
  remarkable thing: long chain (≥ 3 smiles) > stolen > captain half-greeted > lost at sea.
- `pickLine(cue, memory)`: deterministic rotation through candidates by a spoken-counter, skipping
  the last line; quiet rather than repeat; "lost at sea" only after 3 quiet taps so the narrator
  does not comment on every tap.
- The app shows the line beside the board, auto-dismisses it and lets a tap dismiss it. Input is
  never gated (that is tested end-to-end in the app).

## Risks
- Lines are placeholders; the Phase 1 gate asks whether anyone laughs at one.

## Test matrix
| Case | Expected |
|:--|:--|
| data | ≥ 16 non-intro lines, 10 intros, one sentence each, unique ids |
| each trigger from real core events | right trigger; smiled-back and ignored taps say nothing |
| 30 alternating cues | never the same line twice in a row |
| single-line trigger twice | second time quiet |
| same memory + cue | same line |
| edge right after speaking | quiet; speaks after 3 quiet taps |
