# Review — feature/core

Adversarial self-review before the `--no-ff` merge.

| # | Finding | Severity | Outcome |
|:--|:--|:--|:--|
| 1 | The R9 property asserted equal tap counts across shuffles. That is false under R2 (a tap on someone a ripple already reached is ignored). The rule text was ambiguous too. | blocker | Test now compares the board; GAME_RULES §7 states the tap-count caveat; lesson in `design.md`. |
| 2 | Property tests flaked ~1 in 3 runs: the 6 × 6 generator produced boards with > 16 people. | blocker | Generator filters to 1–16 people; five consecutive green runs. |
| 3 | `solve` explores every count up to `min(needs, left)` without checking that the remaining people can still absorb `left`; leaves are rejected late. Exponential in free people. | minor | Accepted for now: levels have ≤ 12 people, solver runs in ms. Revisit if `validate:levels` gets slow. |
| 4 | `fly` caps at `4·w·h·CELL + CELL` ticks and throws `FlightCapError`. The cap is argued, not proved by the engine. | note | Property test over 400 random boards with fenders never hits it; the argument is in the design doc. |
| 5 | `solve` returns `null` for 0 people, but `createGame` already rejects 0 people, so `null` is unreachable through the public path. | minor | Kept as a defensive return; the levels validator maps the 0-people `BoardError` to "unsolvable level". |
| 6 | Purity lint could silently stop applying (glob typo). | major | `test/purity.test.ts` lints probes through the real config and fails if a rule does not fire. |

Test count at merge: **core 54 passed** (6 files).
