# The Moin link — format v1

Normative for Moin Domi (`DOMI_ROADMAP.md` D0). `packages/domi-link` implements it and its tests
mirror it; a change here without a test there is a review **blocker**.

## 1. Where a Moin lives

Everything is in the URL **fragment** (after `#`), which browsers never send to a server.

```
https://<site>/<base>/domi/#m1.<data>                  an open Moin
https://<site>/<base>/domi/#m1l.<salt>.<iv>.<data>     a locked Moin
```

- `m1` — format major version 1. A reader refuses any other major version.
- `l` — locked (password).
- `<salt>`, `<iv>`, `<data>` — unpadded **base64url** (RFC 4648 §5: `A–Z a–z 0–9 - _`).

## 2. The payload

JSON, UTF-8, with short keys (they travel in every link):

| Key | Meaning | Rule |
|:--|:--|:--|
| `v` | payload version | `1` |
| `w` | the wave | `"moin"`, `"moinmoin"`, `"quay"` (wave from the quay), `"light"` (lighthouse blink) |
| `t` | a few words | optional; ≤ 80 characters (Unicode code points); no control characters |
| `h` | holders' names, in order, the sender first | 1–24 entries; each ≤ 24 code points; `""` = someone who kept it a mystery |
| `n` | how many people have held it, sender included | integer, `n ≥ len(h)`, `1 ≤ n ≤ 1 000 000` |
| `d` | the day it was sent | `YYYY-MM-DD`, the sender's local calendar day, a real date |
| `x` | how long until it fades | `"day"` (1), `"week"` (7), `"month"` (30 days) |
| `p` | may be passed on | `0` or `1` |
| `r` | shows how far it travelled | `0` or `1` |

Unknown keys are an error (a reader must not silently drop meaning). When more than 24 people
have held a Moin, `h` keeps the first 24 and `n` keeps counting.

**Who is reading:** whoever opens a Moin is holder number `n + 1` ("you're the 4th person" when
`n = 3`). Passing it on appends their name (or `""`) to `h` while `len(h) < 24`, and adds 1 to `n`.

## 3. Encoding

1. `payload` → JSON (no spaces) → UTF-8 bytes.
2. Compress with **DEFLATE raw** (RFC 1951; `CompressionStream('deflate-raw')`).
3. Open Moin: `data = base64url(compressed)`.
4. Locked Moin:
   - `salt` = 16 random bytes, `iv` = 12 random bytes, new for every link (also when passing on).
   - `key` = **PBKDF2**-HMAC-SHA-256 (password as UTF-8 after Unicode **NFC**, `salt`,
     **600 000** iterations) → 256-bit AES key.
   - `data` = **AES-256-GCM**(`key`, `iv`, plaintext = compressed bytes, additional data =
     ASCII `"m1l"`), ciphertext with its 16-byte tag appended.
5. The whole fragment (`#` included) is at most **8 000** characters; a reader refuses longer.
   A ten-hop Moin with full words and names must stay under **2 000** (the D0 gate).

Compressed bytes may differ between engines (each has its own DEFLATE); every reader must inflate
every writer's output. That is what the cross-engine test checks, not byte equality.

## 4. Reading — errors

A reader returns a Moin or exactly one of these, each with a message that names the problem:

| Code | When |
|:--|:--|
| `not-a-moin` | no `#m<digits>` prefix, or the wrong number of `.`-separated parts |
| `unsupported-version` | a major version other than 1 |
| `too-long` | fragment over 8 000 characters |
| `malformed` | bad base64url, wrong salt or IV length, data that does not inflate, not JSON |
| `locked` | a locked Moin read without a password (not a failure: ask for it) |
| `wrong-password` | AES-GCM authentication failed — a wrong password **or** a damaged link; the two cannot be told apart, and the message says so without hinting which |
| `invalid` | JSON that breaks a rule in §2 (the message names the field and the rule) |

Passing on a Moin whose `p` is `0` fails with `closed`.

## 5. Fading

A Moin fades after its `x` days, counted from `d`: it has faded when the reader's local day is
later than `d + days`. A faded Moin is not opened ("gone out with the tide"). This is honest
expiry, not deletion: a copy of the link still holds the bytes (`DOMI_ROADMAP.md` §2.3).

## 6. Known limits (said in the app, too)

- A locked link can be guessed offline; PBKDF2 slows guessing, it does not stop a weak password.
  The compose screen asks for three words or more.
- Anyone with the link — and, if locked, the password — can read it and pass it on.
