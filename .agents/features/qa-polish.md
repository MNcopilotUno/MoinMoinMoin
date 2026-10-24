# Feature: QA pass — function, accessibility and feel ("ASMR")

## Problem
The owner asked for a QA check producing points to check, then to make it better. Two independent
QA agents reviewed the built app at `bb8e7ae`: one functional/accessibility/robustness, one on
game feel and sound (measured: frame sequences, CPU-throttled frame times, offline audio renders
with loudness in LUFS). Reports: `.agents/reviews/qa-polish.md`.

## Design (what changed)
- **Win moment:** the wave, haptic and bells happen at the last smile; the card follows 600 ms
  later as a fixed bottom sheet that never scrolls or moves the board; the narrator's line moves
  into the card; the crowd hops three times, not forever.
- **Sound:** formant Q 9 → 5 and a per-note trim: every note of the chain tune now measures
  −24.0 LUFS (was an 11 LU swing). Master bus + compressor; horn 0.22 → 0.10, squawk 0.25 → 0.6.
  New cues: captain's grudging "Mo-", fender tok (lower per bounce), gull theft squawk, win bells
  (one per star), undo glide. All of a tap's sounds are scheduled on the audio clock at tap time,
  shortened to fit fast chains, and faded out on skip/undo. AudioContext created on the first
  `pointerdown` (first-tap latency). Haptics on Android, quiet when muted.
- **Motion:** squash-and-stretch smile pop with a warm glow; captain harrumph + pip pop; red ring
  on whoever a Moin reaches; bubble pops in, shrinks into its target, arcs a little on level
  flights, tail trails the direction; fender rises above the bubble and thuds; the gull hops with
  a visible mini Moin; pressed state held ≥ 90 ms; a smiling person wiggles on an ignored tap;
  long chains speed up gently from the 4th Moin (UI only, capped at 1.4×); board fades in.
- **Function/a11y:** solve saved at the solving tap (blocker: a double tap lost it); chatterbox
  greetings counted double on screen; update toast at the bottom and dismissable; fleeing gulls
  stop catching taps; level menu modal (`inert` page, Tab cycles, focus returns), win card never
  steals the menu's focus; person buttons ≥ 44 px on 320 px phones; night banners use nocturnes;
  focus moves to the new title on level change; repeated announcements still spoken; late
  IndexedDB progress merged; daily rolls over at midnight; decorations after the board in tab
  order; intros that contradicted their boards fixed (and now tested against every board).

## Test matrix (new)
| Case | Expected |
|:--|:--|
| double tap on the solving person, reload | next level opens (solve saved) |
| chatterbox into a captain | captain drawn smiling on arrival (`greeted` adds `amount`) |
| menu: 45 Tabs, Escape | focus stays in the dialog; then returns to Levels |
| 320 × 568, ferry-10 | every person button ≥ 44 px |
| night menu | banners use the night paintings |
| every intro vs its board | a line that mentions gulls/fenders/chatterboxes has them |
| accelerando | rate 1 → 1.4 from the 4th Moin; `tickAt(msAt(t)) = t` |
| loudness per tune note | −24.0 LUFS each (measured with the QA agent's script) |
| win at 375 × 667 | board top unchanged, no scroll |
