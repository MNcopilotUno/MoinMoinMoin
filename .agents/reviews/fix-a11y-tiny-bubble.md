# Review — fix/a11y-tiny-bubble (adversarial)

CI on `b8ac020`: the axe audit failed on Firefox in one of the two runs of the same commit.

## Findings
1. **Flaky by construction**: a fixed 350 ms wait, while the tree's wave animates for over a
   second; axe measured a fading tile (contrast 1.27). *Fixed*: wait for `getAnimations()` to end.
2. **Real behind the flake**: tree tiles (56 px) and Home's mini memes printed *Moin* at ~4 px —
   unreadable to everyone. *Fixed*: below 90 px the red bubble is drawn without words.
3. Not a "re-run until green": the failure was read from the trace and both causes addressed.

## Evidence
Domi a11y spec `--repeat-each=3` on Chromium; flow specs 15/15; typecheck 0/0; lint clean.
