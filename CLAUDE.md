# CLAUDE.md

Operating manual for AI agents working in the **Moin** repository.
Read this together with [`HANDOVER.md`](HANDOVER.md) (where the last session left off) and
[`docs/ROADMAP.md`](docs/ROADMAP.md) (phases and gates).

> **This is a small project and the manual is sized to match.** It borrows its workflow rules from
> Ludus, NoAlgoTube and Aeterna rather than re-earning them. Where a trap is predicted rather than
> observed, it says **(predicted)** and must be confirmed with a measurement or struck out.
> If this file ever grows past ~250 lines, the project has stopped being small — say so.

---

## 1. What this is

Two tiny games built around the northern German greeting *Moin*. One repository, two apps, shared
art and the shared *Moin* sound.

- **Moin Moin Moin** — a puzzle PWA, **logical and physical** in the spirit of the water-glass
  physics puzzles: the *Moin* moves through the harbour like a real thing you can watch, and every
  level still has a solution you can reason out. A narrator tells the story of a grumpy harbour
  waking up. A level is solved when everyone is smiling. Fewer moves, more stars.
  **This is built first.**
- **Moin Domi** — a real *Moin* passed between real people via a link, in the Domi ecosystem.
  A private Stille Post for memes: specified in `docs/MOIN_DOMI.md` (stages S0–S4, decisions
  D1–D16, amendments A1–A5). Not built yet beyond an app shell. Domi never adds a network call to
  the puzzle, and the puzzle keeps working with `services/cursus` deleted.

Properties that are not negotiable:

- **Fun in under ten seconds.** Cold open → first level → first ripple, with no menu, no tutorial
  screen and no name prompt. One tap to play.
- **Local-first and silent.** Works offline after the first load. No accounts, no analytics, no
  cookies, no third-party origin, no ads. Progress lives in the browser.
- **Original assets only.** Every sprite and every sound is made for this project. No stock packs,
  no fonts fetched from a CDN at runtime.
- **Physical, but deterministic.** The same moves on the same level produce the same result on
  every device, every time. That is what makes a level solvable, par computable and a daily level
  fair. A physics effect that cannot be replayed exactly does not ship.
- **Narrated, never in the way.** The narrator speaks in one short line at a time, and every line
  can be tapped away. Narration never stands between cold open and the first ripple.

**What this is not:** not a social network, not a monetised product, not a platform. If a feature
needs a server, it belongs to Moin Domi and to a later phase.

---

## 2. Repository layout

```
pnpm-workspace.yaml
packages/
  core/          # PURE game rules: board, fixed-step deterministic simulation, win check, solver.
                 #   No DOM, no clock, no random, no physics library.
  levels/        # level JSON files + the JSON Schema + validator (uses core's solver)
  narration/     # the narrator's lines (data) + pure selection of which line plays when
  assets/        # shared sprites, the Moin sound(s), palette tokens
  ui/            # shared Svelte components (crowd grid, person sprite, buttons). No rules.
apps/
  moin-moin-moin/   # the puzzle PWA (Svelte 5 + Vite + workbox)
  moin-domi/        # Moin Domi app shell (Svelte 5 + Vite); S0 adds packages/tessera, S1 services/cursus
docs/
  ROADMAP.md
  GAME_RULES.md     # the normative rules, mirrored by core's tests
  MOIN_DOMI.md      # Moin Domi: specification, decisions D1–D16, stages S0–S4
.agents/            # feature analyses, reviews, lessons
```

**Dependency direction:** `apps/* → ui → core`, `apps/* → levels → core`, `apps/* → assets`.
`core` imports nothing from this repository. An app that decides whether a level is solved is a
layering violation and a review **blocker**.

The name *Moin Moin Moin* appears in source only in `packages/core/src/constants.ts`,
`apps/moin-moin-moin/index.html` and the web manifest.

---

## 3. Commands

```bash
pnpm install --frozen-lockfile
pnpm --filter @moin/moin-moin-moin dev     # 127.0.0.1:5173 — never --host
pnpm build
pnpm test                                  # vitest: core, levels, narration, ui
pnpm test:e2e                              # Playwright against the BUILT app, never the dev server
pnpm test:offline                          # load once, cut the network, solve a level, reload, progress survives
pnpm validate:levels                       # schema + solver on every level; negative fixtures must FAIL
```

> **Exit code 0 is not green.** Quote the test count per package. Four packages have tests
> (`core`, `levels`, `narration`, `ui`); a run that names fewer has told you nothing.

---

## 4. Game rules — v1.1 (grid-aligned flight)

`docs/GAME_RULES.md` **v1.1** is the rule book: the *Moin* flies over open water on a fixed integer
step, bounces off fenders and is stolen by seagulls, and stays fully deterministic; a chatterbox's
*Moin moin* carries two greetings (R13). v0 (adjacent
only) is kept there as Appendix A, the fallback. The design round that chose v1 is
`.agents/features/physical-model.md`.

Decided, and true of both models:

- **Win:** everyone smiles. Stars: 3 at par, 2 at par + 1, 1 otherwise. No fail state, free undo
  and restart.
- **Every chain terminates.** Each person starts smiling at most once; any rule that lets a person
  un-smile needs a termination argument in its analysis document.
- **Par comes from the solver**, never from an author's count.
- `core` returns the result of a move as an **ordered list of events** (`greeted`, `smiled`,
  `launched`, `bounced`, `stolen`, `chainEnded`, each with its tick). The UI animates that list
  and decides nothing — the narrator reacts to the same events.

---

## 5. Workflow rules (borrowed — see Ludus §5 for the long versions)

1. **Analysis before done.** Every feature gets `.agents/features/<name>.md`: problem, design
   (Mermaid if it helps), risks, gaps, and a test matrix with happy and bad-weather cases.
   Short is fine; missing is not. Order is docs → tests → code.
2. **Lessons by category** in `.agents/lessons/<category>.md` (`design.md`, `code.md`,
   `technical.md`, `testing.md`, `process.md`, and **`puzzles.md`** — every level that turned out
   trivial, unsolvable-looking, or solvable by tapping at random is a lesson).
3. **Branch → self-review → `--no-ff` merge → push**, every feature. Review goes in
   `.agents/reviews/<branch>.md` and must be adversarial: a review that finds nothing has failed.
   `git rev-parse HEAD origin/main` must print the same hash twice.
4. **Commit format:** `[<package>] <Feature>: <one line>`. Remotes: GitHub
   `https://github.com/MNcopilotUno/MoinMoinMoin` (deploys to GitHub Pages) and Gitea
   `https://gitea.marek-novak.cz/mnovak/moin.git`, branch `main`.
5. **No AI attribution in commits, PRs or tags — ever.** No `Co-Authored-By`, no session links,
   no generated-with lines. Strip any trailer a tool appends.
6. **Build output is never committed.** `dist/`, `.turbo/`, `node_modules/` are ignored from the
   first commit; a pre-commit hook rejects staged files over 5 MB. Audio source files (`.wav`,
   project files) stay out too — only the exported, compressed sound ships.
7. **Say which build you are describing.** The player runs a precached PWA shell. "Fixed" means
   rebuilt, redeployed, and the service worker updated — and if a change is deliberately invisible,
   say so.
8. **Leave the machine as you found it.** Loopback only, every browser closed in `finally`, no full
   run above ~80 % CPU.

---

## 6. The contract: the level file

`packages/levels/level.schema.json`, `formatVersion` `1.0.0`.

```jsonc
{
  "formatVersion": "1.0.0",
  "id": "harbour-01",
  "title": "First Moin",
  "width": 4, "height": 3,
  "cells": [
    { "x": 0, "y": 1, "kind": "person", "facing": "E", "needs": 1 },
    { "x": 1, "y": 1, "kind": "person", "facing": "E", "needs": 1 },
    { "x": 2, "y": 1, "kind": "seagull" },
    { "x": 3, "y": 0, "kind": "fender", "slant": "rising" }
  ],
  "par": 2
}
```

`pnpm validate:levels` **runs the solver on every level** and rejects a level that is unsolvable,
whose `par` is not the solver's optimum, or that has a cell outside the grid or two cells on one
square. A level whose author-claimed par disagrees with the solver is wrong, not the solver.

Negative fixtures in `packages/levels/fixtures/` — the validator must fail each one with a message
naming the problem: unsolvable level, wrong par, overlapping cells, cell out of bounds, unknown
`kind`, `needs` outside 1–2, missing `facing` on a person, missing `slant` on a fender, grid
larger than 7 × 7, more than 16 people, version not `MAJOR.MINOR.PATCH`, unsupported major
version, a chatterbox in a file older than 1.1.0, `chatterbox` not a boolean.
Adding a rule without its fixture is a review **blocker**.

---

## 7. Conventions

- **TypeScript strict** everywhere, `noUncheckedIndexedAccess` on. Level types are generated from
  the schema.
- **`core` is pure**: no `Date.now()`, no `Math.random()`, no I/O. Enforced by a lint rule.
- **Progress** (solved levels, best taps) lives in IndexedDB through one module in the app. No
  `localStorage`, no cookies.
- **Touch first.** Every tap target at least 44 × 44 CSS px; the grid must be fully playable one-
  handed on a phone.
- **Accessible from the first commit.** Every person is a focusable button with a label ("Grumpy
  fisherman, facing east, needs two greetings"); the ripple is also announced as text.
- **Sound is optional and never blocking.** Start muted until the first tap; respect a mute toggle.
- **Copy** lives in `packages/ui/src/copy/`. Interface in plain English; *Moin* stays *Moin*.
- **Look:** a touch of Monet on the North German coast — generated paintings behind the play
  (`packages/assets/scripts/paint.browser.js`: a composed underpainting of Speicherstadt gables,
  the fish auction hall, the dyke or the lighthouse on its mole, then seeded brush strokes that
  follow its edges) and small
  gouache portraits with real faces in northern dress (`packages/ui/src/portrait.ts`); the smile
  is still the reward you see. Palette: lilac, dawn
  peach, harbour water and sage, harbour ink for lines and text. **Red means *Moin*** (speech
  bubble, smiles) and is used for nothing else; stars are ochre-gold. Cormorant Garamond and
  Figtree, self-hosted. **Night harbour** (dark mode): moonlit nocturnes; `--ink` and `--paper`
  swap, red still means Moin. **The harbour is alive:** onlookers on the quay, gulls, a boat,
  bunting, ripples — decoration only, never a move.
- **Cast:** fishermen in sou'wester and oilskin, a grumpy captain in an Elbsegler cap (the one who
  needs two greetings), a market woman in a Kopftuch, kids in raincoats, and herring gulls on
  mooring posts as the cheeky villains. The lighthouse is white and ink: red means Moin.
- **Narration** lines live in `packages/narration/` as data: one sentence each, dry northern
  humour, reacting to events (a long chain, a stolen *Moin*, a par finish), never repeating the
  same line twice in a row.

---

## 8. Known traps

| Trap | Why it bites |
|:--|:--|
| **The stale service worker** | A precached shell keeps serving old JS after a deploy. The worker script's own bytes and the precache `revision` values must change; do not put the build hash in the cache name. Show a *reload to update* control when a worker is `waiting`. |
| **Par claimed by hand** | Authors miscount. Only the solver's number is par (§6). |
| **Levels solvable by tapping at random** *(predicted)* | If most taps lead to a win, the puzzle is a toy. The validator should report how many first taps lead to a par solution; a level where most do is a candidate for `puzzles.md`. |
| **Audio before a user gesture** | Browsers block audio until the user interacts with the page. Create or resume the audio context on the first tap, never on load. |
| **iOS silent switch mutes Web Audio** *(predicted)* | Confirm on a real iPhone before claiming sound works there. |
| **Playwright against the dev server** | It doesn't run the service worker. E2E and offline suites run against `pnpm build` output only. |
| **Physics that drifts between devices** *(predicted)* | JavaScript's `Math.sin`, `Math.cos` and similar are allowed to differ slightly between engines, and a variable frame rate changes every collision. Either is enough to make a level solvable on one phone and not another. Simulate on a fixed step with no transcendental functions in the hot path (lookup tables or fixed-point), render by interpolation, and keep a replay test that runs a recorded solution on Chromium, Firefox and WebKit and asserts identical events. |
| **A narrator who blocks play** | Text that must be read before tapping kills the ten-second rule on the first level and gets skipped by everyone on the tenth. Lines appear beside the play, auto-dismiss, and never gate input. |
| **Scope creep into Moin Domi** | Domi is a private chain, not a platform: uploads, feeds, discovery, accounts, push and analytics are out of scope (`MOIN_DOMI.md` §8). The puzzle makes no network call for Domi until "start a Moin chain" is pressed (S4). |

---

## 9. Where to look first

| I need to… | Start here |
|:--|:--|
| Change a rule | `docs/GAME_RULES.md`, then `packages/core/`, then re-run the solver over every level |
| Add or fix a level | `packages/levels/` — and let the validator set par |
| Change what the narrator says | `packages/narration/` |
| Change how something looks or sounds | `packages/assets/`, `packages/ui/` |
| Understand why something behaves strangely | `.agents/lessons/` |
| See what is planned | `docs/ROADMAP.md` |
