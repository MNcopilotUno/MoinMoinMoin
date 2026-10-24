# Review — feature/north-german-art (adversarial)

Scope: new painter (`packages/assets/scripts/paint.browser.js`, `render-art.mjs`), all eight
paintings re-rendered, portraits in northern dress, herring gull and rope fender sprites, bunting
colours, CLAUDE.md §7. Design canvas: <https://claude.ai/artifact/N3zJU1QZCrMm4FXdqUbT6X>.

## Findings
1. **Precache weight grew by 540 KB** at JPEG quality 86 (1.02 → 1.56 MB of paintings). *Fixed:*
   quality 78 like the old renders → 1.12 MB (+98 KB). Checked by eye at phone size.
2. **Typecheck failed in `narration`** in the main checkout: `@types/node` from the QA merge was
   never installed here. Not a code bug; `pnpm install --frozen-lockfile` fixed it. CI installs
   fresh, so it was never red there.
3. **Brittle test**: asserting `class="post"` in Svelte HTML (scope class appended). *Fixed* with
   a selector query.
4. **`plank.svg` lost its generator** — the old `paint.mjs` `plank()` went with the file. The
   committed SVG is unchanged and is the source of truth; noted, not regenerated.
5. **Yellow-heavy cast** — fishermen (sou'wester) and kids (raincoat) are both oilskin yellow. At
   44 px they still differ by hat vs. hair and the striped shirt, and roles are in every label.
   *Accepted*; worth watching in play.
6. **The rope fender reads a little like a loaf** at the smallest cell size. *Accepted* for now;
   its slant (the only thing the rules need) is clear.
7. **Wide screens** stretch a 390-wide painting with `cover` — unchanged from before, not
   introduced here.
8. **Re-renders are not byte-stable** across Chromium builds (known); the committed JPEGs win.
9. **Red means Moin**: lighthouse white and ink, brick dusty rose, gull beak spot orange,
   bunting without red — portrait test and new sprite test cover the cast and the gull.

## Evidence
- Screens at 390 × 844, light and dark, harbour/market/ferry levels with gull, fender and
  captains: looked at by eye (fog on and off).
- lint clean; typecheck all packages; tests core 60, levels 62, narration 48, ui 54;
  `validate:levels` 30 levels, 14 fixtures; e2e 26/26 against the built app.
