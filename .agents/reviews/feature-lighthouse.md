# Review — feature/lighthouse (adversarial)

Scope: a fourth part of town, *The lighthouse*: ten generated levels after the ferry, their
intros and the new last story beat, a lighthouse painting (day, night, wide), wiring in the
scene, the level menu and the e2e expectations. Analysis: `.agents/features/lighthouse.md`.

| | Before | After |
|:--|:--|:--|
| Levels | 30 in three sets, finale ferry-10 par 8 | 40 in four sets, finale lighthouse-10 par 9, one answer |
| Story | ferry beat: "the whole town is smiling" | ferry beat hands over to the lighthouse; lighthouse beat ends it |
| Stars | 90 | 120 |

## Findings
1. **The owner's "8 → 10" is not reachable, and the curve is flatter than hoped.** Par goes
   8, 8, 8, 8, 8, 9, 9, 9, 9, 9. Par 10 at 16 people failed the random-tapping rule on every one
   of ~12 000 candidates (lighthouse.md, "The ceiling"). *Not fixed — documented.* The growth is
   in captains (3 → 5), taps that need thought (3 → 5) and the finale's unique answer; a player
   may feel ten levels of "the same size, slightly harder". Flag for the playtest; the real
   lever is a new mechanic (GAME_RULES §9), not a looser bar.
2. **Every lighthouse level sits exactly on the random-tapping threshold** (8 of 16 first taps
   reach par; lighthouse-04 is 7/16). The rule is `> half`, so they pass, but the metric is
   saturated on these boards and says nothing about them (the lesson from levels-progression
   holds). *Not fixed:* minimum solutions (1–2) and choices (3–5) are the real signals.
3. **`levelRevision` was about to call the new levels revision 2.** It returned 2 for every
   known non-lesson id, so the lighthouse would have stored `rev: 2` for boards that never had a
   revision 1 — harmless today, a trap the day they *are* regenerated. *Fixed:* revision 2 is
   now exactly the 24 regenerated boards of the first three sets; a test pins lighthouse-01/10 to
   1. *Left:* the next regeneration of any level needs a real per-level revision map; the
   function's comment says so.
4. **The ferry's story beat lied after this change** ("the whole town is smiling" with a part of
   town still asleep). *Fixed:* it now points at the lighthouse; a narration test forbids "whole
   town" in it and requires the lighthouse beat to name the town. Players who finished the ferry
   before saw the old line — acceptable, the story simply continues.
5. **Intros could promise captains that are not there.** The board-consistency test checked
   gulls, fenders and chatterboxes only. *Fixed:* "captain" now needs a captain, "four captains"
   needs four; checked bad weather by changing an intro to "five captains" on a 3-captain board
   (test failed, line reverted).
6. **The tower stood behind the board on desktop** (wide painting at 1440 × 900: tower at the
   board's right edge), and the level-menu banner showed only its foot. *Fixed* after looking:
   tower at 76 % of the wide painting, banner focus 13 % for this set only (`--focus`).
7. **Reflection offset.** The water reflects what is above the horizon, so the tower's
   reflection starts at the horizon line, about 20 px above the mole's waterline, and appears
   below the mole slightly displaced. Reads as a painted reflection at phone size. *Left.*
8. **A dark nick at the left edge on the horizon** in the new paintings (and in the old ones, e.g.
   ferry-night): an artefact of the shared reflection pass shifting rows sideways. *Left* — it
   is in the shared painter and re-rendering old art is off limits (not byte-stable).
9. **Precache +325 KB** (two portrait paintings; 34 entries, 1768 KiB). Wide paintings stay out
   (`*-wide-*` glob, still asserted by `screens.spec.ts`). Acceptable, but the precache keeps
   growing by ~160 KB per painting; a fifth part of town should question it.
10. **`grow` takes longer to fail.** The seed budget went from 400 to 3000 per step; old steps are
    unaffected (first find wins; a full re-run left `git status` clean), but an impossible step
    now fails after ~2 min instead of ~15 s.
11. **"More harbour soon"** on the last win card (`copy.allDone`) is still true and still says
    harbour; left as the owner's wording.
12. **CLAUDE.md §7 names the scenes** ("Speicherstadt gables, the fish auction hall or the
    dyke") and not the lighthouse. Not edited here — CLAUDE.md is the lead's to change.

## Evidence
`npx eslint .` clean; `pnpm -r typecheck` clean (svelte-check 0/0 in ui and app); `pnpm test`:
core 60, levels 81 (13 new), narration 59 (11 new: ten intros checked against their boards, the
story beat), ui 59; `pnpm validate:levels`: 40 levels ok, 14 fixtures fail as expected, no
warnings; `pnpm build` ok; e2e 40/40 on the built app (`BASE_PATH=/MoinMoinMoin/`), including
the forty-level par journey. Looked at lighthouse-01, -05 and -10 and the level menu at 390 × 844
(day and dark) and 1440 × 900 (day and dark), and at all four paintings.
