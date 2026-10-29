# Review — feature/store-presence (adversarial)

Scope: link card (`og.jpg` + Open Graph/Twitter tags), install screenshots in the manifest,
README picture; scripts `render-social.mjs` and `screenshots.mjs`.

## Findings
1. **Card title wrapped** ("Moin Moin / Moin") and the panel hid the Speicherstadt gables in the
   first render. *Fixed*: wider panel, `nowrap` title, panel lowered; the bubble moved to the
   cutter's wheelhouse. Looked at.
2. **First screenshots told no story** (one tap on the captain: one red pip, no smiles). *Fixed*:
   three greedy taps, each the one that wakes the most people; par 4 keeps the level unsolved.
3. **Screenshots built for the wrong base** at first (app built for `/`, served at
   `/MoinMoinMoin/`): the script needs `BASE_PATH` for both build and run — stated in its header.
4. **`og:image` must be absolute** for Facebook and others. CI now sets `SITE_URL`; a local build
   writes a base-relative URL (fine for testing, not for sharing). Checked a CI-style build:
   `https://mncopilotuno.github.io/MoinMoinMoin/og.jpg`.
5. **Not precached**: `og.jpg` and `screenshots/**` are in `globIgnores`; a test reads `sw.js`.
6. **CSP unchanged**: tags are read by whoever fetches the page; the game still requests
   nothing off its origin.
7. **Stale risk**: screenshots and the card show today's look; re-run both scripts after a
   visual change. Scrapers cache cards for days.
8. **Agent worktrees** (`.claude/worktrees/`) appeared inside the repo while a level agent ran:
   ignored in git and eslint so they are never committed or linted twice.

## Evidence
lint clean; typecheck all packages; tests core 60, levels 68, narration 48, ui 59; e2e 43/43 on
the built app (3 new in `store.spec.ts`). Looked at `og.jpg` and both screenshots.
