# Lessons — testing

- **Random boards must respect the board rules.** The 6 × 6 generator produced 17 people
  about one run in three, so `createGame` threw `BoardError` and the termination property failed
  for the wrong reason. Filter generated boards to 1–16 people; a flaky property test is a
  generator bug until proven otherwise.
- **Exit code 0 is not green**: quote the count. core: 54 tests at the first merge.
- **Ambient animation never settles**, so Playwright's "stable" check times out on swaying
  buttons. Run those tests with reduced motion — which also proves the harbour stays playable
  without motion (it found gulls covering each other).
- **Run the e2e suite on its own.** Started alongside vitest it failed to load specs (*predicted*
  cause: the two runs contending for the same transform cache); alone it passed. Confirm or strike.
