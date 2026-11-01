# Review — feature/bridge (adversarial)

Scope: the puzzle's win card links to Moin Domi (`.agents/features/bridge.md`); Domi opens a
ready meme for `?from=<levelId>`.

## Findings
1. **The puzzle must not depend on Domi** (CLAUDE.md §1). It renders an `<a href>` and listens to
   `online`/`offline`; it imports nothing from Domi, Tessera or Cursus. Deleting `services/cursus`
   changes nothing in the puzzle. Test: no request to `/domi/` before the link is pressed.
2. **A disabled link is not a thing** — offline it becomes a disabled `<button>` with
   `aria-describedby` on the reason, so a screen reader hears why. Tested.
3. **The level id reaches Domi in the URL.** It is a public level name (`market-03`), not anything
   about the player; Domi removes it from the address at once.
4. **Changes the puzzle's precached JS**: players get *reload to update* after this deploy —
   intended, not invisible.
5. **Shown on every win** (risk in the feature doc). Not decided by a playtest; *flagged*.
6. **The S4 stage was meant to come after S3** (password links), which waits for the owner's A2
   design. S4 does not depend on S3; building it now is a reordering, recorded in `MOIN_DOMI.md`.

## Evidence
puzzle e2e **45/45** (bridge test new), Domi e2e **12/12** (S4 test new), unit tests unchanged
(ui 59), typecheck 0/0 in all three Svelte projects, lint clean; win card checked by screenshot.
