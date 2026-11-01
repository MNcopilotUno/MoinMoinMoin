# Proposal: password and custom links (A2, for stage S3)

**Status (2026-11-01): decided and built.** The owner accepted the defaults below (MOIN_DOMI.md
A7); the **[decide]** marks are answered as written.

**Originally: a proposal for the owner, not a decision.** Amendment A2 says the password-link and
lockout design is "done completely new" and that nothing in `MOIN_DOMI.md` binds it. This file
is one candidate, written so S3 can start the day the owner says yes, no, or "like this, but…".
Every choice the owner should make is marked **[decide]**.

## What it is for
- **D12 — a password link** `…/m/<id>` with no key: for a link that may be forwarded, read
  aloud, or posted somewhere a stranger could see it.
- **D13 — a custom link** `…/m/kapitaen-hein`: a name you choose, **always with a password**
  (a chosen name is guessable).

## Goals (and what is not a goal)
1. The relay can still read nothing. A stolen relay database must not open a chain without
   guessing the password — and guessing must be expensive.
2. Someone online who knows the name can guess only a few times a day.
3. A stranger must not be able to lock the real recipient out for good.
4. A non-technical person opens it on the first try (the S3 gate).
- *Not a goal*: protecting a chain whose password was shared in the same message as its link.

## Design (candidate)

### Deriving keys from the password
- The creator picks a password (or takes a suggested one, below). The client makes a 16-byte
  salt and runs **Argon2id** (`m = 19 MiB, t = 2, p = 1` — OWASP's minimum; **[decide]** whether to
  go heavier, e.g. 46 MiB, t = 1) over the password, giving 64 bytes, split into:
  - `authKey` (32 bytes) — proves the password to the relay;
  - `wrapKey` (32 bytes) — never leaves the phone; seals the hop's ordinary secret `K_n`.
- Argon2id runs in WebAssembly (`hash-wasm`, MIT, about 30 KB, loaded only when a password link is
  made or opened). WebCrypto alone has PBKDF2 but not Argon2 (tessera.md).

### What the relay stores (the `locks` table, A3)
| Column | Meaning |
|:--|:--|
| `name` | the custom slug, or a random 8-character id for a plain password link |
| `hopId` | the hop it opens |
| `salt`, `kdf` | for the client to repeat the derivation |
| `verifier` | `SHA-256(authKey)` — the relay checks a password without learning it |
| `wrapped` | `K_n` sealed with `wrapKey`, AAD `tessera/v1|lock|<name>|<hopId>` |
| `failures`, `waitUntil` | the slowdown below |
| `expiresDay` | the chain's; the slug is freed when the chain goes (D13) |

### Opening
1. `GET /v1/locks/<name>` → `{ salt, kdf }` only — never `wrapped`, never `verifier`.
2. The phone derives `authKey`, `wrapKey`; `POST /v1/locks/<name>/open { authKey }`.
3. The relay compares `SHA-256(authKey)` with `verifier` in constant time. Right → `{ hopId,
   wrapped }`, `failures` reset. Wrong → `failures + 1`, and the slowdown applies.
4. The phone opens `wrapped` with `wrapKey`, then the hop as today (`openHop`).

### Lockout, designed anew: a slowdown, not a lock **[decide]**
- The first **5** wrong passwords cost nothing. After that each further try must wait
  **2^(failures − 5) minutes**, capped at **24 hours**: 1, 2, 4, … minutes. A right password
  resets it. The Unlock screen says *"Too many tries — you can try again at 14:32."*
- Why not a hard lock after N tries: anyone who knows the name could lock the real recipient out
  for good (goal 3). A slowdown limits a stranger to roughly 20 guesses on the first day and about
  one a day after that, while the real person waits minutes at worst.
- The per-address rate limits (cursus.md) still apply on top.

### Password strength (D12: "minimum strength is enforced")
- Accept a password of **≥ 3 words or ≥ 12 characters** that is not on a list of the 10 000 most
  common; reject with a reason, never silently. **[decide]** the threshold.
- **Offer one**: *Use "Möwe-Teer-Nebel-Kutter"* — four words from a list of 2 048 northern words
  (44 bits). Most people should take it; it reads well aloud.

### Custom names (D13)
- 3–32 characters, `a-z 0-9 -`, starting with a letter; umlauts folded (`kapitän` → `kapitaen`);
  unique while the chain lives; a short reserved list (`health`, `admin`, `m`, `v1`…). The relay
  sees the name in clear — already accepted in §3.

### What an attacker gets
| Who | Gets | Cost to open a chain |
|:--|:--|:--|
| Someone online with the name | 5 free guesses, then one every few minutes, then hours | a suggested 4-word password: never |
| A thief with the relay's database | `salt`, `verifier`, `wrapped` | Argon2id per guess (19 MiB each): a 44-bit passphrase is out of reach; a weak 6-letter password falls in hours — hence the strength rule |
| The relay operator | the same as the thief | the same |

## Screens
The canvas already has *A locked link* (Unlock): the password field, show/hide, the wrong-password
line. Add: the wait message; and in *How it travels*, the password field with the suggested
passphrase and the strength reason. *With a password* and *A name you choose* lose their
*Later* tags.

## Tests (S3)
| Happy day | Bad weather |
|:--|:--|
| make a password link and a custom link; open both with the password; suggested passphrase accepted | wrong password counts; 6th try waits 1 min, 7th 2 min; right password resets; `GET` never returns `wrapped` or `verifier`; a DB scan finds no password; weak password refused with its reason; slug taken → 409; slug freed when the chain expires; a stolen DB row cannot be opened with a wrong password (offline check) |

## As built (differences from the text above)
- Argon2id gives **48** bytes, not 64: `authKey` 32 + `wrapKey` 16 (Tessera secrets are 128-bit, A5).
- The suggested passphrase is **five** words from **256** (40 bits), not four from 2 048: a list of
  256 original northern words fits in the app; five of them give the same order of strength.
- The relay refuses a key derivation outside `m` 8–64 MiB, `t` 1–10, `p` 1–4 — a lock made to
  freeze the recipient's phone is refused on both sides.
- Password and custom links are chosen when a chain (or postcard) is **made**, and — since
  `feature/domi-gaps` — any link you hand on can be locked from *Ready* (*Send it with a password
  instead*), after a turn too.
- The page's CSP gains `'wasm-unsafe-eval'` (WebAssembly compile only, no JavaScript eval) for
  Argon2id.
- Ready shows the password **once**, with *Copy password*; it is never stored on the phone. It
  sits in the outbox (IndexedDB) only while a chain made offline waits to be sent.

## Questions for the owner
1. Slowdown (as above) or a hard lock after N tries?
2. Argon2id at OWASP's minimum (19 MiB) or heavier — and is a ~30 KB WebAssembly download, only
   for password links, acceptable?
3. Strength rule: ≥ 3 words / ≥ 12 characters, or something else?
4. Offer a generated four-word passphrase by default?

Source for the Argon2id minimum: OWASP Password Storage Cheat Sheet,
<https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html> (read 2026-11-01).
