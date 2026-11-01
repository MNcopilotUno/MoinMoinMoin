# Review — feature/s3-locks (adversarial)

Scope: S3 on the A2 candidate design — Tessera locks (Argon2id, auth/wrap split, AAD-bound wrap,
names, strength), Cursus `locks` table and endpoints with the slowdown, the app's link choices,
passphrase, Ready with the password, the Unlock screen.

## Findings
1. **Built before the owner chose.** The proposal's four questions are unanswered; the owner said
   "continue" twice. Every open choice is one parameter; the doc says so at the top. *Flagged.*
2. **CSP blocked WebAssembly** — the lock failed and the chain silently became a key link with a
   vague message. *Fixed* (`'wasm-unsafe-eval'`); the fallback message stays, because a chain
   made is better than a chain lost; lesson in `technical.md`.
3. **8-character names look like ids.** `Kapitaen` passed the custom-name check because random
   lock ids are 8 mixed-case characters. *Fixed*: custom names have their own stricter rule
   (lowercase, letter first, single hyphens, not reserved); ids are only made by the app.
4. **429 meant two things** (rate limit, password wait). The client now reads the body's `error`;
   a test makes a rate-limited open come back as `slow-down`, not as a wait.
5. **A hostile lock could freeze phones** with a 1 GiB Argon2 setting. Refused by the relay
   (422) and by the client before deriving.
6. **The password could be forgotten at once**: the suggested passphrase vanished after Ready.
   *Fixed*: shown once there with *Copy password*.
7. **Constant-time compare** of `SHA-256(authKey)`; the relay never sees the password, and a DB
   scan in the tests finds no part of it.
8. **The slowdown is per lock, shared by everyone**: a stranger with the name can make the real
   recipient wait — minutes, not forever (the design's point). Per-address limits stack on top.
9. **Name squatting**: anyone can take a name pointing at their own hop; names free when the
   chain expires (tested). Accepted at this scale.
10. **Gaps**: no password on later hops; the S3 gate (a non-technical person, first try) not run;
    `hash-wasm` adds ~30 KB, loaded with the app (not lazily yet).

## Evidence
tessera **55**, cursus **37** (locks over HTTP, slowdown, privacy scan, expiry, takedown by name,
429 disambiguation); Domi e2e **25/25** on Chromium (4 lock tests incl. axe on Unlock);
typecheck 0/0; screens checked by screenshot.
