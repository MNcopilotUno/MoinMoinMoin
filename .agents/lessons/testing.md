# Lessons — testing

- **Random boards must respect the board rules.** The 6 × 6 generator produced 17 people
  about one run in three, so `createGame` threw `BoardError` and the termination property failed
  for the wrong reason. Filter generated boards to 1–16 people; a flaky property test is a
  generator bug until proven otherwise.
- **Exit code 0 is not green**: quote the count. core: 54 tests at the first merge.
- **Ambient animation never settles**, so Playwright's "stable" check times out on swaying
  buttons. Run those tests with reduced motion — which also proves the harbour stays playable
  without motion (it found gulls covering each other).
- **Run the e2e suite on its own.** Started alongside vitest it failed to load specs (*predicted*
  cause: the two runs contending for the same transform cache); alone it passed. Confirm or strike.
- **Size assertions need a precision.** A 44 px button measured 43.99999 px in CI (float layout
  at a 2× device scale) and passed locally. Compare rounded to the hundredth; the rule (≥ 44 px)
  stays exact, the measurement gets a stated precision.

## A rate limit is shared by every browser in the run (2026-11-01, Moin Domi CI)
Cursus allows 10 new chains per address in a burst. Locally only Chromium runs, so the e2e suite
made 5 and passed; in CI Chromium, Firefox and WebKit all talk to one relay from 127.0.0.1, and
from the 11th chain on every create got 429 — two "ordinary" WebKit tests and Firefox's offline
flush failed far from the cause. The test relay now runs with `CURSUS_RATE_SCALE=100`. Before
pushing a change to limits, count what the *whole CI matrix* does, not one browser.

## Playwright's WebKit cannot navigate offline, even with a service worker
`context.setOffline(true)` then `reload()` or `goto()` fails with "WebKit encountered an internal
error" in Playwright's WebKit, although real Safari serves the page from its worker. The Domi
offline suite runs on Chromium and Firefox; the puzzle already ran Firefox/WebKit for replay only.
