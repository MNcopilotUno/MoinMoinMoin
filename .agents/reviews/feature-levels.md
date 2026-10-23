# Review — feature/levels

| # | Finding | Severity | Outcome |
|:--|:--|:--|:--|
| 1 | harbour-08 draft had a seagull nobody could reach; harbour-09 draft had 4/6 first taps reaching par (random-tap trap) and a captain looping with a fisherman. | major | Both redrawn; validator shows harbour-09 par 2 unique, 2/5 first taps. Lessons in `puzzles.md`. |
| 2 | harbour-10 draft had par 6, including a captain nobody could reach (tap him twice — no thought). | major | Redrawn: par 3, captain fed by a ripple and a cycle, gull as a decoy. |
| 3 | `levels` casts JSON imports `as Level[]`: the type system does not check the files. | note | Accepted: the runtime check is `validate:levels` + the test that every listed level validates. |
| 4 | Fixtures only checked by substring; a message could name a different problem and still contain the substring. | minor | Substrings are specific ("wrong par: the file says 2, the solver says 1"). |
| 5 | Tutorial exemption keyed on position in the play order; reordering silently changes which levels are checked strictly. | minor | Documented in `src/index.ts` next to `TUTORIAL_LEVELS`. |
| 6 | "Unsolvable" fixture is a 0-people level — the only kind of unsolvable level v1 allows. | note | Recorded in `design.md`; GAME_RULES §8 says so. |

Test count at merge: **levels 31 passed**; `pnpm validate:levels`: 10 levels ok, 12 fixtures fail as expected.
