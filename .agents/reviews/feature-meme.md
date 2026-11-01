# Review — feature/meme (adversarial)

Scope: `packages/meme` — the meme value, strict validation, the turn rules.

## Findings
1. **Decrypted hops are hostile input** — any chain member can post any bytes under a valid key.
   `toMeme` rejects unknown fields (no smuggled `url`), unknown versions, out-of-list values,
   over-long or untidy text and control characters; `decodeMeme` uses fatal UTF-8. Tested.
2. **Bubble colour is not a touch.** D4 lists "the colour of the Moin bubble"; the project rule is
   red means Moin. The schema has no colour at all, so a recoloured bubble cannot even be
   expressed. *Conservative answer to the open D4 question; the owner can still overrule.*
3. **"Words changed" was ambiguous**: is "When the old captain" one change or a different shape?
   *Decided*: words are swapped in place; a changed word count is `shape`, refused. Recorded as a
   risk to revisit after a playtest.
4. **Mood is a new touch** not on the design canvas. *Kept* (D4: "and similar"); the app shows it
   as a third touch chip.
5. **Emoji length**: 140 is counted in code points, not UTF-16 units; a test pins it.
6. **Review written after the merge** — the branch was merged before this file existed. *Process
   slip*, noted in `process.md`'s spirit; the content was reviewed before the merge, the file is
   late.

## Evidence
`pnpm --filter @moin/meme test`: 2 files, **29 tests**; `tsc` and eslint clean.
