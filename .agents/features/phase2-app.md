# Feature: Phase 2 in the app — level select, story, tune, daily

## Problem
ROADMAP Phase 2 (gate waived by the owner on 2026-10-24): make it charming and catchy — 30 levels
in three sets with level select and star totals, the narrator's story of a town waking up one part
at a time, the chain playing a tune, a daily level with a copyable emoji result, the chatterbox.

## Design
- **Cold open unchanged:** still straight into the first unsolved story level; no menu in the way.
  Level select is a header button (grid icon) opening a dialog: Daily Moin, then the harbour, the
  market and the ferry, each with its star total and ten tiles; a grand total of 90 stars.
- **Story:** each set has a scene strip (lighthouse and boat, striped market stalls, the ferry)
  under a fog layer whose opacity is `0.85 × (1 − solved / 10)` — the part of town clears as it
  wakes. Thirty level intros; a set-complete line when the tenth level of a set is first solved.
- **Tune:** each Moin in a chain one note higher on a major pentatonic scale (`ui/tune.ts`); a
  chatterbox says it twice.
- **Daily:** `dailyLevel(local date)` from `@moin/levels`; progress saved under `daily-YYYY-MM-DD`;
  the win card adds *Copy result* (`navigator.clipboard`, falling back to a read-only text box).
  The text: game name, day, stars, taps, par and the woken harbour as emoji — no link, no URL.
- **Voice for the narrator:** not done. ROADMAP makes it conditional on the text version having
  earned it, which only a playtest can tell.

## Risks / gaps
- The roadmap gate before this phase was waived, not passed: nobody has playtested.
- Real art is still the Phase 1 flat SVG style plus scenes; no illustrator pass.
- Clipboard needs a secure context (GitHub Pages is HTTPS) and a user gesture (the button).

## Test matrix (e2e on the built app)
| Case | Expected |
|:--|:--|
| all 30 levels at par via the UI | win, 3 stars each; the harbour-complete line after harbour-10 |
| level select | three sets, "3 of 90 stars" after level 1, tile labels with stars, Escape closes, pick a ferry level |
| fog | opacity drops after a solve |
| chatterbox | bubble says "Moin moin", captain wakes, 1 tap |
| daily | same board as the generator in Node, solvable at par, copied text has the date and ⭐⭐⭐ and no URL, back to the town |
| daily generator in each engine | equal to `daily.golden.json` (Chromium locally; Firefox, WebKit in CI) |
