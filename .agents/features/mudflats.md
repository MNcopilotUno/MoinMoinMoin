# Feature: the mudflats — a fifth part of town

## Problem
The owner asked for "more puzzle content". The 40 levels end on lighthouse-10 (7 × 7, par 9, 16
people, one answer) and the story ends at the lighthouse ("the whole town is smiling"). The
curve tests say nothing ever gets easier and every set ends harder than it starts, and the
lighthouse measured par 10 as out of reach under the quality bar at 16 people. More levels must
therefore come **after** the lighthouse, at least as hard, inside the level contract (7 × 7, at
most 16 people — §6, unchanged), with the story extended rather than contradicted.

## The theme: a Hallig on the mudflats (and why)
Used so far: harbour (Speicherstadt), fish market, ferry (which already paints the dyke, sheep
**and the beach with Strandkörbe**), lighthouse. The beach would have repeated the ferry's shore;
the Wadden Sea at low tide is the one North German coast not yet on a canvas, and it is unlike
the others: no quay, no water to stand beside, but wet mud to the horizon, tidal creeks, and a
*Hallig* — a tiny unprotected island whose houses stand on a *Warft* (a dwelling mound) so that
at storm tide (*Land unter*) only the mounds look out of the sea. It also suits the story: the
lighthouse's beam, last beat, finds one island still grumpy out on the flats.

**Plain English in the interface** (CLAUDE.md §7, `north-german-art.md`): the set is *The
mudflats*; titles and lines say *island*, *mound*, *sail trolley*, *birch twigs*. *Hallig*,
*Warft*, *Pricken* and *Segellore* live in the painting and in this document only; a narration
test keeps them out of the lines.

## Design
- **A fifth set, `mudflats`** ("The mudflats"), ten levels `mudflats-01 … 10`, appended after
  the lighthouse. `set-lighthouse` no longer says the whole town is smiling; it hands over to the
  mudflats, and `set-mudflats` closes the story. `copy.allDone` ends "from the quay to the last
  island".
- **Generated, not hand-made**, with the same generator and the same `assess` bar as the
  lighthouse: ≤ 2 minimum solutions, first taps to par ≤ half the people, no idle gull or
  fender, no unreachable captain, `minChoices` taps on people a Moin could reach, `maxForced`
  taps on people nobody reaches. Par from the solver; `pnpm validate:levels` re-checks.
- **A per-step seed budget** (`budget` in the schedule, default 3000 as before): the par-10 steps
  get 12 000 (720 000 candidates at most). The first board found still wins, so every older step
  finds the same board; re-running `grow` for the 34 older ids leaves `git status` clean.
- **What grows, given that size cannot:** par **9 → 10**, captains **4 → 6**, taps that need
  thought **5 → 6+**; every board has the people cap (16), a gull and a fender.

### Par 10 is reachable after all (measured)
The lighthouse sampled 60 000 candidates (captains 3–7) and found no par-10 board that passes.
That sample was too small, not the ceiling. Sampling the generator on 7 × 7, 15–16 people, the
lighthouse's bar (`minChoices` 3, `maxForced` 5, ≤ 2 minimum solutions):

| Captains | Candidates | Solver par 10 | Pass the bar | Rate |
|:--|--:|--:|--:|--:|
| exactly 4 | 100 000 | 8 964 | 1 | 1 in 100 000 |
| exactly 5 | 100 000 | 18 511 | 1 | 1 in 100 000 |
| exactly 6 | 100 000 | 22 595 | 2 | 1 in 50 000 |
| 4–6 | 500 000 | 83 508 | 13 | ≈ 1 in 38 000 |

~95 % of par-10 candidates still fail *random tapping*, as the lighthouse found; the survivors
all sit exactly on the threshold (8 of 16 first taps) — par 10 spread over 8 distinct people
means two captains tapped twice. So par 10 is rare, not impossible: one board per step needs a
budget of a few hundred thousand candidates, which is a minute or two per step.

### The ceiling now: a unique answer at par 10 (measured)
All 13 passing par-10 boards of that sample had **exactly two** minimum solutions; none had one.
So the finale keeps par 10 with two answers, and "one answer" stays the lighthouse finale's
distinction (its test is kept, pinned to `lighthouse-10`). Par 11 was not attempted: the
random-tapping arithmetic (≥ 3 captains tapped twice among ≤ 8 first taps) makes it rarer still.

### The curve (as generated; par from the solver)
"Forced" = taps on people no Moin can reach; "choices" = par − forced; "min. sol." = minimum
solutions (R10); "first" = first taps that can still finish at par.

| Level | Title | Size | Par | People | Captains | Chatterbox | Gulls | Fenders | Forced | Choices | Min. sol. | First |
|:--|:--|:--|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| *lighthouse-10* | *Every light on* | 7×7 | 9 | 16 | 5 | 1 | 1 | 1 | 4 | 5 | 1 | 8/16 |
| mudflats-01 | Low tide | 7×7 | 9 | 16 | 4 | 0 | 1 | 1 | 4 | 5 | 2 | 8/16 |
| mudflats-02 | The mound | 7×7 | 9 | 16 | 4 | 0 | 1 | 2 | 4 | 5 | 2 | 8/16 |
| mudflats-03 | Sail trolley | 7×7 | 9 | 16 | 4 | 0 | 1 | 2 | 4 | 5 | 2 | 8/16 |
| mudflats-04 | Gulls on the flats | 7×7 | 9 | 16 | 5 | 1 | 2 | 1 | 4 | 5 | 2 | 8/16 |
| mudflats-05 | Five captains | 7×7 | 9 | 16 | 5 | 0 | 1 | 2 | 4 | 5 | 2 | 8/16 |
| mudflats-06 | Tide creek | 7×7 | 10 | 16 | 6 | 1 | 1 | 2 | 3 | 7 | 2 | 8/16 |
| mudflats-07 | The mud postman | 7×7 | 10 | 16 | 6 | 1 | 1 | 2 | 4 | 6 | 2 | 8/16 |
| mudflats-08 | Birch twigs | 7×7 | 10 | 16 | 5 | 1 | 1 | 1 | 4 | 6 | 2 | 8/16 |
| mudflats-09 | Storm tide | 7×7 | 10 | 16 | 6 | 1 | 1 | 1 | 4 | 6 | 2 | 8/16 |
| mudflats-10 | High water | 7×7 | 10 | 16 | 6 | 1 | 2 | 1 | 4 | 6 | 2 | 8/16 |

The set opens a notch gentler than the lighthouse closed (four captains and two answers after
five captains and one) — a breather at a new place, as harbour-06 and market-02 are; par and
board never go down, which is what the curve test holds.

### Story and narration
- Ten intros in the same voice (one sentence, ≤ 90 characters): low tide, the mound, the sail
  trolley, gulls on the flats, five captains, the creek, the mud postman (a *Moin moin* at every
  door), birch twigs, storm tide, high water. What an intro or title names is promised to the
  generator (two gulls, two fenders, a chatterbox, five and six captains).
- The board-consistency test now also counts gulls ("two gulls" → at least two), as the
  lighthouse added captains.

### Art
A `mudflats` scene in `paint.browser.js` (same underpainting + brush pass): the warft on the
right with two whitewashed houses under deep reed roofs, wind-bent ash trees and sheep; a flat
salt marsh with a broken turf edge; two more Halligen and the mainland dyke in the haze; in front
the wet flats in lilac and peach (mirroring the sky, the sun lying on the mud), ripple marks,
sea lettuce, puddles that hold the sky, a winding tidal creek (*Priel*) with its reflection,
birch twigs (*Pricken*) along it, and the Hallig's little railway out across the mud on its
causeway with a sail trolley (*Segellore*). At night the windows are lit and the creek holds the
moonlight (without that it read as a dark path). No red anywhere: the houses are whitewashed,
not brick. Four images, rendered alone (`render-art.mjs mudflats mudflats-night mudflats-wide
mudflats-night-wide`); no existing JPEG was re-rendered.

### Wiring
`LevelSet['id']` gains `mudflats`; `Scene.svelte` (paintings, nocturnes, wide) and
`LevelSelect.svelte` (banners, focus 26 % so the banner shows the mound's houses) get the new
images; e2e expectations move from forty levels and 120 stars to fifty and 150. The fog story
in `App.svelte` is per set already. New levels are revision 1 (new ids). The bridge to Moin Domi
passes `?from=mudflats-NN`; Domi does not know the mudflats (`packages/meme` lists four places)
and falls back to the harbour, as designed for unknown ids (`bridge.md`).

## Risks
- **A flat-feeling curve.** Par 9 → 10 over ten levels; growth is in captains and choices.
  Every board has the full crowd now, so the last two sets look alike in size. Flag for the
  playtest; the real lever is a new mechanic (GAME_RULES §9), not a looser bar.
- **Random tapping saturated.** Every board sits on 8/16 first taps (the threshold); the metric
  says nothing about them. Minimum solutions and choices are the real signals.
- **Long e2e journey.** Fifty levels at par is ~330 taps through the interface; the journey's
  timeout goes from 300 s to 420 s.
- **Precache size.** Two more portrait paintings (~320 KB) join the precache; wide ones stay out.
- **The lighthouse beat changes meaning** for players who finished it: they saw "the whole town
  is smiling" and now find a fifth set. Reads as the story continuing, as with the ferry.
- **`grow` for a par-10 step that cannot be met** now fails after up to ~15 min instead of ~2.

## Gaps
- No unique answer at par 10 (above). No par 11.
- Domi's meme has no mudflats place (out of scope here: Domi files are the lead's).
- CLAUDE.md §7 lists the painted scenes and does not name the mudflats (the lead's file).

## Test matrix
| Case | Expected |
|:--|:--|
| sets | harbour, market, ferry, lighthouse, mudflats — ten each, fifty levels |
| curve from harbour-06 (market-01 excepted) | cells and par never go down, mudflats included |
| mudflats-01 vs lighthouse-10 | par ≥ 9, 7 × 7, ≥ 4 captains |
| every mudflats level | 7 × 7, ≥ 15 people, ≥ 4 captains, a gull and a fender, ≥ 5 choices |
| par 10 | only on the mudflats; at least five of them; the finale is par 10 |
| finale (mudflats-10) | 7 × 7, par ≥ 10, 16 people |
| lighthouse-10 | still exactly one minimum solution |
| `levelRevision('mudflats-01' / '-10')` | 1; ferry-10 still 2 |
| `validate:levels` | 50 levels, 14 fixtures fail as expected, no warnings after the tutorial |
| re-run `grow` for the old 34 | same files (git diff empty) |
| narration | fifty intros; `set-mudflats` exists and says "whole town", no earlier beat does; `set-lighthouse` names the mudflats; each intro true of its board (gulls incl. "two gulls", fenders, chatterbox, captains) |
| bad weather: intro says "two gulls" on a one-gull board | narration test fails |
| bad weather: a mudflats line says "Hallig" | narration test fails |
| e2e: all fifty at par | three stars each, lighthouse beat names the mudflats, last beat "whole town" |
| e2e: level select | five headings, `3 of 150 stars`; mudflats-01 shows the mudflats painting |
| art | no red; four new JPEGs ≤ 185 KB; wide ones not precached |
