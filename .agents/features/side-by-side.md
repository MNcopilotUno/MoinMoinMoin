# Feature: the two apps beside each other

## Problem
The owner (2026-11-06): Moin Domi was not shown beside Moin Moin Moin. The puzzle mentioned Domi
only on the win card (S4), after a solve; Domi had no way back to the puzzle at all.

## Design
- **Puzzle → Domi**: a *Moin Domi* card in the level menu (*The town*), right under the daily
  level, in Domi's own look (black, its icon) so it reads as the sister app, not a level. A plain
  link to `domi/`: the puzzle fetches nothing for Domi until it is pressed (S4 gate, CLAUDE.md §1);
  offline it is shown greyed with *Needs the internet the first time.*
- **Domi → puzzle**: a card on Domi's Home under *All your chains and postcards*, with the puzzle's
  icon and its name from `@moin/core` (`GAME_NAME`, CLAUDE.md §2), linking to `../`.
- **Not on the cold open**: the puzzle still opens straight into level 1 (the ten-second rule);
  the level menu is the first place a player looks for "what else is here".

## Test matrix
| Happy day | Bad weather |
|:--|:--|
| the level menu links to `domi/`, ≥ 44 px; Domi's Home links to `../` with the puzzle's name | no request to `/domi/` before pressing; offline the card is not a link and says why |
