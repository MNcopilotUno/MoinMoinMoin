# Handover

_Last session: Phases 0, 1 and 2 built and deployed. The Phase 1 gate (playtest) and the Phase 2
gate (a month of play) were **waived by the owner on 2026-10-24**, not passed. Phase 3 (Moin Domi)
waits for the owner's own roadmap for it — see `docs/ROADMAP.md` Phase 3. Live: <https://mncopilotuno.github.io/MoinMoinMoin/>._

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
| Not done | Narrator voice (ROADMAP: only if the text earned it — needs a playtest); a recorded *Moin* (synthesised); illustrator-grade art |

Test counts: core 60, levels 81, narration 59, ui 59; e2e 43 on Chromium; `validate:levels` 40
levels ok, 14 fixtures fail as expected.

## Next

1. **Playtest** (the waived gate): three people, a phone, no explanation — level 1 in ten seconds,
   then hand them the market set. Does anyone ask for more?
2. **Phase 2 gate:** a month from now, do you still open it for fun?
3. Real-device checks still **predicted**: iOS silent switch and Web Audio; install banner on Android.
4. Phase 3 (Moin Domi): gate waived; **wait for the owner's Moin Domi roadmap** before any code in
   `apps/moin-domi`. Direction so far is recorded in `docs/ROADMAP.md` Phase 3.
