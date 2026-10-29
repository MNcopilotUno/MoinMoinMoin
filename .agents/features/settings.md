# Feature: settings and dialogs

## Problem
The owner asked for the settings and every dialog to be designed, then built. Today the game has
one mute button in the header, the theme switch hidden in the level menu, no way to turn the
narrator off, haptics tied to sound, no app-level calm motion (only the phone's setting), no way
to start over, and no "about" page saying what is (not) collected. Design canvas (private to the
owner): <https://claude.ai/artifact/EbSkyzcZ7eJpSconQFaAzL>, row "Moin Moin Moin".

## Design
- **Settings sheet** (`apps/moin-moin-moin/src/components/SettingsSheet.svelte`), opened from a
  gear in the header that takes the mute button's place (five 44 px buttons do not fit next to
  the kicker on a 320 px phone). A modal like the level menu: page `inert`, Tab cycles, Escape
  closes, focus returns to the gear.
  - **Sound** (switch) — was the header mute; **Volume** (0–100 %, the master bus, squared for
    perceived loudness); **Haptics** (switch, now independent of sound).
  - **Look**: Morning / Auto / Night — moved here from the level menu.
  - **Narrator** (switch): off hides the narrator and the quote in the win card. Narration state
    still advances, so turning it back on never repeats a line.
  - **Calm motion** (switch): follows the phone's *reduce motion* until touched, then remembered.
    Implemented as `data-calm` on `<html>`: every `prefers-reduced-motion` rule in `ui` and the
    app becomes a `:root[data-calm]` rule, and a calm tap skips the flight animation exactly as
    reduced motion already did.
  - **Progress**: stars and solved count, **Start over…** → an `alertdialog` whose default
    ("Keep my stars") is the safe choice; Start over clears the solved levels and opens level 1.
  - **About and privacy**: a second view in the same sheet — what stays on the phone, that
    nothing is collected, offline, original art, open fonts, the source link.
- **Update prompt**: "A fresh harbour is ready." with a line that progress is safe; Reload now
  or ✕ Later.
- **Daily share**: adds **Share…** (the phone's share sheet, `navigator.share`) next to Copy when
  the browser offers it. Still text only, no link, no server.
- All settings in IndexedDB through `progress.ts` (CLAUDE.md §7), one key each.

## Not built
- **Pass a real Moin (offline)** from the canvas: that is the Phase 4 bridge into Moin Domi,
  which waits for the owner's Domi roadmap (CLAUDE.md §1: nothing anticipates Domi).
- "After this level" for the update: Later already defers it; one choice fewer.

## Risks
- Moving mute out of the header costs one tap for a frequent action *(predicted acceptable:
  sound starts muted until the first tap anyway)*.
- `:global(:root[data-calm])` replaces media queries: before the script runs nothing is calm.
  The app sets the attribute in its first effect; the cold open has no motion before that.
- Clearing progress is irreversible — guarded by the confirm, default on "Keep my stars".

## Test matrix (e2e, built app)
| Case | Expected |
|:--|:--|
| open settings, Escape | dialog closes, focus back on the gear; page inert while open |
| sound switch off, reload | `aria-checked=false` remembered |
| look Night / Morning, reload | `data-theme` follows and is remembered |
| phone reduces motion | Calm motion shows on, `data-calm` set; switching it off removes it |
| narrator off | no narrator line on the next level |
| solve level 1, Start over → Keep my stars | stars kept |
| Start over → Start over | 0 stars, level 1 opens, still 0 after reload |
| About | privacy text shown, back returns to settings |
| 320 × 568 | every control in the sheet ≥ 44 px tall |
| existing night-harbour test | now switches the look in Settings |
