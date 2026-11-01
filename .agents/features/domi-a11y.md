# Feature: Moin Domi accessibility audit

## Problem
CLAUDE.md §7 asks for accessibility from the first commit. Domi had role and label checks in its
flow tests and a 44 px tap-target check, but nothing that looked at every screen for contrast,
names, landmarks and ARIA misuse.

## Design
- `e2e/a11y.spec.ts` drives every screen state — home (empty and with something waiting),
  create, rules (chain and postcard), link ready, turn (and while picking a word), finale, tree,
  postcard, yours, settings (and its confirm), about, gone — and runs **axe-core** with the WCAG
  2.0/2.1/2.2 A and AA rules in the real browser. Any violation fails, listed by screen.
- **A control test** plants an unlabeled field and dim text on black and requires axe to report
  both — so a clean result means "checked", not "the checker was asleep".
- **Keyboard**: Tab reaches the first choice within three stops (only Settings before it), Enter
  opens the next screen with focus on its heading, and the focused control has a visible outline.

## Risks
- axe covers maybe a third of WCAG; reading order, meaning of labels and the screen-reader
  experience still need a person with VoiceOver/TalkBack. *(predicted gap)*
- Animations: the audit waits 350 ms for the rise animation; a slower animation would make
  contrast readings flaky.

## Test matrix
| Happy day | Bad weather |
|:--|:--|
| 15 screen states, zero violations; keyboard path to the first choice and into Create | planted violations are reported (the audit is awake) |
