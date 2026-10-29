# Handover

_Last session: Phases 0, 1 and 2 built and deployed. The Phase 1 gate (playtest) and the Phase 2
gate (a month of play) were **waived by the owner on 2026-10-24**, not passed. Phase 3 (Moin Domi)
waits for the owner's own roadmap for it — see `docs/ROADMAP.md` Phase 3. Live: <https://mncopilotuno.github.io/MoinMoinMoin/>._

## Where things stand

| Roadmap item | State |
|:--|:--|
| Rules | `docs/GAME_RULES.md` v1.1: line of flight, fenders, seagulls, captains, **chatterbox (R13)** |
| `packages/core` | Fixed-step simulation, events with ticks and `amount`, solver, purity lint |
| `packages/levels` | Schema 1.1, validator, 14 negative fixtures, **30 levels** (harbour, market, ferry), deterministic generator, **daily level** |
| Narration | 30 level intros, set-complete story beats, daily lines, reactions (chain, chatterbox, gull, captain, sea, par) |
| App | Cold open → first unsolved level; level select with star totals (90); fog lifting over each part of town; chain tune; chatterbox "Moin moin"; daily with copyable emoji result; undo/restart/mute; offline; reload to update |
| Deploy | Every push to `main` → CI (lint, typecheck, unit, levels, e2e incl. Firefox + WebKit replay) → GitHub Pages |
| Art | Impressionist direction (2026-10-24): generated Monet-like paintings per part of town, gouache portraits, Cormorant Garamond + Figtree self-hosted. Sketch: Claude Design canvas (private to the owner) |
| Crowd and night | Onlookers on the quay cheer each smile and celebrate a solve; gulls, boat, bunting and water ripples react to taps (never moves); dark mode = moonlit nocturnes, Auto/Day/Night in the menu |
| North German art | Paintings of the Speicherstadt, the fish auction hall and the dyke (underpainting + brush pass), northern dress, herring gull, rope fender — `.agents/features/north-german-art.md` |
| Every screen | Landscape phones: two columns, board fills the height; desktop/tablet: wide North German paintings (cached on first use, not precached); 320 px header fits — `.agents/features/screens.md` |
| Settings | Ship's-wheel sheet: sound, volume, haptics, look, narrator, calm motion, start over (confirmed), about and privacy; update prompt and daily Share… restyled — `.agents/features/settings.md` |
| QA pass | Two QA agents (function/a11y, feel/sound); findings and outcomes in `.agents/reviews/qa-polish.md` |
| Not done | Narrator voice (ROADMAP: only if the text earned it — needs a playtest); a recorded *Moin* (synthesised); illustrator-grade art |

Test counts: core 60, levels 62, narration 48, ui 54; e2e 39 on Chromium; `validate:levels` 30
levels ok, 14 fixtures fail as expected.

## Next

1. **Playtest** (the waived gate): three people, a phone, no explanation — level 1 in ten seconds,
   then hand them the market set. Does anyone ask for more?
2. **Phase 2 gate:** a month from now, do you still open it for fun?
3. Real-device checks still **predicted**: iOS silent switch and Web Audio; install banner on Android.
4. Phase 3 (Moin Domi): gate waived; **wait for the owner's Moin Domi roadmap** before any code in
   `apps/moin-domi`. Direction so far is recorded in `docs/ROADMAP.md` Phase 3.
