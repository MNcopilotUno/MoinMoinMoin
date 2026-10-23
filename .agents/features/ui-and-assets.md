# Feature: shared ui and assets

## Problem
The harbour needs a look (flat SVG, chunky outlines, simple faces — the smile is the reward), a
*Moin* sound, and an accessible board, without the app owning any of it and without any rule
logic in the UI (CLAUDE.md §2, §7).

## Design
- `@moin/assets`: palette tokens (TS + CSS, **red only for Moin**), the PWA icons (SVG source,
  PNGs rendered once with the local Chromium and committed), and `playMoin()` — an original
  synthesised "Mo-in": a sawtooth voice through three formant filters gliding [o] → [i] with a
  nasal hum at both ends. No sample file, nothing to license, pitchable for the Phase 2 tune.
- `@moin/ui`: `Board` (CSS grid; every person a `<button>` with a full label, seagulls and fenders
  `role="img"`), sprites (person with role looks: fisherman, captain = needs 2 with grumpy brows,
  market woman, kid; seagull that holds a stolen red bubble; fender plank), `MoinBubble`, `Stars`,
  `IconButton` (≥ 44 × 44 px), copy in `src/copy/en.ts`, `announceTap()` for the live region.
- Facing is shown twice: pupils look that way and a small pointer sits at that edge of the tile.
- Half-greeted captains: a crooked half-smile (ink) and two pips, the received one red.

## Risks
- `playMoin` is a placeholder for "one recorded Moin" (Phase 1): a real voice recording is the
  owner's call (ROADMAP open question). iOS silent switch behaviour unverified **(predicted)**.
- Board cell size is `max(44px, …)`: a 7-wide level on a 320 px screen would overflow by design
  rather than shrink below 44 px.

## Test matrix
| Case | Expected |
|:--|:--|
| person labels for each role, 0/1/2 greetings | exact strings ("Grumpy captain, facing south, half-greeted, needs one more") |
| needs 2 drawn as captain whatever `role` says | captain |
| board: only people are buttons | 2 buttons, gull + fender are images |
| click a person | `ontap(x, y)` |
| Moin at sub-unit point | left/top percentages |
| gull holding Moin | label says so |
| announce chain into gull, solved | "Two people smiled. A seagull stole the Moin." / "… Everyone is smiling." |
