# Feature: every screen (landscape phones, desktop, 320 px)

## Problem
Found by looking, after the settings release (and QA m6, p3):
- **Landscape phone (844 × 390):** the board starts below the fold; only its top row shows.
  The board reserves 500 px of height for header, sky, quay and narrator, which a landscape
  phone does not have. Not playable without scrolling.
- **Desktop / tablet landscape:** the portrait painting (390 × 844 at 2×) is scaled to cover a
  1440 × 900 window: blurry, and the harbour skyline is cropped to giant bricks at the bottom.
- **320 px phone:** the kicker wraps to four lines ("THE / HARBOUR / LEVEL 9 OF / 10") and the
  title to two.
- The rope fender reads as a loaf at small cell sizes (north-german-art review, finding 6).

## Design
- **Landscape layout** (`orientation: landscape` and `max-height: 560px`): the shell becomes two
  columns — header, score and narrator on the left, the board on the right, filling the height.
  The sky band and the quay (decoration only, CLAUDE.md §7) are left out; the win card sits in
  the left column so it never covers the solved board. The Board takes its sizing room from CSS
  variables (`--board-room-w`, `--board-reserve`) with today's values as defaults, so the
  portrait layout is unchanged.
- **Wide paintings:** the painter renders each part of town, day and night, as a 1600 × 1000
  landscape (`*-wide.jpg`) — same scenes, composed for a wide window. `Scene` layers the wide
  painting over the portrait one when the window is wider than tall. The wide images are **not
  precached** (they would add ~1 MB for every phone); the service worker caches them on first
  use, and offline the portrait painting underneath still shows.
- **Small phones (< 360 px):** kicker in smaller, tighter caps; title `clamp(1.9rem, 9vw, 2.5rem)`.
- **Fender:** darker braid lines and rope ends, a lighter body.

## Risks
- Landscape on an installed PWA is rare: the manifest asks for portrait. The browser tab and
  tablets still rotate, which is why it matters.
- Two background layers on wide screens load the portrait image too — already in the precache,
  so no extra network.
- Re-renders are not byte-stable across Chromium builds; the committed JPEGs are the source.

## Test matrix (e2e, built app)
| Case | Expected |
|:--|:--|
| 844 × 390, 5 × 5 level | whole board inside the viewport, no vertical scroll, person buttons ≥ 44 px |
| 844 × 390, 7 × 7 level | same |
| 844 × 390, solve level 1 | win card does not overlap the board |
| 1440 × 900 | scene's background uses the `-wide` painting; portrait still layered under it |
| 390 × 844 | scene uses only the portrait painting (no wide download on phones) |
| 320 × 568 | kicker ≤ 2 lines, title on one line for "Two for the captain" |
| precache | no `-wide` image in the service worker's precache manifest |
| all existing e2e | unchanged |
