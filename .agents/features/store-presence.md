# Feature: how the game looks before it is opened

## Problem
A link to the game, pasted in a chat, shows a bare URL: no picture, no title card. Chrome's
richer install sheet (Android, desktop) shows nothing but the icon, because the manifest has no
screenshots. The README has no picture either. The key art already exists on the design canvas
(<https://claude.ai/artifact/N3zJU1QZCrMm4FXdqUbT6X>, KeyArt) and the wide harbour painting is in
the repo.

## Design
- **Social card** `og.jpg` (1200 × 630): the wide harbour painting with the canvas's title panel
  ("Moin Moin Moin", the tagline, a red *Moin* bubble — red means Moin), rendered by
  `packages/assets/scripts/render-social.mjs` with the self-hosted fonts, into the app's public
  folder. `index.html` gets Open Graph and Twitter-card tags: title, description, image, alt.
  The image URL must be absolute: the build reads `SITE_URL` (set in the deploy workflow to
  `https://mncopilotuno.github.io`) and joins it with the base path; without it (local builds)
  the tags use the base path alone.
- **Install screenshots**: `screenshots/narrow.jpg` (the play screen, 390 × 844 at 2×) and
  `screenshots/wide.jpg` (1440 × 900), taken from the **built** app by
  `apps/moin-moin-moin/scripts/screenshots.mjs` (local static server, reduced motion, a solved
  harbour level so faces smile), listed in the manifest with `form_factor` and labels.
- **README**: the social card at the top.
- **Not precached**: the social card and screenshots are for other apps and the install sheet,
  never for play; `globIgnores` keeps them out of the service worker (players don't pay for them).
- **No third party**: Open Graph tags are read by whoever fetches the page; the game itself still
  makes no request off its origin (CSP unchanged).

## Risks
- Scrapers cache cards; a later change to `og.jpg` may take days to show in some apps.
- Screenshots go stale when the look changes — the script re-takes them in one command.

## Test matrix (e2e, built app)
| Case | Expected |
|:--|:--|
| index.html | `og:title`, `og:description`, `og:image` (ends `og.jpg`), `og:image:alt`, `twitter:card=summary_large_image` |
| `og.jpg` | served, 1200 × 630 JPEG |
| manifest | two screenshots, `narrow` and `wide`, sizes match the files, served |
| service worker | precache lists neither `og.jpg` nor `screenshots/` |
