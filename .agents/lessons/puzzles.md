# Lessons — puzzles

- **With only `needs: 1` people, par is mechanical.** Every person has at most one target, so the
  board is a functional graph: trees hanging into chains or cycles. Par = (people nobody's Moin
  reaches) + (cycles nobody reaches). The whole puzzle is "find who nobody greets" — readable,
  but samey. Captains (`needs: 2`) fed from two directions and seagulls cutting a path are what
  create real choices (harbour-09, harbour-10). Flag for the Phase 1 playtest.
- **A ring is a random-tapping level.** Any first tap in a pure cycle finishes at par. The
  validator warns (R10 / random tapping); keep rings to the tutorial or break them with a gull.
- **An unused seagull or fender is noise.** The first draft of harbour-08 had a gull no Moin
  could ever reach; players read every object as a clue. Removed. Check with the target graph
  (`targets()` in core) that every object is on somebody's flight path.
- **Drafting tool:** levels were drafted as ASCII in `.agents/features/levels-harbour-drafts.txt`
  (tokens `E1`, `N2`, `g`, `/`, `\`; suffix `k` kid, `m` market woman) and par was always taken
  from the solver.
- **Random placement makes dead boards.** The first generator dropped people, gulls and fenders
  on random squares: 489 idle fenders and 257 idle gulls in 400 candidates, and no candidate
  passed. Growing chains along lines of flight fixed it. Then most passing boards were "tap
  whoever nobody faces" (every par tap forced): `assess` now demands at least one par tap on a
  person a Moin *could* reach.
- **A curve is a test, not a feeling.** "Make them bigger and progressive" became two assertions
  (from harbour-06 on: cells and par never go down; the finale is 7 × 7 at par ≥ 7) and a
  schedule the generator fills. Hand-made levels jumped around in size because each was made
  for its idea, not its place in the line.
- **"First taps to par" is weak on big boards.** With many forced taps any of them can come
  first, so the ratio tends to par/people (often exactly 50 %). It flags rings and toys on small
  boards; on big ones read minimum solutions and `minChoices` instead.
- **Keep what the intro promises.** Regenerating a level keeps its title and intro, so the
  schedule enforces what they say (13 people, 3 captains, a gull at the bakery).
- **The quality bar caps par on a fixed board.** At 7 × 7 with ≤ 16 people, par 10 never passed
  the random-tapping rule (first taps to par ≤ half the people): 0 of ~12 000 par-10 candidates,
  ~97 % failing exactly that. Par 9 passes about 1 in 900. With size and crowd at the contract's
  ceiling, "harder" has to come from other axes — more captains, more taps that need thought
  (`minChoices`), a unique answer — or from a new mechanic, not from loosening the bar.
- **Measure before promising a curve.** "Aim for 8 → 10" was a sampling question; a 20-line
  script over the generator answered it in a minute (par distribution and failure reasons per
  recipe) and turned a hope into the documented ceiling in `lighthouse.md`.
- **Promise what you name, for new sets too.** The lighthouse's titles and intros ("Four
  captains", "Gulls on the gallery", a *Moin moin* at tea) are enforced by the schedule, and the
  narration test now also checks captains ("four captains" → at least four).
