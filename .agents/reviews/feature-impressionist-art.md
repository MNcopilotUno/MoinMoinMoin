# Review — feature/impressionist-art

| # | Finding | Severity | Outcome |
|:--|:--|:--|:--|
| 1 | First canvas sketch was published unrendered and looked cheap. | blocker | Redone with a render-and-look loop; lesson in `process.md`. |
| 2 | Masts and towers looked dashed: thin lines broken by the displacement filter and overpainted by water strokes. | major | Boats painted last, outside the filter; towers drawn as silhouettes. |
| 3 | Market stalls and the ferry first rendered as flat clip-art over the painting. | major | Painted into the filtered layer, broken with strokes in their own colours, hazed. |
| 4 | Captain: cap over the eyes, beard painted over the mouth so his smile vanished. | major | Cap raised; mouth drawn after the beard; mustache on top. |
| 5 | Fisherman stubble spilled outside the face; knit ribs poked above the beanie. | minor | Both clipped. |
| 6 | Market sun sat behind the title on the game screen. | minor | Market painting re-rendered with the sun on the right. |
| 7 | Full fog on a fresh start would have hidden the painting on the very first screen. | major | Fog capped at a light mist (0.5) that still lifts per part of town. |
| 8 | Kicker wrapped as "LEVEL 1 / OF 10". | minor | Place and level on two explicit lines. |
| 9 | Manifest and fog e2e tests still asserted the old royal blue and an SVG attribute. | minor | Updated to the new palette and the CSS opacity. |
| 10 | Precache grew to ≈ 750 KB (paintings + six font files). | note | Accepted for an installable PWA; Latin subsets only. |
| 11 | SVG filters on many portraits may cost frame time on old phones *(predicted)*. | note | Portraits are static; only the bubble animates. Check on a low-end phone at the playtest. |

Test counts at merge: core 60, levels 62, narration 18, ui 42; e2e 19 (Chromium, `BASE_PATH=/MoinMoinMoin/`).
