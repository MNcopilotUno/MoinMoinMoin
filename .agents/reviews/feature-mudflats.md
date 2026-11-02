# Review — feature/mudflats (adversarial)

Scope: a fifth part of town, *The mudflats* (a Hallig in the Wadden Sea): ten generated levels
after the lighthouse, their intros and the new last story beat, the mudflats painting (day,
night, wide), wiring in the scene, the level menu, the copy and the e2e expectations.
Analysis: `.agents/features/mudflats.md`.

| | Before | After |
|:--|:--|:--|
| Levels | 40 in four sets, finale lighthouse-10 par 9, one answer | 50 in five sets, finale mudflats-10 par 10, two answers |
| Story | lighthouse beat: "the whole town is smiling" | lighthouse beat hands over to the mudflats; mudflats beat ends it |
| Stars | 120 | 150 |
| Highest par | 9 ("10 is out of reach", lighthouse.md) | 10, five levels |

## Findings
1. **The lighthouse's documented ceiling was a sample-size artefact.** "0 of ~12 000 par-10
   candidates pass" was read as "par 10 is impossible at 16 people"; 500 000 candidates show
   about 1 in 38 000 pass (13 boards), more with more captains. *Fixed:* lighthouse.md and the
   lesson in `puzzles.md` now carry a correction; a new lesson says to quote zero hits as a rate
   bound. The grow budget per par-10 step is 12 000 seeds (720 000 candidates); each step found
   its board in one to three minutes.
2. **No unique answer at par 10.** All 13 passing par-10 boards had exactly two minimum
   solutions. So the new finale has two answers where the old one had one — on that axis the
   last level is *less* demanding than lighthouse-10. *Not fixed — documented;* the test "the
   finale has one answer" now pins lighthouse-10 by id and the story's finale is held to par ≥ 10
   and 16 people instead. A playtest should say whether two answers feel easier.
3. **The set opens a step back.** mudflats-01–03 have four captains and two answers after
   lighthouse-10's five and one. The tested curve (cells and par never go down) holds; captains
   and answers are not part of it. *Left* as a breather at a new place (as at harbour-06), and
   said so in the analysis. Captains then grow 4 → 6 and choices 5 → 6–7.
4. **"Five captains" is not special.** mudflats-04 also has five (its recipe allows 4–5). The
   title is true (≥ 5, enforced), not unique. *Left;* tightening 04 to four would regenerate it.
5. **Random tapping is saturated:** every one of the ten boards sits on 8 of 16 first taps, the
   threshold. Structural at par 10 with 16 people (ten taps over eight people means two captains
   tapped twice). *Not fixed:* minimum solutions and choices are the signals that discriminate.
6. **German words were about to reach the interface** ("The warft", "one Hallig", "the last
   warft" in the first draft). CLAUDE.md §7 and `north-german-art.md` keep regional words in the
   art. *Fixed:* island, mound, high water; a narration test fails on *Hallig/Warft/Watt* in any
   mudflats line (checked bad weather: test fails, line restored).
7. **"Two gulls" was not enforced by any test.** The board check counted gulls only as "any".
   *Fixed:* "two/three gulls" now needs that many (bad weather checked by putting "Two gulls" on
   the one-gull mudflats-02: test failed, restored). The schedule also promises two gulls.
8. **The story could still claim the whole town twice.** *Fixed:* a test now forbids "whole
   town" in every beat but the last, requires the lighthouse beat to name the mudflats, and the
   last win card's `copy.allDone` ends "from the quay to the last island".
9. **The night creek read as a dark road** (first night render). *Fixed* after looking: a
   moonlight wash and glints inside the creek. Lesson in `design.md`.
10. **The bridge to Moin Domi** sends `?from=mudflats-NN`; `packages/meme` knows four places
    and Domi falls back to the harbour for unknown ids (`bridge.md`). A player who solves a
    mudflats level gets a harbour meme. *Left:* Domi files are out of scope for this branch; the
    lead may add `mudflats` to `WHERE` and Domi's paintings.
11. **Precache keeps growing** (+2 portrait paintings, ~320 KB; the build precaches 42 entries,
    2159 KiB). The lighthouse review asked the fifth part of town to question this. Questioned,
    not fixed: each set's day and night painting is precached so a phone works offline at any
    level. Caching nocturnes on first use (like the wide ones) would save ~800 KB across five
    sets but show a blank sky offline in dark mode on a first-time set — a trade for the lead.
12. **The quay of onlookers below the board** is a stone quay on every set, including an island
    with no quay. Decoration only, shared with the lighthouse; *left.*
13. **mudflats-07's "postman" is a captain** (the chatterbox the generator chose needs two
    greetings; `cast` draws needs-2 as a captain). The intro promises a *Moin moin*, which is
    there. Cosmetic; *left.*
14. **`grow` fails slower:** an impossible par-10 step now gives up after up to ~15 min. Old
    steps keep the 3000 default; a full re-run of the 34 older ids left `git status` clean.
15. **CLAUDE.md §7** lists the painted scenes without the mudflats; HANDOVER is not updated.
    Both are the lead's files; no number in CLAUDE.md changed.

## Evidence
`npx eslint .` clean; `pnpm typecheck` clean (svelte-check 0/0 in ui and both apps); `pnpm test`:
core 60, levels 95 (14 new), narration 70 (11 new: ten intros checked against their boards, the
plain-English rule), ui 59, tessera 55, meme 33, cursus 37; `pnpm validate:levels`: 50 levels ok,
14 fixtures fail as expected, no warnings; puzzle e2e 45/45 on the built app (Chromium), including
the fifty-level par journey (1.5 min). Looked at all
four paintings, and at the built app at 390 × 844 and 1440 × 900 in day and night (mudflats-10
and the level menu with its five banners). A red-pixel scan of the four new paintings found 0.
