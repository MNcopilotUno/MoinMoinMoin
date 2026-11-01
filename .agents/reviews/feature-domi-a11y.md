# Review — feature/domi-a11y (adversarial)

## Findings
1. **Zero violations on the first run** is suspicious for a hand-built UI. *Checked*: a control
   test plants an unlabeled input and #222-on-black text; axe reports both. The screens were
   built against the style board's contrast table (every token ≥ 4.99 : 1 on black, footnotes
   6.2 : 1), which is why.
2. **My keyboard test failed first** — it read `textContent`, which includes the decorative
   meme's *Moin* bubble inside the *Start a chain* button. The accessible name is right
   (`aria-hidden` on the meme); the helper was wrong. *Fixed* to use the role locator.
3. **Not covered**: a real screen reader. The meme's `role="img"` label is long ("Meme: the grumpy
   captain, smiling, at the harbour, with a “Moin” bubble. “…”"); whether that is pleasant to
   hear on every tree node is for a VoiceOver session. Tree nodes are buttons with shorter labels.
4. New dev dependency `@axe-core/playwright` 4.10.2 (test-only, never shipped).

## Evidence
Domi e2e a11y: 3/3 on Chromium (full suite runs in CI on three browsers).
