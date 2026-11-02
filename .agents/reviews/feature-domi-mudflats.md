# Review — feature/domi-mudflats (adversarial)

Scope: the mudflats as a Domi place, so the bridge from a solved mudflats level shows the flats
(open point from `.agents/reviews/feature-mudflats.md`); docs after merging the mudflats and the
Domi copy move.

## Findings
1. **The bridge fell back to the harbour** for `?from=mudflats-NN` — Domi did not know the place.
   *Fixed*: `mudflats` is a meme place (night painting), caption *When even the last island*.
2. **Picker label "Flats"**: "Mudflats" does not fit the 5-wide place row at 320 px; the spoken
   description says "at the flats". *Accepted.*
3. **Strict validation again**: an older app refuses a mudflats meme (as for the water) — no relay
   is live, so no chain spans the versions.
4. **Merged agent work, checked by me**: the copy move (visible text identical: Domi e2e 26/26 on
   the merged main) and the mudflats (painting looked at; unit, validate and e2e suites re-run on
   the merged tree).

## Evidence
Unit: core 60, levels 95, narration 70, ui 92, tessera 55, meme 37, cursus 37; validate 50 levels,
14 fixtures; lint and typecheck clean; puzzle and Domi e2e — see the merge commit's run.
