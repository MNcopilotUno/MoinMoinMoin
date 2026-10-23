# Review — feature/narration

| # | Finding | Severity | Outcome |
|:--|:--|:--|:--|
| 1 | Three lines were two sentences ("The gull took it. Of course…"), breaking "one sentence each". The one-sentence test caught it. | major | Rewritten as single sentences. |
| 2 | Without a quiet rule the narrator would comment on every Moin lost at sea — most taps on most levels. | major | `EDGE_QUIET_TAPS = 3`. |
| 3 | `waiting` fires only when the last greeted person needs two; a fisherman can never be "waiting", so that is fine — but a captain *tapped* once also triggers "the captain heard that". | note | Intended: it reads well for both. |
| 4 | Rotation is by spoken-counter, so the line choice depends on how chatty the session was — deterministic but not reproducible across sessions with different histories. | note | Acceptable: determinism matters for rules, not for jokes. |

Test count at merge: **narration 15 passed**.
