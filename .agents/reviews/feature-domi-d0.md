# Review — feature/domi-d0 (adversarial)

> **Superseded 2026-10-31.** The owner replaced this design with `docs/MOIN_DOMI.md`; the
> format, `packages/domi-link` and `DOMI_*` docs were removed. Kept as history.

Scope: Moin Domi D0 — `docs/DOMI_FORMAT.md` (normative), `packages/domi-link` (format v1:
encode, lock/unlock with PBKDF2 + AES-256-GCM, read with seven error codes, pass on, fading,
validation), seven negative fixtures, the cross-engine gate, `apps/moin-domi` scaffold, one Pages
site for both apps, the puzzle's service worker kept off `/domi/`.

## Findings
1. **The game's name was hard-coded in Domi's card** ("Play Moin Moin Moin meanwhile"), breaking
   CLAUDE.md §2 (the name lives in three files only). *Fixed*: `GAME_NAME` from `@moin/core`.
2. **The puzzle's service worker would have served the puzzle at `/domi/`** — its
   `navigateFallback` covers the whole `/MoinMoinMoin/` scope. *Fixed*:
   `navigateFallbackDenylist: [/\/domi\//]`, checked by a test on the built `sw.js`.
3. **Domi shares the puzzle's origin**, so it shares IndexedDB and the puzzle's cache storage.
   D0 stores nothing. *Open for D1*: Domi must use its own database name (`moin-domi`).
4. **DEFLATE output differs between engines.** The format says so (§3) and the gate tests
   interoperability both ways (engine → Node, Node → engine), never byte equality.
5. **Tampered ciphertext and a wrong password are indistinguishable** (AES-GCM by design); the
   message names both without hinting which. A fixture covers each.
6. **Gate only half-run locally**: this machine has Chromium only; Firefox and WebKit run in CI
   (`PW_ALL_BROWSERS=1`). D0 is not called done until that CI run is green.
7. **PBKDF2 600 000** makes each lock/unlock ~0.3 s in Node *(phone cost predicted, measured in
   D1)*. It is part of the format; lowering it later is a format change.
8. **Payload `d` is the sender's local day**, so fading depends on two clocks; documented in the
   format, acceptable for a promise between friends (honest expiry, ROADMAP §2.3).
9. **The early-link notice** recognises any `#m<digits>` fragment, without reading it: a broken
   link also says "a Moin is waiting". Acceptable for a scaffold; D1 reads and explains.

## Evidence
lint clean; typecheck all packages and both apps; tests core 60, levels 81, narration 59, ui 59,
domi-link 39 (7 fixtures); `validate:levels` 40 levels, 14 fixtures; e2e puzzle 44/44, Domi 5/5
(Chromium; the gate's Firefox and WebKit legs run in CI). Looked at the scaffold at 390 × 844.
