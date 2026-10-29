# Review — feature/settings (adversarial)

Scope: settings sheet with start-over confirm and about view, calm motion as `data-calm`,
volume and independent haptics, narrator switch, look moved out of the level menu, update prompt
and daily Share… restyled. Design: <https://claude.ai/artifact/EbSkyzcZ7eJpSconQFaAzL>.

## Findings
1. **Dialog name changed with the view.** `aria-labelledby` pointed at whichever `h2` was shown,
   so on the about view the dialog was announced as "About and privacy" and lost its identity.
   *Fixed* before the first run: a constant `aria-label="Settings"`.
2. **Confirm trapped inside a transformed scroller.** The sheet was centred with `transform`,
   which makes `position: fixed` children relative to the sheet: on a scrolled sheet the confirm
   could sit off-screen. *Fixed*: centred with `margin-inline: auto`, no transform at rest.
3. **Svelte a11y warning**: `role="dialog"` on `<section>`. *Fixed* with a `div`, like the menu.
4. **Ship's wheel read as a sun** at 20 px (no rim). *Fixed*: rim and hub drawn; looked at.
5. **"Sound / Sound"** heading over its own switch. *Fixed*: "Sound and touch".
6. **Volume default** would have lowered the measured −24 LUFS mix by ~4 dB at 80 %. *Fixed*:
   default 100 %, squared curve below that.
7. **Haptics now ignore mute** — a behaviour change from the QA pass (buzz was quiet when muted).
   *Intended*: the owner's design separates them; documented in `settings.md`.
8. **Late storage after the 600 ms fallback** re-applies stored settings over anything the player
   changed in that window. Rare (slow IndexedDB *and* opening settings within 0.6 s); accepted.
9. **Mute is one tap further away** (in the sheet, not the header). Accepted for the 320 px
   header; sound still starts silent until the first tap.
10. **Not built**: "Pass a real Moin (offline)" — the Phase 4 bridge into Moin Domi, which waits
    for the owner's Domi roadmap; "After this level" on the update prompt (✕ Later covers it).

## Evidence
lint clean; typecheck all packages, `svelte-check` 0 warnings; tests core 60, levels 62,
narration 48, ui 54; `validate:levels` 30 levels, 14 fixtures; e2e 33/33 on the built app
(7 new in `settings.spec.ts`, the night-harbour and update tests updated). Screens looked at:
390 × 844 light and dark (sheet, confirm, about), 320 × 568 sheet.
