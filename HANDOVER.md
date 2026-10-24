# Handover

_Last session: Phases 0, 1 and 2 built and deployed. The Phase 1 gate (playtest) was **waived by
the owner on 2026-10-24**, not passed. Live: <https://mncopilotuno.github.io/MoinMoinMoin/>._

## Where things stand

| Roadmap item | State |
|:--|:--|
| Rules | `docs/GAME_RULES.md` v1.1: line of flight, fenders, seagulls, captains, **chatterbox (R13)** |
| `packages/core` | Fixed-step simulation, events with ticks and `amount`, solver, purity lint |
| `packages/levels` | Schema 1.1, validator, 14 negative fixtures, **30 levels** (harbour, market, ferry), deterministic generator, **daily level** |
| Narration | 30 level intros, set-complete story beats, daily lines, reactions (chain, chatterbox, gull, captain, sea, par) |
| App | Cold open → first unsolved level; level select with star totals (90); fog lifting over each part of town; chain tune; chatterbox "Moin moin"; daily with copyable emoji result; undo/restart/mute; offline; reload to update |
| Deploy | Every push to `main` → CI (lint, typecheck, unit, levels, e2e incl. Firefox + WebKit replay) → GitHub Pages |
| Not done | Narrator voice (ROADMAP: only if the text earned it — needs a playtest); a recorded *Moin* (synthesised); illustrator-grade art |

Test counts: core 60, levels 62, narration 18, ui 25; e2e 19 on Chromium; `validate:levels` 30
levels ok, 14 fixtures fail as expected.

## Next

1. **Playtest** (the waived gate): three people, a phone, no explanation — level 1 in ten seconds,
   then hand them the market set. Does anyone ask for more?
2. **Phase 2 gate:** a month from now, do you still open it for fun?
3. Real-device checks still **predicted**: iOS silent switch and Web Audio; install banner on Android.
4. Phase 3 (Moin Domi) must not start before the Phase 2 gate. Its design starts in conversation.
