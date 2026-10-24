# Feature: the chatterbox (GAME_RULES v1.1, R13)

## Problem
Phase 2's first new mechanic (ROADMAP). With only `needs: 1` people par is mechanical
(`.agents/lessons/puzzles.md`); captains create choices but need two separate ripples.

## Design
A chatterbox is a person flagged `chatterbox: true`. When they smile they say *Moin moin*: their
Moin carries **two greetings**. Reaching a captain, it wakes him on its own; reaching a
fisherman, the extra greeting is lost (greetings are capped at `needs`).

Options weighed:

| Option | Watchable | Termination | R9 | Verdict |
|:--|:--|:--|:--|:--|
| A. One Moin worth two greetings | yes (a bigger "Moin moin" bubble) | unchanged: one Moin per smile | holds: greetings still only add up | **chosen** |
| B. Two Moins, forward and backward | very | each smile launches ≤ 2 Moins: still ≤ 2·people flights | holds, but two Moins in flight at once need simultaneous simulation and a tie rule when both reach one person on the same tick | rejected for now: doubles core's complexity for one mechanic |
| C. Reaches two squares past the first person | yes | unchanged | holds | rejected: invisible rule, reads as a bug |

- Level files: `"chatterbox": true` on a person needs `formatVersion` ≥ 1.1.0 (a 1.0 reader would
  silently play a different puzzle). The schema allows the field; the validator checks the
  version.
- Events: `greeted` and `launched` gain `amount` (1 or 2). Golden replay regenerated — this is a
  rule change.
- Solver: `smilesAfter` adds `amount` instead of 1. Order still does not matter.
- Look: a chatterbox has two little speech marks beside the head; their bubble says *Moin moin*.
- Narration: a chatterbox line when a chatterbox's Moin wakes a captain in one go.

## Risks
- A chatterbox pointed at a captain is a "free captain"; levels must make the player *find* the
  chatterbox route, not hand it over.

## Test matrix
| Case | Expected |
|:--|:--|
| chatterbox into captain | captain smiles from one Moin; `greeted.amount = 2` |
| chatterbox into half-greeted captain | smiles (capped at 2) |
| chatterbox into fisherman | smiles; greetings capped at 1 |
| chatterbox tapped | tap greeting is still 1 |
| chatterbox into gull / edge / smiling person | unchanged endings |
| random boards with chatterboxes | termination, R9, solver = brute force |
| level 1.0.0 with chatterbox | validator error naming the version |
| chatterbox not boolean | validator error |
