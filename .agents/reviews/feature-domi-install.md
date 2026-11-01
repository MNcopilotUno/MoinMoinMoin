# Review — feature/domi-install (adversarial)

Scope: Domi's icon, web manifest, share target, iOS metas (`.agents/features/domi-install.md`).

## Findings
1. **Domi used the puzzle's `../icon.svg`**, which 404s whenever Domi is served alone (the e2e
   server showed it in every trace). *Fixed*: its own icons from `packages/assets/icons/domi`.
2. **A shared link from another origin** reached `openLink`, whose offline branch puts the link
   back with `history.replaceState` — a cross-origin URL there throws a `SecurityError`. *Fixed*:
   only same-origin links are put back.
3. **Rendering the Domi icons re-rendered the puzzle's** (one script). The puzzle PNGs came out
   byte-identical? Not checked; *reverted to the committed files* so this branch changes nothing
   of the puzzle.
4. **Two manifests on one origin** (puzzle at `/`, Domi at `/domi/`): scopes differ, so the
   browser installs them as two apps. The puzzle's scope still contains `/domi/`, so an installed
   puzzle may open a Domi link inside the puzzle's window. *Not tested on a device*; logged.
5. **The share target is Android-only** and untestable here beyond the URL it produces; the e2e
   test drives that URL. *(predicted)* entries in the feature doc for real messengers.

## Evidence
Domi e2e: manifest, icons and share tests new and passing on Chromium (full suite in the merge
run); `svelte-check` 0/0; icon checked by eye at 192 px.
