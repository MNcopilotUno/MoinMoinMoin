# Lessons — technical

- **The *Reload* button was dead on a first visit.** vite-plugin-pwa's `updateSW(true)` relies on
  workbox-window's `controlling` event with `isUpdate`, which is only true when an older worker
  controlled the page when it loaded. A deploy landing during the very first visit showed the
  toast, and *Reload* did nothing. Found by `e2e/update.spec.ts`. Fix: listen for
  `controllerchange` ourselves, then post skip-waiting with `updateSW(false)`.
- **Vite's config loader cannot import workspace TS sources** (`@moin/core` resolves `.js` →
  `.ts` only inside Vite's pipeline). The manifest name and colours are literal in
  `vite.config.ts`; `e2e/app.spec.ts` checks them against `@moin/core` and `@moin/assets`.
- **Playwright version must match the machine's browsers.** `@playwright/test` 1.63.0 ↔
  Chromium build 1243 in `/opt/pw-browsers`; 1.64 wants 1248. CI installs its own browsers.
- **Win card over the narrator.** A `position: fixed` win card covered the narrator's par line on
  a phone; the e2e "narrator can be tapped away" test timed out. The card now sits in the flow.
- **Re-rendering committed art with Chromium is not byte-stable** (GPU rasterisation noise, mean
  difference 0.003). Restore unchanged images after `pnpm --filter @moin/assets art` so commits
  only carry art that really changed.
- **Anything animated past the viewport edge widens the page on a phone** and shifts every fixed
  element. Clip ambient animation containers (`overflow-x: clip`) and test `scrollWidth`.
- **JPEG quality is a precache budget decision.** The new paintings at quality 86 added 540 KB
  to the offline precache; at 78 (what the old renders used) the cost was ~100 KB with no visible
  loss at phone size. Measure the `dist/assets/*.jpg` total against the previous build.
- **Svelte adds scope classes**, so a test asserting `class="post"` in rendered HTML fails;
  query with `container.querySelector('.post')` instead.
- **Look at the screens nobody tests.** Every e2e ran at phone portrait; a landscape phone could
  not see the board, and a desktop showed a blurry crop. One screenshot per screen shape found
  both. `screens.spec.ts` now keeps landscape, desktop and 320 px honest.
- **Not every asset belongs in the precache.** Images only some screens use (wide paintings) go
  to `globIgnores` plus a CacheFirst route, with a precached fallback layered underneath, so
  phones never pay for desktop art and desktops still work offline.
