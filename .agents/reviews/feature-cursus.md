# Review — feature/cursus (adversarial)

Scope: `services/cursus` — Node + SQLite relay, API v1, operator takedown; A6 proposal in
`MOIN_DOMI.md`; root `pnpm test` now includes `services/**`.

## Findings
1. **Crashed on start while every test passed** — a TypeScript parameter property is not
   strippable. *Fixed*; `erasableSyntaxOnly` added and `test/runtime.test.ts` loads the modules
   in real Node. Lesson in `technical.md`.
2. **Racing for the last branch.** If pending hops did not count, two people could both get the
   parent's wrap at branches 1 and both complete. *Fixed by design*: pending hops count toward
   branches and the 100-hop cap; the transaction is `BEGIN IMMEDIATE`. Test: a never-completed
   pending child blocks the branch until the sweep.
3. **A late completion** (after the ten minutes) used to be possible between the deadline and the
   next hourly sweep. *Fixed*: `completeHop` refuses a pending hop older than ten minutes itself.
4. **Expired but not yet swept** chains were readable for up to an hour. *Fixed*: every read
   checks `expiresDay`.
5. **`hopCount` is not stored** although §4 lists it. *Deliberate*: counted per request; recorded
   in `cursus.md`.
6. **No rate limit** — anyone can fill the disk. *Open gap*, must be closed before Cursus is
   public (`cursus.md` Risks).
7. **The relay returns the parent's `wrapTByKey` to anyone who adds a pending child.** That is §3
   as written — taking a turn is how you get `T` — and is the accepted D7 limitation. Not a bug.
8. **Error log** prints only the error message, never the request; the privacy test asserts no
   console call during a normal flow.
9. **Not deployed.** Hosting and the domain are open; nothing here is reachable from the live
   site. The S1 gate cannot be run.

## Evidence
`pnpm --filter @moin/cursus test`: 2 files, **23 tests** (end-to-end through the Tessera
client over real HTTP); `tsc` clean; eslint clean; smoke: `pnpm start` answered a create and a
read on loopback, `pnpm takedown` deleted the chain and exited 1 on the second try.
