# Feature: bigger, progressive puzzles

## Problem
The owner: "make those puzzles bigger and progressive". Measured on the 30 levels:
- **Not progressive.** The market starts on a 4 × 2 board with par 1 right after the harbour's
  6 × 6 par 3 finale; within sets sizes jump around (ferry-05 is 4 × 6 after two 5 × 7 boards),
  and par goes 3, 3, 3, 4, 5, 5, 4, 5, 6, 6 across the ferry.
- **Not big.** Par never exceeds 6; boards rarely use the 7 × 7, 16-person room the level format
  allows (§6); the ferry has no gulls at all.

## Design
- **Keep the lessons, grow everything else.** harbour-01 … 05 (one idea each: chain, facing, two
  crowds, gull, captain) and market-01 (the chatterbox's debut) stay hand-made and small. The
  other **24 levels are regenerated** by the existing generator (`assess` keeps its quality bar:
  par in range, ≤ 2 minimum solutions, most first taps do not reach par, no idle gull or fender,
  no unreachable captain, real choices) from a **schedule** in `packages/levels/scripts/grow.ts`.
- **The curve** (cells = width × height; par from the solver, never by hand):

  | Levels | Size | Par | What grows |
  |:--|:--|:--|:--|
  | harbour-06 … 10 | 5×5 → 6×6 | 3 → 4 | fenders, then captain + gull, then all of it |
  | market-02 … 10 | 6×6 → 7×7 | 4 → 6 | chatterboxes everywhere; two captains; a gull |
  | ferry-01 … 10 | 7×7 | 6 → 8 | 12 → 16 people, three or four captains, gulls and fenders |

- **Intros and titles stay true.** Each schedule entry carries what its intro and title promise
  (market-09 "Two captains, one voice": exactly 2 captains and a chatterbox; ferry-08 "thirteen
  grumps, three of them captains": exactly 13 people, 3 captains), checked before a board is
  accepted. The existing narration test re-checks every intro against its board.
- **Limits unchanged**: 7 × 7 and 16 people are the level contract (§6); the finale uses them.
- **Deterministic**: the script searches seeds from a fixed base, so a re-run writes the same
  files on the same code. The daily level is not touched.
- **Old stars on new boards.** Ids stay, so a saved best from an old, smaller board would show
  stars for a board never played. Each level now has a **revision** (`levelRevision(id)`, 2 for
  the regenerated 24); progress stores it, and a best from another revision is dropped on load.
- **Generator fix** found on the way: a candidate can overshoot the people range by one; at 16
  that is not a board and `createGame` threw out of `generate`. It now skips such a candidate.
  The daily recipe (≤ 10 people) never reached it, so dailies are unchanged.

## Risks
- Longer play: the 30-level e2e journey taps every par solution, now ~150 taps instead of ~90.
- 7 × 7 at 320 px is already covered by the ≥ 44 px test.
- A regenerated level can be harder than its intro suggests ("Late for the ferry" is a mood,
  not a mechanic) — that is the point of the curve.

## Test matrix
| Case | Expected |
|:--|:--|
| from harbour-06 on (market-01 excepted) | each level's cells ≥ the previous, par ≥ the previous |
| last ferry level | 7 × 7, par ≥ 7 |
| every set's last level | par > its first non-lesson level |
| generate at the 16-people cap | never throws |
| daily for a fixed date | same board as before this change |
| progress with an old revision | the best is dropped; same revision kept |
| validate:levels | 30 levels, every par the solver's |
| narration | every intro still true of its board |
