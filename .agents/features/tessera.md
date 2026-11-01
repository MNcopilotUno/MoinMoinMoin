# Feature: Tessera — encrypted links (stage S0)

Spec: `docs/MOIN_DOMI.md` §3 (cryptography, a proposal to review here), D11, D15, A4, A5.
Password links (D12, D13) wait for the new design (A2) and are **not** in this package yet.

## Problem
Moin Domi passes a meme between people through a relay (Cursus) that must never be able to read
it. The link is the only thing a person holds: whoever has `…/m/<id>#<key>` can open hop `<id>`
and nothing else until they take their turn. Tessera is the shared, meme-agnostic module that
makes and opens those links.

## Design

### Keys
- Every key is a **128-bit secret** (A5) from `crypto.getRandomValues`, written as 22 base64url
  characters. AES keys are never stored or sent: each use derives its own non-extractable
  AES-GCM-256 key with **HKDF-SHA-256** (salt `tessera/v1`, info = the purpose).
- Purposes (domain separation, so one secret never encrypts two kinds of thing under one key):

| Secret | Purpose label | Encrypts |
|:--|:--|:--|
| `K_n` (hop) | `hop-content` | hop *n*'s content |
| `K_n` (hop) | `chain-key` | `T`, stored with hop *n* as `wrapTByKey` |
| `T` (chain) | `hop-key` | `K_n`, stored with hop *n* as `wrapKeyByT` |

### Sealed boxes
`seal(secret, purpose, bytes, aad)` → base64url of `0x01 ‖ nonce(12) ‖ AES-GCM(ciphertext ‖ tag)`.
The nonce is random for every seal (96 bits, as §3 says; at ≤ 100 hops a chain is nowhere near
the 2³² messages-per-key bound). `open` fails with one error, `TesseraError('locked')`, for a
wrong key, a wrong purpose, a changed byte, a truncated box, a wrong AAD or an unknown version:
an attacker learns nothing from which it was.

### Binding a box to its place (new — closes a gap in §3)
§3 lets the relay store each hop's ciphertext. Nothing stopped a dishonest relay from serving
hop *a*'s box as hop *b*, or re-parenting a hop to rewrite the tree's story. Every box now carries
its place as AES-GCM additional data: `tessera/v1|<chainId>|<parentId or ->|<depth>|<hopId>`.
A relay that moves a box, changes its parent or its depth makes it fail to open. This needs the
**client** to choose ids (chain and hop, 48 random bits → 8 base64url characters); the relay
rejects a duplicate id with 409 and the client retries with a new one.

### Link
`<base>m/<hopId>#<22-char secret>` — D11. With an 8-character id that is 33 characters after the
base (`m/` + 8 + `#` + 22), inside D11's 30–35. `parseLink` also accepts `<base>?m=<hopId>#…` (the static host's
redirect for a path it does not know) and reports `not-a-link`, `no-key`, `bad-key` or `bad-id`.

### Protocol (§3 with A4), all in `chain.ts`
1. **Start**: the creator makes `T`, `K_0`, chain id, hop id; uploads content sealed under
   `K_0`, `wrapKeyByT = Enc_T(K_0)` and `wrapTByKey = Enc_{K_0}(T)` in one request.
2. **Open**: `GET hop` → depth, limits, content box (never its `wrapTByKey`). Open with `K_n`.
3. **Turn**: choose hop id `c`, `K_c`; upload the content box → the relay stores it *pending*
   and only then returns hop *n*'s `wrapTByKey`; open `T`; upload `Enc_T(K_c)` and
   `Enc_{K_c}(T)` → the hop is complete and its link may be shown (A4).
4. **Tree**: `GET tree` → every complete hop with `wrapKeyByT` and content; with `T` each opens.
   A box that fails to open is shown as *unreadable*, never as an error for the whole tree.

## Threat model

| Who | Can | Cannot |
|:--|:--|:--|
| The relay (or whoever steals its database) | see the tree's shape, depths, box sizes, the day of each hop, ids; delete or withhold hops; refuse service | read any content, caption or nickname; read `T`; move or re-parent a box undetected (AAD); forge a hop that opens (no keys) |
| Someone who sees a link (forwarded, shoulder-surfed) | open that hop; take a turn and so open the tree | open other hops without a turn — accepted, D7 is a game rule (§3) |
| A network observer (TLS) | see that a device talks to the relay, and when | read anything |
| A modified client | break the word and touch budgets (client-enforced, §3) | exceed stops, branches or 100 hops (relay-enforced) |
| The browser's history / sync | stores the full link, key included | — **risk**: a synced history holds keys. Mitigation: the app replaces the URL (`history.replaceState`) without the fragment once the key is in memory and saved locally. |
| A referrer | — fragments are never sent in `Referer`; the app also sets `referrer-policy: no-referrer` | |

Not protected: metadata (who talks to the relay, from which IP at the network level); a device
that is unlocked in someone else's hands (saved keys in IndexedDB); a weak link secret is not a
risk (128 random bits). Password links and offline guessing: A2.

## Argon2id vs PBKDF2 (S0 asks to settle)
**Settled as: no KDF ships until A2.** Today's links have no password, so no KDF is needed.
For A2: WebCrypto offers PBKDF2 natively (and HKDF), not Argon2 *(checked: the WebCrypto
`deriveKey` algorithms are ECDH, X25519, HKDF and PBKDF2)*. Argon2id is memory-hard and is the
better choice against offline guessing of a leaked `locks` table; it needs a WebAssembly build
(~30 KB). Recommendation for A2: Argon2id (m = 64 MiB, t = 3, p = 1) via WebAssembly, with
PBKDF2-SHA-256 at 600 000 iterations only as a stated fallback if the WASM cost is refused.

## Risks
- **Client-chosen ids** let a client squat on ids; harmless (an id is not a secret), and 48 bits
  make accidental collisions negligible at this scale (birthday bound ≈ 16 million hops).
- **Crypto in a web page** trusts whoever serves the page: a hostile host can ship a page that
  leaks keys. Mitigation: the app is served from the same static site as the puzzle, not by the
  relay; the relay never serves code.
- **Random nonces under one key**: each `K_n` seals one content box and one wrap; `T` seals ≤ 100
  wraps. Far below any GCM bound.

## Test matrix (`packages/tessera/test`)

| Area | Happy day | Bad weather |
|:--|:--|:--|
| base64url | round trip of 0–64 bytes | wrong length, `+`/`/`/`=`, non-canonical last character |
| seal/open | round trip; two seals of one text differ | wrong key, wrong purpose, one changed byte, truncated, wrong AAD, version 2 — all `locked` |
| link | format → parse round trip; `?m=` form | no `#`, empty key, 21/23 characters, bad id, not a link |
| protocol | start → open → turn → tree opens every hop | turn needs the pending step before `T`; tree with a wrong `T` is all unreadable; relay swaps two boxes → both unreadable; relay changes a parent → unreadable |
