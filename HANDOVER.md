# Handover

_Last session (2026-11-01): Moin Domi S0 done; S1 + the S2 tree built and tested on loopback, not
hosted. Before that: Phases 0, 1 and 2 built and deployed. The Phase 1 gate (playtest) and the Phase 2
gate (a month of play) were **waived by the owner on 2026-10-24**, not passed. Phase 3 (Moin Domi)
is specified in `docs/MOIN_DOMI.md`; stage S0 is next. Live: <https://mncopilotuno.github.io/MoinMoinMoin/>._

## Where things stand

| Roadmap item | State |
|:--|:--|
| Rules | `docs/GAME_RULES.md` v1.1: line of flight, fenders, seagulls, captains, **chatterbox (R13)** |
| `packages/core` | Fixed-step simulation, events with ticks and `amount`, solver, purity lint |
| `packages/levels` | Schema 1.1, validator, 14 negative fixtures, **40 levels** (harbour, market, ferry, lighthouse), deterministic generator, **daily level** |
| Narration | 40 level intros, set-complete story beats, daily lines, reactions (chain, chatterbox, gull, captain, sea, par) |
| App | Cold open → first unsolved level; level select with star totals (120); fog lifting over each part of town; chain tune; chatterbox "Moin moin"; daily with copyable emoji result; undo/restart/mute; offline; reload to update |
| Deploy | Every push to `main` → CI (lint, typecheck, unit, levels, e2e incl. Firefox + WebKit replay) → GitHub Pages |
| Art | Impressionist direction (2026-10-24): generated Monet-like paintings per part of town, gouache portraits, Cormorant Garamond + Figtree self-hosted. Sketch: Claude Design canvas (private to the owner) |
| Crowd and night | Onlookers on the quay cheer each smile and celebrate a solve; gulls, boat, bunting and water ripples react to taps (never moves); dark mode = moonlit nocturnes, Auto/Day/Night in the menu |
| North German art | Paintings of the Speicherstadt, the fish auction hall and the dyke (underpainting + brush pass), northern dress, herring gull, rope fender — `.agents/features/north-german-art.md` |
| Link card and install sheet | `og.jpg` link card with Open Graph/Twitter tags, manifest screenshots (narrow + wide), README picture — none precached — `.agents/features/store-presence.md` |
| Bigger, progressive levels | 24 levels regenerated on a tested curve: harbour to 6×6 par 4, market 6×6→7×7 par 4→6, ferry 7×7 par 6→8 with up to 16 people; old bests from replaced boards dropped — `.agents/features/levels-progression.md` |
| The lighthouse | A fourth part of town after the ferry: 10 generated levels, all 7×7 with 16 people, par 8 → 9 (par 10 fails the quality bar at 16 people — measured), captains 3 → 5, finale with one answer; intros, a new last story beat, lighthouse paintings day/night/wide — `.agents/features/lighthouse.md` |
| Canvas parity | Facing chips, captain pips on the tile, chatterbox ×2 badge, narrator bell, win card as drawn — `.agents/features/canvas-parity.md` |
| Every screen | Landscape phones: two columns, board fills the height; desktop/tablet: wide North German paintings (cached on first use, not precached); 320 px header fits — `.agents/features/screens.md` |
| Settings | Ship's-wheel sheet: sound, volume, haptics, look, narrator, calm motion, start over (confirmed), about and privacy; update prompt and daily Share… restyled — `.agents/features/settings.md` |
| QA pass | Two QA agents (function/a11y, feel/sound); findings and outcomes in `.agents/reviews/qa-polish.md` |
| Moin Domi S0 | `packages/tessera` (128-bit link keys, HKDF, AES-GCM boxes bound to chain/parent/depth/hop, link codec, Cursus client, chain protocol with pending hops); threat model `.agents/features/tessera.md`; DSA answer `.agents/features/dsa.md` (hosting service, not a platform; Arts. 11, 12, 14, 16, 18) |
| Moin Domi S1 + tree | `packages/meme` (strict meme value, turn rules), `services/cursus` (Node + SQLite relay, caps, expiry, takedown), the app at `/domi/` designed after the dark canvas: home, make, rules, link, turn, tree with wave, finale with local voice, postcard (*Just send*, proposal A6), yours, gone, settings; save image as PNG. Live site: everything but sending ("the relay has no home") |
| Domi after S1 | Offline (worker, outbox, tree as last seen), relay rate limits + disk guard + deploy kit (`services/cursus/deploy/`), DSA contact + terms + *Report this chain* (`dsa.md`), S4 bridge from the puzzle's win card (`bridge.md`) |
| Domi on the phone | Installable with its own icon; share target (Android) opens a Moin link shared from a messenger; Yours refreshes finales and gone chains; 1.2 MB build — `domi-install.md` |
| Not done | Narrator voice (ROADMAP: only if the text earned it — needs a playtest); a recorded *Moin* (synthesised); illustrator-grade art |

Test counts: core 60, levels 81, narration 59, ui 59, tessera 38, meme 33, cursus 32; e2e puzzle
45 + Domi 21 on Chromium (incl. axe WCAG 2.2 AA on every screen) (Domi against a local Cursus; Firefox runs Domi in full, WebKit all but
the offline suite, which Playwright's WebKit cannot navigate);
`validate:levels` 40
levels ok, 14 fixtures fail as expected.

## Next

1. **Playtest** (the waived gate): three people, a phone, no explanation — level 1 in ten seconds,
   then hand them the market set. Does anyone ask for more?
2. **Phase 2 gate:** a month from now, do you still open it for fun?
3. Real-device checks still **predicted**: iOS silent switch and Web Audio; install banner on Android.
4. Moin Domi: **a host and a domain for Cursus** (owner's call). Then: run it with
   `services/cursus/deploy/` (systemd + Caddy or Docker — *untried on a real host*), set the
   repository variables `CURSUS_URL` and `DOMI_CONTACT`, push, and run the S1 gate with six
   people. Owner to confirm A6 (postcards), the red bubble (D4) and mood as a touch. Check by
   hand on a real iPhone: Domi offline (Safari) and the iOS silent switch. Still open:
   password/custom links wait for A2 (S3) — a candidate design is in
   `.agents/features/password-links.md` with four questions for the owner; Art. 16(4)–(5) receipts are answered by hand.
