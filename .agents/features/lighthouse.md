# Feature: the lighthouse — a fourth part of town

## Problem
The owner asked for "more levels". The 30 levels end on ferry-10 (7 × 7, par 8, 16 people), the
story ends with "the whole town is smiling", and the curve test says nothing ever gets easier.
More levels must therefore come **after** the ferry, at least as hard as ferry-10, inside the
level contract (7 × 7, at most 16 people — §6, unchanged), with the story extended rather than
contradicted.

## Design
- **A fourth set, `lighthouse`** ("The lighthouse"), ten levels `lighthouse-01 … 10`, appended
  after the ferry. The lighthouse on the mole is the last part of town to wake up; the ferry's
  story beat now points at it, and the lighthouse's beat closes the story.
- **Generated, not hand-made.** The schedule in `packages/levels/scripts/grow.ts` gets ten more
  steps, each with its **title** (new ids have no file to take one from) and what its intro
  promises. Same generator, same `assess` quality bar as the ferry: ≤ 2 minimum solutions, first
  taps to par ≤ half the people, no idle gull or fender, no unreachable captain, `minChoices`
  par taps on people a Moin could reach, `maxForced` taps on people nobody reaches. Par comes
  from the solver; `pnpm validate:levels` re-checks every file. The seed budget per step goes
  from 400 to 3000 (par-9 boards are rare); the first board found still wins, so every old
  step finds the same board and re-running `grow` rewrites the 24 old files byte for byte
  (checked: `git status` clean after a full run).
- **What grows, given that size cannot.** Every level is 7 × 7 with 15–16 people (the contract's
  ceiling). Difficulty grows along the axes that remain: par 8 → 9, captains 3 → 4–5, the taps
  that need thought (`minChoices`) 3 → 5, and the finale has a **unique** minimum solution.

### The ceiling: par 9, not 10 (measured)
Sampling the generator on 7 × 7 with 13–16 people and 3–7 captains, 60 000 candidates of which
~12 000 had solver par 10: **none** passed the quality bar; ~97 % failed *random tapping*
(more than half the people can be the first tap of a par solution). That is structural: with
≤ 16 people and ≤ 2 minimum solutions, par 10 means ten or so distinct people on the par route,
which is more than half of 16 unless several captains are tapped twice — and an unreachable
captain is itself rejected. The validator raises the same rule as a warning and
`levels.test.ts` forbids warnings after the tutorial. So par 10 would need either a bigger
board or more people (the contract) or a weaker quality bar (a toy); neither is honest.
Par 9 passes at roughly 1 in 900 candidates (27 in 24 000), enough for a schedule.

### The curve (as generated; par from the solver)

"Forced" = taps on people no Moin can reach; "choices" = par − forced (taps that need thought);
"min. sol." = minimum solutions (R10); "first" = first taps that can still finish at par.

| Level | Title | Size | Par | People | Captains | Chatterbox | Gulls | Fenders | Forced | Choices | Min. sol. | First |
|:--|:--|:--|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| *ferry-10* | *Everyone aboard* | 7×7 | 8 | 16 | 3 | 0 | 1 | 2 | 5 | 3 | 2 | 8/16 |
| lighthouse-01 | The mole | 7×7 | 8 | 16 | 3 | 0 | 1 | 1 | 5 | 3 | 1 | 8/16 |
| lighthouse-02 | Keeper's cottage | 7×7 | 8 | 16 | 4 | 1 | 1 | 2 | 5 | 3 | 1 | 8/16 |
| lighthouse-03 | Breakwater | 7×7 | 8 | 16 | 4 | 0 | 1 | 2 | 5 | 3 | 2 | 8/16 |
| lighthouse-04 | Spiral stairs | 7×7 | 8 | 16 | 4 | 1 | 1 | 1 | 4 | 4 | 2 | 7/16 |
| lighthouse-05 | Gulls on the gallery | 7×7 | 8 | 16 | 4 | 0 | 2 | 1 | 4 | 4 | 1 | 8/16 |
| lighthouse-06 | Four captains | 7×7 | 9 | 16 | 4 | 0 | 1 | 1 | 5 | 4 | 2 | 8/16 |
| lighthouse-07 | Tea with the keeper | 7×7 | 9 | 16 | 4 | 1 | 1 | 3 | 4 | 5 | 2 | 8/16 |
| lighthouse-08 | Fog bell | 7×7 | 9 | 16 | 4 | 0 | 1 | 1 | 4 | 5 | 2 | 8/16 |
| lighthouse-09 | Lamp room | 7×7 | 9 | 16 | 5 | 0 | 1 | 2 | 4 | 5 | 2 | 8/16 |
| lighthouse-10 | Every light on | 7×7 | 9 | 16 | 5 | 1 | 1 | 1 | 4 | 5 | **1** | 8/16 |

A finale with six choices and one answer was tried: no board in 180 000 candidates. Five is the
honest top.

### Story and narration
- Ten intros in the same voice (one sentence, ≤ 90 characters, plain English, *Moin* stays
  *Moin*): the keeper, the mole, the spiral stairs, the fog bell, the lamp room. What an intro
  names is promised to the generator (gulls, fenders, a chatterbox, *four captains*).
- `set-ferry` no longer says the whole town is smiling; it hands over to the lighthouse.
  `set-lighthouse` is the finale.
- The narration board-consistency test also checks captains ("captain" → at least one; "four
  captains" → at least four).

### Art
A `lighthouse` scene in `paint.browser.js`: a tall North Sea tower on a stone mole, **white with
ink bands, never red** (red means Moin), lantern and gallery, the keeper's cottage, a
breakwater of rocks and tetrapod-ish blocks, gulls; at night the lantern is lit with a soft beam.
Four images, rendered alone (`render-art.mjs lighthouse lighthouse-night lighthouse-wide
lighthouse-night-wide`); existing JPEGs are not re-rendered (Chromium is not byte-stable).
The tower is tall, so two placements were made for it after looking at screenshots: in the wide
painting it stands at 76 % of the width, beside the board rather than behind it (1024 – 1920 px
windows), and the level menu's banner looks into the lighthouse painting at 13 % instead of the
other banners' 30 %, so it shows the lantern rather than the tower's foot.

### Wiring
`LevelSet['id']` gains `lighthouse`; `Scene.svelte` (paintings, nocturnes, wide) and
`LevelSelect.svelte` (banners) get the new images; e2e expectations move from thirty levels and
90 stars to forty and 120. The fog story in `App.svelte` is per set already. New levels are
**revision 1** (new ids); `levelRevision` must not give them the 2 of the regenerated boards.

## Risks
- **A flat curve.** Par 8 → 9 over ten levels is a gentle slope; the growth is in captains and
  choices, which a player feels but a chart does not show. Mitigated by the uniqueness of the
  finale; flagged for the playtest.
- **Long e2e journey.** Forty levels at par is ~235 taps through the interface; the journey's
  timeout goes from 180 s to 300 s.
- **Precache size.** Two more portrait paintings (~350 KB) join the precache; wide ones stay out
  (`globIgnores`).
- **The ferry beat changes meaning** for players who finished the ferry before this ships: they
  saw "the whole town is smiling" and now find a fourth set. Acceptable: it reads as the story
  continuing.

## Gaps
- Par 10 not reached (above). If the owner wants steeper, the options are a bigger board (a
  contract change, §6) or a new mechanic (GAME_RULES §9 parking lot), not a looser bar.
- No new mechanic: the lighthouse is harder, not different. A lamp beam that turns, say, is a
  rules change with its own analysis.

## Test matrix
| Case | Expected |
|:--|:--|
| sets | harbour, market, ferry, lighthouse — ten each, forty levels |
| curve from harbour-06 (market-01 excepted) | cells and par never go down, lighthouse included |
| lighthouse-01 vs ferry-10 | par ≥ 8, 7 × 7 |
| finale (lighthouse-10) | 7 × 7, par ≥ 9, ≥ 15 people, exactly one minimum solution |
| every set ends harder than it starts | lighthouse too |
| every lighthouse level | gulls or fenders on its board, ≥ 3 captains |
| `levelRevision('lighthouse-01')` | 1 (new id); ferry-10 still 2 |
| `validate:levels` | 40 levels, 14 fixtures fail as expected, no warnings after the tutorial |
| re-run `grow` for the old 24 | same files (git diff empty) |
| narration | forty intros, one per level; `set-lighthouse` exists; each intro true of its board (gulls, fenders, chatterbox, captains) |
| bad weather: intro names a gull on a gull-less board | narration test fails |
| e2e: all forty at par | three stars each, harbour beat after level 10, lighthouse beat at the end |
| e2e: level select | four headings, `3 of 120 stars` |
| art | lighthouse never red; four new JPEGs ≤ ~210 KB; wide ones not precached |
