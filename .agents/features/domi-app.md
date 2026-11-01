# Feature: the Moin Domi app, after dark (S1 + the S2 tree)

Design: the owner's canvas <https://claude.ai/artifact/DjZsy8JNkX6pj4g9SWJUJp> (private to the
owner) — 12 phone screens and a style board, dark only. Spec: `docs/MOIN_DOMI.md` D1–D11, D14,
A4, A6 (proposal). Built on `packages/tessera`, `packages/meme`, `services/cursus`.

## Problem
Replace the shell card at `/domi/` with the real app: make a meme, choose chain or postcard,
get a link; open a link, change one word and one touch, pass it on; see the tree and the
finale; keep your chains on the phone. It must be honest that the relay is not hosted yet.

## Design
- **One Svelte app, one screen at a time** (`App.svelte` holds the screen state; no router
  library). Screens follow the canvas: Home, Make the meme, How it travels, Link ready, Your
  turn, The tree, The finale, Postcard, Yours, Gone, Settings. The canvas's *Unlock* screen is
  not built: password links are S3 (A2).
- **Dark only.** Tokens from the style board: black `#000`, card `#0C0C0E`, hairline `#2B2B33`,
  paper `#F6EFDF` (text and the one main button), lilac `#C9C3E2`, mist `#B9B3CF`, dusk
  `#8E88A8`, lamp gold `#F2C46B` (your place, what changed, the key), Moin red `#C8102E` (the
  bubble only). No `prefers-color-scheme` branch, `color-scheme: dark`.
- **The meme** is drawn in HTML/SVG from its value: the night painting for `where`, the gouache
  `portrait()` from `@moin/ui` for `who` and `mood`, the `SeagullSprite`, the red bubble,
  white captions with an ink outline. *Save image* draws the same layers onto a canvas → PNG.
- **Links.** `…/domi/m/<id>#<key>`. GitHub Pages has no route for `/domi/m/…`, so the assembled
  site gets a root `404.html` that turns it into `…/domi/?m=<id>#<key>` (the fragment never
  leaves the browser, the redirect keeps it). On load the app reads the link, saves the key in
  IndexedDB and **replaces the address with the bare app URL** so the key is not left in history
  (tessera review, finding 6).
- **Relay.** `VITE_CURSUS_URL` at build time. Without it (the live site today) everything but
  sending works and the button says why: *"Sending isn't switched on yet."* The CSP's
  `connect-src` gets the relay origin and nothing else.
- **Yours** (IndexedDB, one record per chain): the hop you hold, the chain key once you have
  taken a turn, the last meme you saw, stop and limits, expiry. Status: *your turn*,
  *travelling*, *finale*, *postcard*, *ending soon* (≤ 3 days).
- **Speech** (D9): only voices with `localService`; with none the button is disabled and says so.
- **Settings:** remember nickname, the Moin sound, calm motion, what the relay sees, forget
  everything on this phone (confirmed).

## Risks and gaps
- **Not reachable from the live site** until Cursus has a home (§9). The e2e suite runs the
  whole flow against a local Cursus.
- **No offline queue** (§6 Offline): offline, sending is disabled with *"You're offline — try
  again when you're back"* instead of queuing. Gap.
- **No service worker** for Domi yet: a received meme does not open offline (§6). Gap.
- **Two links of one chain** on one phone: the record keeps the newest hop until you take a turn,
  then the tree covers both.
- Tree layout for 100 hops × 3 branches is wide; the tree scrolls sideways inside its frame.

## Test matrix (`apps/moin-domi/e2e`, built app + local Cursus)
| Happy day | Bad weather |
|:--|:--|
| cold open shows Home with both choices; make → rules → link; a second person opens the link (via the `/m/` path and the 404 redirect), swaps one word, passes on; the tree opens with both versions; the last stop gets the finale; a postcard opens as a postcard; Yours lists the chain; the address bar holds no key after opening | budget 1: a second word is locked; a link with a broken key → "This link is broken"; an unknown hop → Gone; no request off the app's origin and the relay; every button ≥ 44 px; no relay configured → sending disabled with the reason |
