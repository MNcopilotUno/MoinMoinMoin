# Review — feature/ui (ui + assets)

| # | Finding | Severity | Outcome |
|:--|:--|:--|:--|
| 1 | `announceTap` looked up `copy.announce[reason]` but the copy key was `stolen` while core's reason is `seagull`: a stolen Moin was announced as an empty string. Caught by the test. | blocker | Copy key renamed to match core's reason. |
| 2 | Component tests leaked DOM between tests (no `cleanup`), so `getAllByRole('button')[1]` clicked a button from the previous render. | major | `test/setup.ts` runs `cleanup` after each test. |
| 3 | Svelte event delegation means keyboard activation is the browser's native button behaviour, not tested in jsdom. | minor | Covered end-to-end in the app's Playwright suite (keyboard test). |
| 4 | Sprites use red only for smile, pips and bubble — checked by reading every `palette.moin` use. The seagull's stolen bubble is red: it *is* a Moin. | note | OK with CLAUDE.md §7. |
| 5 | `MoinBubble` uses a system font stack — no font fetched at runtime (CLAUDE.md §1). Rendering differs slightly per OS. | note | Accepted. |

Test count at merge: **ui 14 passed**; svelte-check 0 errors 0 warnings.
