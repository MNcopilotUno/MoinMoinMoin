# Handover

_Last session: Phase 0 and Phase 1 built, end to end. Both phase gates are human gates and are
**not** passed yet — see "Next" below._

## Where things stand

| Roadmap item | State |
|:--|:--|
| Design round → `docs/GAME_RULES.md` v1 | Done: grid-aligned flight on a fixed integer step, fenders, seagulls (`.agents/features/physical-model.md`) |
| Repo, `.gitignore`, 5 MB pre-commit hook | Done (`.githooks/pre-commit`, enabled by `pnpm install`) |
| `packages/core` | Board, fixed-step simulation, events with ticks, win check, stars, solver, purity lint (tested) |
| `packages/levels` | Schema, generated types, validator, 12 negative fixtures, 10 harbour levels |
| Replay test | Golden events; Node + Chromium locally, + Firefox + WebKit in CI |
| Throwaway physics sketch | Skipped as a separate file: the real board animates core's events, which is the sketch's question |
| Puzzle PWA (Phase 1) | One screen, harbour, Moin flight, win card with stars, next level, undo, restart, mute |
| Narrator | 26 placeholder lines, beside the board, auto-dismiss, tap to dismiss |
| Sound | Synthesised "Mo-in" (`packages/assets/src/moin-sound.ts`), not a recording |
| Installable, offline, IndexedDB | Done; `pnpm test:offline` |
| Reload to update | Done (CLAUDE.md §8) and tested |
| Deploy | GitHub Actions → GitHub Pages on every push to `main` |

Test counts at handover: core 54, levels 31, narration 15, ui 20; e2e 14 (Chromium);
`validate:levels` 10 levels ok, 12 fixtures fail as expected.

## Next

1. **Phase 0 gate (human):** is watching the Moin fly fun five times in a row? Does the replay
   job pass on Firefox and WebKit in CI?
2. **Phase 1 gate (human):** three people, a phone, no explanation. Level 1 in ten seconds? A
   narrator line read aloud or laughed at? Anyone asking for more levels?
3. Record a real *Moin* if the synthesised one doesn't charm (ROADMAP open question).
4. Confirm sound on a real iPhone (silent switch, CLAUDE.md §8 — still **predicted**).
5. Read `.agents/lessons/puzzles.md` before adding levels: with only `needs: 1`, par is
   mechanical.

Phase 2 must not start before the Phase 1 gate.
