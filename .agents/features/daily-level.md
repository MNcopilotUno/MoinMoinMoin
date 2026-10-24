# Feature: generator, daily level and the market and ferry sets

## Problem
Phase 2 asks for 30 levels in three sets and a daily level with a copyable emoji result, with no
server. Hand-drafting 20 more levels is slow; a daily level has to be *generated* identically on
every device from the date alone.

## Design
- `packages/levels/src/generate.ts`: integer-only PRNG (mulberry32 via `Math.imul`) and seed mixer.
  `candidate(seed, recipe)` grows chains of greetings — each new person, fender or gull is placed
  on the previous one's line of flight; captains appear where a second chain joins; chatterboxes
  on people who feed a captain. `assess` rejects: par out of range, too many minimum solutions,
  most first taps reaching par, idle gulls or fenders, unreachable captains, no real choice
  (every par tap on someone nobody greets), too many forced taps. `generate` returns the first
  candidate that passes, so the same seed gives the same level.
- **Daily level:** seed = mix(YYYYMMDD, "Moin"), recipe 6 × 6, par 3–5. **Decision on the open
  roadmap question: the player's local calendar day.** Two players with the same date on their
  phones get the same puzzle; nobody gets tomorrow's puzzle at 01:00 because of UTC.
- **Sets:** harbour (the original ten), market (chatterbox: one hand-made intro, nine generated
  and reviewed), ferry (bigger boards, everything at once, generated and reviewed). Generated
  boards were cropped to their used rows and columns (an empty outer row changes no outcome).
- Schema `id` now allows `daily-2026-10-24` (`^[a-z]+(-\d+)+$`).

## Risks
- Generated levels are machine-judged. The metrics catch the known failures
  (`.agents/lessons/puzzles.md`), not "is it fun". Playtest before more sets.
- Changing the generator changes every past and future daily. Pinned by
  `test/daily.golden.json` (also replayed in Chromium, Firefox and WebKit).

## Test matrix
| Case | Expected |
|:--|:--|
| rng(42) first values | pinned |
| same seed | same candidate, same generated level |
| 20 seeds | every kept fender bounced, assess clean |
| golden days | equal to `daily.golden.json` in Node and every browser |
| all 365 days of 2027 | valid, par 3–5, no warnings |
| 30 levels | three sets of ten, ids match set, market levels all have a chatterbox, harbour none |
| non-tutorial levels | no R10 / random-tapping warning |
