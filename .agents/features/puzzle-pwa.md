# Feature: the puzzle PWA (Phase 1)

## Problem
One screen where a tap sends a Moin through the harbour, driven only by core's events, offline
after the first load, fun in under ten seconds.

## Design
- Cold open: progress from IndexedDB (600 ms fallback so storage never delays play) → first
  unsolved level. No menu, no tutorial, no name prompt.
- A tap: `core.tap` → new state + events → `ui.frameAt(events, tick)` per animation frame
  (60 ticks/s, linear interpolation) → board draws greetings/Moin/gull/fender from the frame.
  The app decides nothing about rules; it only asks core `isSolved`.
- A tap during an animation finishes it instantly and is applied — input is never gated.
- `prefers-reduced-motion`: no flight animation; result shown at once.
- After the animation: narrator line (`triggerForTap` / par or over-par), progress saved.
- Sound: AudioContext on the first tap; each launch says *Moin* (captain lower, kid higher);
  mute stored in IndexedDB.
- PWA: vite-plugin-pwa `generateSW`, `prompt` mode, *reload to update* toast; CSP meta allows
  only `'self'`; deploy to GitHub Pages under `/MoinMoinMoin/` via `BASE_PATH`.

## Risks / gaps
- Firefox/WebKit only run the replay test (CI); the gameplay suite runs on Chromium.
- No real-device check yet (iOS audio, Android install banner).

## Test matrix (e2e, built app)
| Case | Expected |
|:--|:--|
| cold open → tap | Moin visible < 10 s, win card 3 stars, Next focused |
| labels and sizes | every person a labelled button ≥ 44 × 44 px; tool buttons too |
| ripple announced | "Two people smiled. The Moin flew out to sea." |
| R2 + undo | smiling tap not counted; undo restores count and face |
| keyboard only | Enter on a person, Enter on Next |
| narrator | visible on start, does not block a tap, tap dismisses |
| tap mid-animation | counted |
| all 10 levels at par via UI | win + 3 stars each; back to level 1 with stars kept |
| reload | continues at first unsolved level |
| privacy | no foreign request, no cookie, empty localStorage, no CSP violation |
| manifest | name/colours equal core + palette |
| offline | load, offline, reload, solve, reload → progress kept |
| deploy while open | toast → Reload → new worker active, no waiting worker |
| replay | golden events in the browser engine |
