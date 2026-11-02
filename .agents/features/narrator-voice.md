# Feature: the narrator's voice (ROADMAP Phase 2, last item)

## Problem
Phase 2 lists "voice for the narrator if the text version earned it". The playtest that would
say whether it earned it was waived by the owner (2026-11-02: "continue roadmap without the
playtest"). So the voice ships, but **opt-in**: nobody hears it who did not ask for it.

## Design
- **Settings → Play → "Read it aloud"** (off by default), under *Narrator*. Disabled, with the
  reason, when the narrator is off or the phone has no on-device voice.
- **On-device voices only** (`SpeechSynthesisVoice.localService`), preferring British English —
  the lines are English. A cloud voice would send every line to a third party (CLAUDE.md §1: no
  third-party origin); Domi's finale follows the same rule (D9).
- **Never in the way** (CLAUDE.md §1, §8): only after the first tap (browsers block speech before
  a gesture anyway); silent when sound is muted; a new line cancels the old one; tapping a line
  away stops it; volume follows the master volume. Rate 0.95, pitch 0.9: dry, unhurried.
- Not an *original asset*: the voice is the phone's own, nothing is recorded or shipped. A recorded
  narrator stays possible later (ROADMAP open question).
- Setting stored with the others in IndexedDB (`voice`).

## Risks
- Voices differ between phones (and some have none) — the same line sounds different on two
  devices. Accepted: it is narration, not gameplay; determinism is untouched.
- iOS may route speech through the silent switch differently from Web Audio *(predicted, check on
  a real iPhone, as for the Moin sound)*.

## Test matrix (`apps/moin-moin-moin/e2e/voice.spec.ts`, speech stubbed in the page)
| Happy day | Bad weather |
|:--|:--|
| switch on → after a tap, the next line is spoken with an on-device English voice; tapping the line away cancels it | off by default: nothing spoken; muted: nothing spoken; no on-device voice (only a cloud one): the switch is disabled and says why; narrator off: disabled |
