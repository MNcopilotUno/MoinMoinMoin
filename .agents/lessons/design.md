# Lessons — design

- **R9 is about the board, not the tap count.** The first R9 property test asserted that a tap
  sequence and its shuffle end with the same `taps`. fast-check found the counterexample in one
  run: tap B, then tap A whose ripple reaches B → 2 taps; tap A first → B is already smiling and
  the second tap is ignored (R2) → 1 tap. The final greetings are identical, the counts are not.
  GAME_RULES §7 now says so. Consequence for players: ripples first is never worse.
- **Under v1 every level with a person is solvable** (tap everyone `needs` times). "Unsolvable
  level" from CLAUDE.md §6 can only mean "no people"; the fixture tests exactly that.
- **The Phase 1 gate was waived by the owner, not passed** (2026-10-24). Everything in Phase 2 is
  built on unplaytested assumptions; the first playtest should cover the market set (the
  chatterbox) as well as level 1.
- **Impressionism comes from strokes, not blur.** Radial-gradient "dabs" read as fog. Thousands of
  short tapered strokes with jittered colour, short horizontal ones on water, a hot sun and its
  broken reflection read as Monet. Small solid accents (dark boats, masts) must sit outside the
  displacement filter or they look dashed.
- **Over a painting, keep the type on paper or in ink.** Titles in harbour ink with a soft glow,
  the narrator and win card on translucent paper; never a light text colour over the sky.
- **Keep the sun out of the title.** A painting's focal point must avoid the UI's fixed regions
  (the market's sun sat behind the title until it was repainted on the right).
