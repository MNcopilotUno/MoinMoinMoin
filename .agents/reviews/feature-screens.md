# Review — feature/screens (adversarial)

Scope: landscape-phone layout, wide paintings for wide windows (not precached), small-phone
header type, fender contrast. Found by looking at 844 × 390, 1440 × 900, 1024 × 768, 320 × 568.

## Findings
1. **Landscape phones could not play without scrolling** (board below the fold) — the real bug.
   *Fixed*: two-column grid, board sized from `--board-room-w` / `--board-reserve`; tested on
   5 × 5 and 7 × 7 (board in view, no scroll, buttons ≥ 44 px) and the win card beside the board.
2. **Desktop showed a blurred, cropped phone painting.** *Fixed* with six 1600 × 1000 paintings.
   They would have cost every phone ~1.1 MB of precache: *excluded* (`globIgnores`), cached on
   first use instead; offline the portrait layer underneath shows. A test reads `dist/sw.js`.
3. **The market hall stretched flat on a wide canvas** (width ∝ canvas). *Fixed* before
   committing: width capped at 250 × object scale; looked at day and night.
4. **Landscape hides the quay and the sky band.** Decoration only (CLAUDE.md §7), so accepted —
   but the crowd's cheer is gone in that layout. Worth a look if landscape play turns out common.
5. **The manifest still asks for portrait** — installed PWAs on Android stay portrait; this fixes
   the browser tab and tablets. Left as is on purpose.
6. **Dark landscape win**: the best-stars row sits at the far right of the left column, next to
   the board; reads fine, noted.
7. **Fender**: higher contrast braid and an outline; at the smallest cells it is still a little
   loaf-like. Accepted; its slant (the only thing the rules need) is clear.

## Evidence
lint clean; typecheck all packages; tests core 60, levels 62, narration 48, ui 54;
`validate:levels` 30 levels, 14 fixtures; e2e 39/39 on the built app (6 new in `screens.spec.ts`).
Screens looked at by eye: landscape (play and night win), desktop, tablet, 320 px.
