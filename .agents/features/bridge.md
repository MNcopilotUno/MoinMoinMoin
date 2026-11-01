# Feature: the bridge — "Start a Moin chain" (ROADMAP Phase 4, Moin Domi S4)

## Problem
A solved level is the happiest moment in the puzzle; Moin Domi is where a *Moin* goes to real
people. The bridge links the two without the puzzle ever depending on Domi or its relay.

## Design
- The win card gets a quiet underlined link under its two buttons: *Start a Moin chain with
  friends* → `domi/?from=<levelId>`. A plain link: the puzzle fetches nothing for Domi until it is
  pressed (S4 gate). Offline (`navigator.onLine`), it is a disabled button described by *"Needs the
  internet: Moin Domi passes it on through a relay."* No red: it is not a Moin.
- Domi reads `?from=`, cleans the address, and opens *Make the meme* with the smiling captain in
  that level's part of town (`harbour`, `market`, `ferry`, `lighthouse` from the id; anything else
  → the harbour) and *When the whole harbour / finally says Moin* (*When even the lighthouse…*).
- Copy in `packages/ui/src/copy/en.ts` (CLAUDE.md §7).

## Risks
- **Every win shows it**, including the daily. Predicted to be ignorable because it is a text link
  below the buttons; revisit after the playtest if it nags.
- `navigator.onLine` is true on a captive Wi-Fi with no internet: the link then opens a Domi page
  that cannot load (first visit) or opens offline from its worker (later visits). Acceptable.
- On the live site Domi cannot send yet (no relay); the link still opens Domi, which says so.

## Test matrix
| Happy day | Bad weather |
|:--|:--|
| after a solve the link points at `domi/?from=<id>`, ≥ 44 px; Domi opens the market meme for `market-03` | no request to `/domi/` before pressing; offline → disabled with its reason, back online → link again; `?from=nonsense` → the harbour |
