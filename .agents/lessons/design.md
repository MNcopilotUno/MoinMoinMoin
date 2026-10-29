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
- **Paint a picture, then brush it — not dabs on a gradient.** Random seeded dabs over a sky
  gradient read as "texture", never as a place. Drawing a composed underpainting first (real
  buildings, perspective, a mirrored and rippled reflection) and then laying strokes that take its
  colour, follow its edges and stop at colour changes gave paintings people recognise as Hamburg.
  The owner's word was "realistic": realism came from the composition, the brush only styles it.
- **Regional detail lives in the art, not the copy.** Sou'wester, Elbsegler, Kopftuch, stepped
  gables, Strandkörbe make it northern; the interface stays in plain English (CLAUDE.md §7).
- **A tall subject needs placing per screen.** The lighthouse is the first painting whose hero is
  vertical: in the wide painting it first stood right behind the board, and the level-menu
  banner (which looks in at 30 % height) showed only the tower's foot. Screenshots at 390 × 844
  and 1440 × 900 found both; the tower moved to 76 % of the width and the banner got a per-set
  focus (13 %).
