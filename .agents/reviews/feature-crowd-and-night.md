# Review — feature/crowd-and-night

| # | Finding | Severity | Outcome |
|:--|:--|:--|:--|
| 1 | Gull lanes translated past the right edge, widening the page: on a phone everything fixed shifted and the level-select tiles became unclickable (the banner intercepted taps). | blocker | `.sky { overflow-x: clip }` plus a page guard; e2e "no sideways scrolling". |
| 2 | Re-rendering art also rewrote the day JPEGs with sub-pixel noise (mean diff 0.003). | minor | Restored; only new nocturnes committed. Noted in `technical.md`. |
| 3 | The night ferry first rendered chalk-white. | minor | Night hull and superstructure in moonlit blues, lit windows. |
| 4 | The quay stayed sunlit sand at night. | minor | Moonlit shade over the planks; lanterns glow via `--glow`. |
| 5 | Onlookers drawn with captain pips would read as puzzle state. | major | `portrait({ pips: false })` for the crowd. |
| 6 | A fieldset's `min-width: min-content` can widen a dialog. | minor | `min-width: 0` on the theme fieldset. |
| 7 | The quay and sky cost ≈ 200 px of height; 7 × 7 boards on short phones fall back to 44 px cells and the page scrolls. | note | Accepted: cells never shrink below 44 px (CLAUDE.md §7). |
| 9 | With reduced motion all three gulls parked on the same spot and covered each other's tap targets. Found by the e2e test running under reduced motion. | major | Each gull rests at its own x (`--rest`). |
| 8 | Crowd cheers are driven by `launched` events as the animation reaches them, not by the rules. | note | Matches CLAUDE.md §4: the UI reacts to events and decides nothing. |

Test counts at merge: core 60, levels 62, narration 18, ui 48; e2e 22 (Chromium, `BASE_PATH=/MoinMoinMoin/`).
