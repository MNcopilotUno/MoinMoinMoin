# Lessons — testing

- **Random boards must respect the board rules.** The 6 × 6 generator produced 17 people
  about one run in three, so `createGame` threw `BoardError` and the termination property failed
  for the wrong reason. Filter generated boards to 1–16 people; a flaky property test is a
  generator bug until proven otherwise.
- **Exit code 0 is not green**: quote the count. core: 54 tests at the first merge.
