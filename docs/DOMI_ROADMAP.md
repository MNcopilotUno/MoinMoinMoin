# Moin Domi — roadmap

> **Status: approved by the owner on 2026-10-30, "as proposed"** — every decision in §5 takes
> its proposal. D0 started the same day. Written from the owner's direction (2026-10-24,
> `ROADMAP.md` Phase 3) and the Domi screens on the design canvas
> (<https://claude.ai/artifact/EbSkyzcZ7eJpSconQFaAzL>, row "Moin Domi").
> Companion to `CLAUDE.md` (which governs the repository) and `ROADMAP.md` (Phases 0–4).

---

## 0. What Moin Domi is

A real *Moin*, passed between real people by a link. You send a **wave** — a small, private
moment: which wave, a few words, maybe your first name. Whoever opens it sees the *Moin* arrive
over the painted harbour, smiles, and can **pass it on**. The link counts how far it has
travelled. It can be **locked with a password**, so only the people you tell can open it.

**What it is not** — the same promises as the puzzle (CLAUDE.md §1): no accounts, no analytics,
no cookies, no ads, no third-party origin, no feed, no followers, no profile. A Moin is a link,
not a post.

## 1. The one design question: where does a Moin live?

The owner asked for two things that pull in different directions:

| Wish | Works with no server (the link carries everything, in the `#fragment`) | Needs a small server |
|:--|:--|:--|
| A wave, a few words, a name | ✅ | |
| Password lock, hello encrypted | ✅ encrypted on the phone; the key never leaves it | |
| "You're the 4th person" (reach, as the receiver sees it) | ✅ the hop count travels in the link | |
| Tiny links (`…/domi/k7f2`) and custom links (`…/domi/anna`) | | ✅ something must map the short name to the Moin |
| Reach **the sender** can watch grow | | ✅ hops must report back somewhere |
| Real expiry ("gone with the tide") and recall | ⚠ only politely (the app refuses old links; a copied link still holds the bytes) | ✅ the server deletes it |

**Proposal: build it in two tiers.** First the **server-free Moin** (everything in the left
column) — private by construction, costs nothing to run, and answers the real question: *does a
Moin travel?* Only if it does, add the **harbour office**: a tiny optional server that stores
**ciphertext only** for tiny/custom links, sender-visible reach and real expiry. The link format
is designed from day one so both tiers read the same Moin.

## 2. Principles (new, Domi-specific)

1. **Zero knowledge.** Whatever leaves the phone is encrypted, or is the `#fragment` (which
   browsers never send to a server). The harbour office, if built, sees ciphertext, a size and a
   counter — never words, names or the password.
2. **The password is never in the link.** The share sheet says so and offers to copy it
   separately. Nobody can reset it — not even us.
3. **Honest expiry.** Server-free links *fade*: after their time the app shows "gone out with the
   tide" and will not open them. The copy says it is a promise between friends, not a lock.
   Real deletion only comes with the harbour office.
4. **Small links.** A Moin with ten hops stays under 2 000 characters, so every chat app and
   every QR code carries it.
5. **Same look, same sound.** The painted harbour, the gouache faces, the red Moin bubble and
   the synthesised *Moin* come from the shared packages. Red still means Moin.
6. **Pure core, again.** Encoding, encryption wrappers and validation live in a pure package
   with tests on Chromium, Firefox and WebKit; the app animates and decides nothing.

## 3. The Moin, technically (to be specified in `docs/DOMI_FORMAT.md`)

- **Payload** (version 1): wave kind, words (≤ 80 chars), sender name (optional, ≤ 24), hops
  (names or "someone", ≤ 24 hops kept, then only the count), created day, fade time, options
  (pass-on allowed, show reach).
- **Encoding**: JSON → `deflate-raw` (`CompressionStream`) → base64url → `#m1.<data>`.
- **Lock**: AES-GCM 256 via WebCrypto; key from the password with PBKDF2-SHA-256, 600 000
  iterations, 16-byte salt, 12-byte IV, all in the link → `#m1l.<salt>.<iv>.<ciphertext>`.
  Wrong password = authentication failure = one calm message, no hints.
- **Pass it on**: the receiver's app adds their hop and re-encrypts with the same password (they
  had to know it to open the Moin), producing a new link. Unlocked Moins pass on unlocked.
- **Known limit, said plainly**: a locked link can be guessed offline, so the compose screen
  asks for three words or more and shows a strength hint. PBKDF2 slows guessing; it doesn't
  stop a weak password.

## 4. Phases and gates

### D0 — Format and foundations · ~1 week — **built 2026-10-30**
- `docs/DOMI_FORMAT.md` (the normative format, like `GAME_RULES.md`) and an analysis in
  `.agents/features/domi-format.md`.
- `packages/domi-link`: encode, decode, lock, unlock, add a hop — pure, typed, tested.
- **Negative fixtures**, each failing with a message naming the problem: unknown version,
  tampered ciphertext, wrong password, too long, too many words, malformed base64, a hop list
  that doesn't match its count.
- `apps/moin-domi` scaffold on the same stack (Svelte 5, Vite), deployed beside the puzzle at
  `/MoinMoinMoin/domi/` by the same workflow.

**Gate:** a locked ten-hop Moin made on Chromium opens on Firefox and WebKit, stays under 2 000
characters, and every fixture fails with its message.

### D1 — Send and receive, server-free · ~2 weeks
The canvas screens, built:
- Compose: the four waves, a few words, from, lock, pass-on, reach, fade time.
- Your link is ready: share sheet, copy link, copy password separately.
- Sealed Moin: the password screen; wrong password, calm.
- The Moin arrives: the flight over the painted harbour, "Moin from Anna", the words, "you're
  the 4th", *Pass it on*, *Keep it* (saved on this phone, IndexedDB, like puzzle progress).
- Gone out with the tide.

Plus: works offline once loaded (making and opening Moins needs no network at all); e2e on the
built app; accessible like the puzzle (labels, ≥ 44 px, calm motion).

**Gate (ROADMAP Phase 3):** a Moin travels through **at least five real people** without you
explaining how. Measured server-free: the fifth person's screen says "you're the 5th" —
ask them for a screenshot.

### D2 — The harbour office (optional) · ~1–2 weeks
Only if D1's gate passed **and** the owner still wants tiny links, custom links, sender-visible
reach or real expiry.
- A minimal service: `PUT` ciphertext → short id (or a custom name, first come), `GET` by id,
  `POST` a hop count, `DELETE` with a sender token kept on the sender's phone. Stores ciphertext,
  size, hop count, expiry. No IPs in logs; no cookies; CORS only for the Domi origin.
- The app tries the server and **falls back to a `#fragment` link** when it is unreachable.
- Abuse: rate limits per id; custom names from a short allow-list of characters; no content
  moderation is possible on ciphertext — so links cannot be listed or searched, ever.

**Gate:** a week of real use; the stored data is ciphertext and counters only (checked by
reading the store); a deleted Moin is gone; the puzzle still makes no network call.

### D3 — The bridge (ROADMAP Phase 4) · ~1 week
"Pass a real Moin" on the puzzle's win card opens Domi with the wave pre-filled. Disabled with a
reason offline (the canvas has that screen), and **no network call from the puzzle until it is
pressed**.

## 5. Decisions (approved as proposed, 2026-10-30)

| # | Question | Proposal |
|:--|:--|:--|
| 1 | Approve the two-tier plan (server-free first, harbour office only after the D1 gate)? | Yes |
| 2 | **▶ Owner** The four waves: *Moin*, *Moin moin*, *wave from the quay*, *lighthouse blink*? | As on the canvas |
| 3 | **▶ Owner** If D2 happens: where does the harbour office run? | Your Gitea host (`marek-novak.cz`) or a small edge function; must allow logs without IPs |
| 4 | **▶ Owner** Fade times: a day, a week, never? ("Never" can't be enforced server-free.) | Day, week, month |
| 5 | **▶ Owner** Words: 80 characters? Names: first names only, 24 characters? | Yes |
| 6 | **▶ Owner** Password minimum: three words (passphrase) or 10 characters? | Three words, with a hint |
| 7 | **▶ Owner** The *Moin* sound — your recorded voice, or the synthesised one? (`ROADMAP.md` open question) | Synthesised for D1; record later |
| 8 | **▶ Owner** URL: `/MoinMoinMoin/domi/` now, own domain later? | Yes |

## 6. Risks

- **Weak passwords** make locked links guessable offline (§3). Mitigated, not solved.
- **Links get long** with many hops — capped at 24 named hops, then a count.
- **"Private" is relative**: anyone with link *and* password can read it and pass it on. The copy
  never promises more than that.
- **Scope creep** (CLAUDE.md §8): replies, threads, profiles, a feed of Moins — each would turn a
  link into a platform. Out of scope for every phase here.
- **The harbour office is a service to run.** If nobody wants to run it, D1 is a complete product.
