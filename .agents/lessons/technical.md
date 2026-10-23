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
