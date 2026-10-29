# Review — feature/canvas-parity (adversarial)

Scope: facing chips, captain pips as tile chips, chatterbox ×2 badge, narrator bell, win card
in the canvas layout. Canvas: <https://claude.ai/artifact/N3zJU1QZCrMm4FXdqUbT6X>.

## Findings
1. **Win title wrapped beside the stars** at 390 px ("Everyone is / smiling!") — the canvas used
   a shorter "Everyone's smiling." *Fixed* without changing copy (tests and narration rely on
   it): title `clamp(1.5rem, 6.5vw, 2rem)`, stars 1.6 rem, and the row may wrap. Looked at 390 and
   320 px: one line each.
2. **Pips overlap the captain's cap** on 48 px cells (7 × 7 at 320 px). They are on the tile's
   corner by design and still read; accepted.
3. **East/west chips reach into a neighbouring cell** when two people stand side by side, as the
   triangles did; at 7 × 7 they sit in the 2 px gap and overlap the neighbour's edge, never a face.
4. **The ×2 badge covers a corner of the headscarf.** Accepted: it is the point of the badge.
5. **Pip pop now replays on every greeting change** via `{#key greetings}` — including undo,
   where the remaining pip pops again. Harmless, noted.
6. **Pips left the portrait SVG**, so `portrait()`'s own pips are now used by no caller in the
   game (onlookers pass `pips: false` too). Kept: the portrait test covers the red-means-Moin
   rule for them, and removing them is a separate clean-up.

## Evidence
lint clean; typecheck all packages; tests core 60, levels 62, narration 48, ui 59 (5 new in
`tile-marks.test.ts`); `validate:levels` 30 levels, 14 fixtures; e2e 39/39 on the built app.
Looked at: Moin moin board (badge, pips, chips), harbour-09 with a half-greeted captain, 7 × 7 at
320 px, the win card at 390 and 320 px.
