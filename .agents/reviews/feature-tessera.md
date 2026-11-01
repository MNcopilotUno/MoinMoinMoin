# Review — feature/tessera (adversarial)

Scope: `packages/tessera` (keys, HKDF, sealed boxes with place-binding AAD, link codec, Cursus
client, chain protocol), the threat model `.agents/features/tessera.md`, the DSA answer
`.agents/features/dsa.md`. Spec: `docs/MOIN_DOMI.md` §3, D11, D15, A4, A5.

## Findings
1. **§3 let the relay move boxes.** Nothing bound a hop's ciphertext to its id, parent or depth:
   a relay could serve hop *a*'s meme as hop *b*, or re-parent hops to tell a different story.
   *Fixed in the design*: every box carries `tessera/v1|chain|parent|depth|hop` as AES-GCM
   additional data; tests swap boxes and re-parent a hop — both unreadable. Consequence: ids are
   chosen by the client (48 bits), the relay answers 409 on a duplicate, the client retries.
2. **Link length miscounted.** The doc said 34 characters after the base; the test measured 33
   (`m/` is two characters, not three). *Fixed* in the doc; still inside D11's 30–35.
3. **The first retry test asserted nothing useful** (it threw a plain `Error`, so it tested that
   non-Tessera errors are not retried, under a name claiming the opposite). *Rewritten*: one
   conflict → a second, different id succeeds; endless conflicts → gives up with `conflict`.
4. **One key for two jobs.** §3 uses `K_n` both to open hop *n* and to wrap `T`. *Fixed*: HKDF
   purpose labels (`hop-content`, `chain-key`, `hop-key`); a test opens a box with the right
   secret and the wrong purpose — locked.
5. **Relay JSON is trusted for shape** (`httpRelay` casts). A hostile relay sending numbers where
   strings belong ends in `open` failing as `locked` (decode is inside its `try`), not a crash of
   the tree — `readTree` catches per hop. *Accepted*; the app validates decrypted content
   separately (`packages/meme`).
6. **Keys in browser history** (the full link is a history entry and may sync). Not Tessera's to
   fix: the app must `replaceState` the fragment away once the key is saved. *Carried to the
   app's feature doc.*
7. **A half-finished turn** (pending stored, then offline before `completeHop`) leaves a pending
   hop the relay deletes after minutes (A4); the person retries with a fresh id and key.
   *Accepted*; the app must say "will send when online" (§6 Offline).
8. **No password KDF.** S0 asked to settle Argon2id vs PBKDF2: settled as *none until A2*, with a
   recommendation recorded. Not a gap in this branch.

## Evidence
`pnpm --filter @moin/tessera test`: 4 files, **38 tests** pass; `tsc -p packages/tessera` clean;
eslint clean. DSA sources read on 2026-11-01 (EUR-Lex refused automated access; an
article-by-article mirror was used and is named in `dsa.md`).
