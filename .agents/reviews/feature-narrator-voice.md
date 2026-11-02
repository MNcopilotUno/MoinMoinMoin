# Review — feature/narrator-voice (adversarial)

Scope: ROADMAP Phase 2's last item, the narrator's voice, built opt-in after the owner waived the
playtest (`.agents/features/narrator-voice.md`).

## Findings
1. **"If the text version earned it" was never answered** — the playtest was waived. *Mitigated*:
   off by default; nobody hears it who did not switch it on.
2. **Cloud voices** (Chrome's "Google UK English", Edge's online voices) would send each line to a
   server. *Excluded*: only `localService` voices; a phone with none gets a disabled switch with
   the reason. Tested with a stub that offers a cloud en-GB voice first.
3. **The effect re-spoke the line when the volume moved** (it read `volume`, `muted`…). *Fixed*
   before the first run: only a new line (`lineKey`) triggers speech; the rest is `untrack`ed.
4. **Speech before a gesture**: browsers refuse it, and CLAUDE.md §8 forbids audio on load. The
   first line of a cold open is never spoken; speech starts with the first tap's next line.
5. **Mute must cover speech too** — a muted player hearing a voice would be the worst surprise.
   Tested for a muted game; muting mid-line cancels the line in code (an effect on `muted`), not
   covered by a test.
6. **Not testable here**: real voices (headless browsers have none — speech is stubbed in the
   page), and iOS's silent switch *(predicted)*.
7. Settings rows now support `disabled`; the 44 px check on the sheet still passes (full suite).

## Evidence
Puzzle e2e: 4 new voice tests (stubbed speech) and the full suite on Chromium; typecheck 0/0.
