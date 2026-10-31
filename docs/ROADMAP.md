# Moin — roadmap

Companion to [`CLAUDE.md`](../CLAUDE.md). Small project, evenings and weekends; durations are
calendar time. Every phase ends in a gate: a question with an observable answer. Failing a gate
means the next phase does not start.

---

## 0. Why this exists

For fun, and as a friendly, shareable way into the Domi ecosystem. Revenue is not a goal, so no
phase is judged on it. The real risk is scope creep: two small games turning into a third
unfinished platform. The gates are there to stop that.

---

> **Status (2026-10-31):** Phases 0–2 built and live at
> <https://mncopilotuno.github.io/MoinMoinMoin/>. The Phase 0, 1 and 2 gates were **waived by
> the owner, not passed** — no playtest yet, and the Phase 2 month has not elapsed. Phase 3 is
> specified in `MOIN_DOMI.md` (owner's spec, amended 2026-10-31); stage S0 is next. See
> `HANDOVER.md`.

## Phase 0 — Design and foundations · ~1–2 weeks

- **Design round (consilium):** settle the physical model, the player's move, determinism, the
  narrator and the story arc. Result: `docs/GAME_RULES.md` v1.
- Repo, `.gitignore`, 5 MB pre-commit hook, Gitea remote, this roadmap, `CLAUDE.md`.
- `packages/core`: board, fixed-step deterministic simulation, win check, solver, purity lint.
- `packages/levels`: schema, validator, negative fixtures, three hand-made levels.
- **A throwaway physics sketch** — one screen, one moving *Moin*, no art — to feel whether the
  model is fun before anything is built on it.

**Gate:** the sketch is fun to watch at least five times in a row, and the replay test produces
identical events on Chromium, Firefox and WebKit. `pnpm validate:levels` passes on the real levels
and fails on every fixture with a message naming the problem.

---

## Phase 1 — Playable core · ~2–3 weeks

- Puzzle PWA: one screen, the harbour, a move → the *Moin* travels, driven by core's events;
  win screen with stars, next level.
- Placeholder art, one recorded *Moin*, the narrator as text with ~20 placeholder lines.
- 10 levels introducing one idea at a time.
- Installable, offline after first load, progress in IndexedDB.
- Offline Playwright suite.

**Out of scope:** level select, settings beyond mute, real art, voice, anything networked.

**Gate — the real question.** Hand a phone to three people without explaining anything. Do they
solve level 1 within ten seconds, does anyone read a narrator line aloud or laugh at one, and does
at least one of them ask for more levels unprompted? Yes → Phase 2. No → fix the first levels, the
model or the lines before adding anything.

---

## Phase 2 — Make it charming and catchy · ~3–4 weeks

- Real art: flat SVG harbour cast, royal blue and red palette (red only for *Moin*).
- **The chain plays a tune:** each greeting in a chain one note higher.
- **The narrator's story:** a foggy, grumpy harbour morning brought back to life one part of town
  at a time; voice for the narrator if the text version earned it.
- **The chatterbox**, who says *Moin moin* and greets twice — the first new mechanic.
- **Daily level** with a copyable emoji result — text only, no server.
- 30 levels in three sets (harbour, market, ferry), level select, star totals, *reload to update*.
  *Later (owner: "more levels"): a fourth set, the lighthouse, makes it 40 —
  `.agents/features/lighthouse.md`.*

**Gate:** you, a month later, still open it for fun. If it's a chore to play your own game, it is
done as a toy — ship what exists and stop.

---

## Phase 3 — Moin Domi · ~7–10 weeks

A private Stille Post for memes. Specification and its own stages S0–S4 live in
[`MOIN_DOMI.md`](MOIN_DOMI.md); start it only after the Phase 2 gate (waived by the owner).

---

## Phase 4 — The bridge · ~1 week

A "pass a real Moin" button on the puzzle's win screen that opens Moin Domi.

**Gate:** the button works offline-gracefully (disabled with a reason, never an error) and adds no
network call to the puzzle until it is pressed.

---

## Open questions

- Hosting and domain for the two apps.
- Whether the *Moin* sound is your own voice or a few different voices.
- Whether the puzzle eventually gets a level editor (probably not — that's how small projects grow).
- ~~Whether the daily level needs the same puzzle for everyone on the same local day, or the same UTC day.~~
  Decided: the player's **local** calendar day (`.agents/features/daily-level.md`).
