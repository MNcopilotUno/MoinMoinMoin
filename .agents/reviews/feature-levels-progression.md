# Review — feature/levels-progression (adversarial)

Scope: 24 levels regenerated bigger along a tested curve (`scripts/grow.ts`), the six lessons
kept; `levelRevision` and revision-aware progress; a generator fix.

| | Before | After |
|:--|:--|:--|
| harbour-06 … 10 | 4×5 – 6×6, par 1–3 | 5×5 → 6×6, par 3 → 4 |
| market-02 … 10 | 4×4 – 6×6, par 2–4 | 6×6 → 7×7, par 4 → 6 |
| ferry-01 … 10 | 4×6 – 7×7, par 3–6, no gulls | 7×7, par 6 → 8, 13 → 16 people, gulls |

## Findings
1. **Generator crashed at the people cap** (17 people → `createGame` throws out of `generate`).
   *Fixed* by skipping the candidate; the golden-daily test proves dailies are unchanged.
2. **Old bests would show stars on boards never played** (ids unchanged, boards new). *Fixed*:
   per-level revision stored with the best; an e2e test seeds an old-format best for market-02
   and sees it dropped while harbour-01's is kept.
3. **"First taps to par" sits at 50 % on big boards** (e.g. 8/16 on ferry-10). That metric
   counts any person on *a* par route as a good first tap; with many forced, order-free taps it
   approaches par/people by construction. It is not "solvable by tapping at random": the other
   seven taps must be right too. The generator's `firstTapsToPar × 2 > people` rule still holds.
   Noted in `lessons/puzzles.md` as a weak metric for big boards.
4. **Titles carried over** from the hand-made boards; each promised mechanic is enforced by the
   schedule (fenders on "Fender", two captains on "Captain's corner"/"Two captains, one voice",
   13 people and 3 captains on "Rush hour"). "Late for the ferry" and "Car deck" are moods, not
   mechanics, so nothing to enforce.
5. **The daily (6 × 6, par 3–5) is now easier than the ferry.** Left as is: the daily is a quick
   one-a-day, and changing its recipe would change every future daily.
6. **Longer journeys**: the 30-level e2e taps every par route (~150 taps) — 2.3 min for the full
   suite, up from 2.0. Acceptable.
7. **Lessons stay small** (harbour-01…05, market-01): a dip in size is how a new idea is taught.
   The curve test starts at harbour-06 and skips market-01 by name.

## Evidence
lint clean; typecheck all packages; tests core 60, levels 68 (6 new), narration 48 (every intro
still true of its board), ui 59; `validate:levels` 30 levels, 14 fixtures; e2e 40/40 on the
built app. Looked at harbour-10, market-09 and ferry-10 at 390 × 844.
