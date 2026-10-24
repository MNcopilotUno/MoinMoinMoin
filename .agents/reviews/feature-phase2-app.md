# Review — feature/phase2-app

| # | Finding | Severity | Outcome |
|:--|:--|:--|:--|
| 1 | A person facing south was unreadable: the dark facing pointer sat on the captain's navy coat (seen in the ferry screenshot). | major | Pointer drawn on top with a white halo and enlarged. |
| 2 | Daily crowds were all fishermen — the generator assigns no roles. | minor | `cast()` assigns captains, market women (chatterboxes), kids, fishermen; daily golden regenerated on purpose. |
| 3 | `fog` derived referenced `solved` before its declaration (TS error). | blocker | Reordered. |
| 4 | Level select picked levels by `set index × 10 + i`, silently wrong if a set ever has ≠ 10 levels. | minor | Offset computed from the preceding sets' lengths. |
| 5 | The level-select dialog was a `<section role="dialog">` — svelte a11y warning. | minor | `<div role="dialog" tabindex="-1">`, Escape and backdrop close, focus moves to the current tile. |
| 6 | CI warned about Node 20 actions; the source was `upload-pages-artifact@v4`'s internal pin, not our step. | minor | `upload-pages-artifact@v5`, `pnpm/action-setup@v5`, `upload-artifact@v6` — inputs checked unchanged. |
| 7 | The set-complete line fires only the first time a set is completed; replaying a level of a finished set gives the normal par line. | note | Intended. |
| 8 | Header now has four 44 px tools; on a 320 px screen the title wraps to two lines. | note | Acceptable; title has `overflow-wrap`. |

Test counts at merge: core 60, levels 62, narration 18, ui 25; e2e 19 (Chromium, `BASE_PATH=/MoinMoinMoin/`).
