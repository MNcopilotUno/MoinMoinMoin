# Review — feature/app

| # | Finding | Severity | Outcome |
|:--|:--|:--|:--|
| 1 | *Reload to update* did nothing when the deploy landed during the first visit (workbox `isUpdate` false). | blocker | Fixed in `src/lib/sw.ts`; `e2e/update.spec.ts` covers it; lesson in `technical.md`. |
| 2 | Fixed-position win card covered the narrator's finishing line on a phone. | major | Card moved into the page flow under the narrator. |
| 3 | The score row and the win card both show "3 of 3 stars": tests matched two elements. | minor | Tests scope to the win card. |
| 4 | `vite.config.ts` repeats the game name and two colours. | minor | Unavoidable with Vite's config loader; an e2e test pins them to core/assets. |
| 5 | Reduced motion skips the flight entirely, so the gull's loot and fender thud are never shown. | minor | Accepted for Phase 1; the announcement text still says what happened. |
| 6 | `onTap` reads `matchMedia` on every tap. | note | Cheap; leaves it reactive to a system change mid-game. |
| 7 | A level's narrator intro plays on every level start, including "Play again" via Next from the last level. | note | Fine: it is one line and auto-dismisses. |
| 8 | CI deploys only from the default branch; the session branch is the only branch, so it is the default for now. | note | Recorded in HANDOVER. |

Test count at merge: core 54, levels 31, narration 15, ui 20 (unit); e2e 14 passed on Chromium
with `BASE_PATH=/MoinMoinMoin/`.
