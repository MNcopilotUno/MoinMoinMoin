# Review — fix/e2e-rate-limit (adversarial)

CI on `dcfc439` failed: 6 Domi e2e tests in Firefox and WebKit.

## Findings
1. **Cause: the relay's own rate limit**, added an hour earlier in `feature/cursus-hardening`.
   All three browser projects share one test relay from 127.0.0.1; from the 11th chain every
   create got 429. Two WebKit flow tests and Firefox's offline flush failed with symptoms far from
   the cause. My earlier claim that hardening was done was made on a Chromium-only run.
   *Fixed*: `CURSUS_RATE_SCALE` (default 1, tested) and the e2e relay runs at 100.
2. **WebKit cannot navigate while Playwright is offline**, worker or not — a harness limit, not
   the app. The Domi offline suite now ignores WebKit by config with the reason written next to
   it; Chromium and Firefox still run it. *Not a skipped test to get green*: the same three tests
   failed on WebKit with "internal error" before any app code ran. Real Safari offline is a manual
   check (HANDOVER).
3. **A production knob that weakens a protection**: anyone setting `CURSUS_RATE_SCALE` on a real
   relay loosens it. Documented as "leave at 1" in the deploy README; non-numbers and ≤ 0 fall back
   to 1.

## Evidence
cursus 32 tests; Domi e2e `--repeat-each=3` on Chromium: 36/36 against one relay (the CI load);
lint and `tsc` clean. CI with Firefox and WebKit: see the run after this push.
