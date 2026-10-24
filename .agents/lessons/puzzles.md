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
