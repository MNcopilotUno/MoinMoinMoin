# Moin Domi — specification and roadmap

Companion to [`CLAUDE.md`](../CLAUDE.md) and [`ROADMAP.md`](ROADMAP.md). This file replaces
ROADMAP Phase 3 and is the single source for Moin Domi until its own phases begin.

Every decision is numbered (**D1…**) so it can be corrected by number. Anything marked
*(proposal)* is my design, not yet agreed; anything marked *(verify)* is a factual claim to check
before the phase that depends on it. Phases are stages **S0–S4** (§7), so a number never means two
things.

## Amendments (owner, 2026-10-31)

Agreed after a review of this file; each overrides the text it names.

- **A1 — Stages, not D-phases.** The roadmap's phases are S0–S4; D1–D16 stay the decisions.
- **A2 — Password and lockout: designed anew.** §3's lockout sentence and D12–D13's mechanics are
  open; the password-link and lockout design will be done completely new (before S3). Nothing in
  this file binds it.
- **A3 — One `locks` table** holds every password link, custom slug or not (§4). Its columns
  follow from the new design (A2).
- **A4 — Pending hops.** A turn's new hop is stored *pending* until its wraps (`Enc_T(K_c)`,
  `Enc_{K_c}(T)`) arrive; the link is shown only when it is complete; pending hops are deleted
  after a few minutes. This closes the gap between the two uploads in §3 step 3.
- **A5 — A 128-bit link secret** after `#`, expanded to the AES-256 key with HKDF-SHA-256: about
  22 characters, so D11's link stays near its 30–35-character target.

Still open from that review: whether a touch may recolour the *Moin* bubble (D4) — the project
rule is that red means *Moin*; hosting and domain for Cursus (needed before S1); the ROADMAP's
Phase 2 gate was waived by the owner on 2026-10-24/30.

---

## 1. What it is

**A private Stille Post for memes.** Someone makes a meme from the Moin cast and sends it on.
Each person may change it only a little — one word, one small touch — and passes it on. Nobody
knows who changed what. When the chain reaches its last stop, the original and the final version
are revealed side by side, and everyone in the chain can replay the whole tree as a wave rolling
outwards.

It is the second Moin app, built after Moin Moin Moin is charming (ROADMAP Phase 2), in the same
repository, sharing the cast, the palette and the *Moin* sound.

**What it is not:** a public meme site, a feed, a social network, a photo-sharing app, or an
account system.

---

## 2. Decisions

### The meme

- **D1 — Templates are our own cast only.** Fishermen, the grumpy captain, the market woman, kids,
  seagulls. No photo uploads in v1. This keeps us clear of copyrighted meme images and keeps the
  relay free of uploaded media.
- **D2 — Captions are free text**, up to 140 characters, top and/or bottom.
- **D3 — The creator sets the rules of the game:**
  - **stops** — how many hops until the reveal: 3–12, default 6 *(range is a proposal)*;
  - **branches** — how many people each person may pass to: 1–3, default **1** (a straight
    line, classic Stille Post);
  - **change budget** — how many words each person may swap: 1–3, default **1**.
- **D4 — Each hop allows one small touch** from a fixed set: the seagull's expression, a hat,
  the colour of the Moin bubble, and similar. Touches are ids, not images.
- **D5 — Passing on unchanged is allowed.**
- **D6 — Anonymous by default.** A nickname per hop is optional. Before passing on, the sender is
  told plainly: *everyone after you will see your version.*

### The game

- **D7 — You see only the version you received** until you have passed it on (or added your
  version as the last stop). Then the whole tree opens.
- **D8 — The tree view:** every branch and every version, drawn as an animated tree; *replay the
  wave* plays the hops in the order they happened.
- **D9 — The finale:** when a branch reaches its stop count, its last person sees the original and
  the final version side by side. *(proposal)* A "say it out loud" button reads the final caption
  with the device's speech synthesis, using **only local voices** (`SpeechSynthesisVoice.localService`),
  because some browsers' default voices are cloud services *(verify per browser)*.
- **D10 — Total size cap:** at most 100 hops per chain, whatever the stops and branches allow
  *(proposal; 3 branches × 12 stops would otherwise be enormous)*.

### Links

- **D11 — Default link:** `https://<host>/m/<nodeId>#<key>`. The key sits after `#`, which
  browsers do not send to the server, so the relay never holds anything it can read. About 30–35
  characters after the host (with A5's 128-bit secret).
- **D12 — Password links (optional):** `https://<host>/m/<nodeId>` with no key; the key is
  unwrapped with a key derived from the password. Minimum strength is enforced on creation.
  *(mechanics: A2)*
- **D13 — Custom links:** `https://<host>/m/<slug>` with a slug of your choice, **always with a
  password**, because a chosen name is guessable. The slug is unique while the chain lives and is
  freed when it expires. *(mechanics: A2)*
- **D14 — Expiry:** the whole chain is deleted **30 days after its last hop**.
- **D15 — Tessera** is the shared Domi module for encrypted links (key generation, wrapping,
  link encoding, password derivation, relay client). Named after the *tessera hospitalis*, the
  token a Roman host and guest each kept half of as proof of friendship. Other Domi apps may reuse
  it; nothing in it knows about memes.
- **D16 — Cursus** is the relay service *(name proposal)*, after the *cursus publicus*, the Roman
  state's relay of couriers. Self-hostable, deletable without breaking the puzzle.

---

## 3. Cryptography *(proposal — to be reviewed in stage S0)*

All crypto runs in the browser via WebCrypto (AES-GCM-256, random 96-bit nonces). The relay
stores only ciphertext.

| Key | Who has it | Opens |
|:--|:--|:--|
| `K_n` — one per hop | whoever has the link to hop *n* | hop *n*'s own content |
| `T` — one per chain | everyone who has taken their turn | every hop, via `Enc_T(K_n)` stored with each hop |

How a turn works:

1. You open the link to hop *n*. With `K_n` from the fragment you decrypt hop *n* — and nothing
   else.
2. You make your version: a new hop *c* with a fresh `K_c`, and upload its content encrypted
   under `K_c` (stored *pending*, A4).
3. Only after accepting hop *c* does the relay return `Enc_{K_n}(T)`, stored with hop *n*. You
   decrypt `T`, then complete hop *c* by uploading `Enc_T(K_c)` and `Enc_{K_c}(T)`. The tree opens.
4. You pass on the link `…/m/c#K_c`.

The creator generates `T` and the first `K` when starting the chain.

**What this does and does not protect** — stated so nobody oversells it:

- The relay cannot read any meme, caption or nickname.
- The relay **does** see the tree's shape, hop sizes, the day each hop was added, and the slugs of
  custom links. It also sees IP addresses at the network level, even though it never stores them.
- D7's "hidden until your turn" is a game rule, not secrecy: someone can post a junk hop to unlock
  the tree. That is accepted — posting a junk hop is taking a turn.
- The change budget (D3) and the touch limit (D4) are enforced by the client. A modified client can
  break them. This is a cooperative game between friends; the relay enforces only what it can see:
  depth (stops), children per hop (branches), and the 100-hop cap.
- Password links depend on the password: if the relay's data ever leaked, a weak password could be
  guessed offline. *(The minimum strength and lockout are redesigned: A2.)*
- Password derivation: Argon2id via WebAssembly is preferred; WebCrypto itself offers PBKDF2 but,
  as far as I know, not Argon2 *(verify)*.

---

## 4. Relay data (Cursus)

| Table | Columns | Nothing else |
|:--|:--|:--|
| `chains` | id, maxStops, maxBranches, hopCount, lastHopDay, expiresDay | no creator, no names |
| `hops` | id, chainId, parentId, depth, day, ciphertext (≤ 2 KB), wrapKeyByT, wrapTByKey, pending (A4) | no IP, no user agent, no nickname in clear |
| `locks` | every password link, custom slug or not (A3); columns follow the new design (A2) | |

A daily job deletes every chain past `expiresDay`, with its hops and locks; pending hops go after
a few minutes (A4). Adding a column is a design discussion, not a migration.

**Hosting duties *(verify in S0)*:** running Cursus probably makes you a hosting service under the
EU Digital Services Act, with notice-and-action duties. Captions are short encrypted text and there
are no uploads, which keeps the exposure small — but it must be checked, and a contact point and a
way to take a reported chain down must exist before launch.

---

## 5. Architecture

```
apps/moin-domi/        Svelte 5 PWA: create, receive, pass on, tree view, finale
packages/tessera/      encrypted links: keys, wrap/unwrap, link codec, password KDF, relay client
packages/assets/       shared cast, touches, palette, Moin sound (already exists)
services/cursus/       Node + SQLite relay, ~a few hundred lines, self-hostable
```

- `tessera` imports nothing from Moin. Another Domi app must be able to use it unchanged.
- `apps/moin-moin-moin` must keep working with `services/cursus` deleted. If it does not, that is a
  **blocker**.
- Meme rendering is client-side SVG from template + caption + touches. An optional "save image"
  exports a PNG — the user's choice to take it out of the private chain.

---

## 6. Test matrix (minimum)

| Area | Happy day | Bad weather |
|:--|:--|:--|
| Tessera | link round-trip; wrap/unwrap; password link opens | wrong key fails; tampered ciphertext fails (GCM tag); wrong password fails and counts; lockout after N failures *(A2)* |
| Turns | pass on unchanged; one-word edit; one touch | two-word edit at budget 1 rejected by client; 4th child at branches 3 rejected by relay; hop past stops rejected by relay; hop 101 rejected; a pending hop never completed is deleted and never shown as a link (A4) |
| Tree | tree opens after your turn; replay order matches hop order | tree never decryptable before your turn (with honest client) |
| Expiry | chain gone on day 31 after last hop; slug freed | a hop on day 29 extends the chain |
| Privacy | relay DB contains no plaintext caption (scan test) | relay logs contain no IP, no user agent (scan test) |
| Offline | received meme renders offline once loaded; create works offline and queues the upload | passing on offline shows a clear "will send when online", never a spinner |

---

## 7. Roadmap

Each stage ends in a gate: a question with an observable answer.

### S0 — Design and Tessera · ~1–2 weeks
- Review §3 with a threat model in `.agents/features/tessera.md`; settle Argon2id vs PBKDF2.
- `packages/tessera` with the Tessera rows of §6 (password rows wait for A2's design).
- Check the DSA question (§4) and write down the answer.

**Gate:** every Tessera bad-weather test fails for the right reason, and the DSA answer is written
down with its source.

### S1 — A straight line · ~2–3 weeks
- Branches fixed at 1. Create → pass on → finale, D1–D7, D9, D11, D14.
- `services/cursus` minimal: hops (with pending, A4), chains, expiry job.

**Gate:** a chain of six real people finishes without anyone asking how it works, and the finale
gets a laugh.

### S2 — Branches and the tree · ~2 weeks
- D3 branches 1–3, D8 tree view and wave replay, D10 cap.

**Gate:** someone browses the tree unprompted after their turn.

### S3 — Password and custom links · ~1–2 weeks
- D12, D13 with the new password and lockout design (A2), the `locks` table (A3), slug lifecycle.

**Gate:** a non-technical person opens a password link on the first try.

### S4 — The bridge · ~1 week
- The puzzle's win screen gets "start a Moin chain" (ROADMAP Phase 4).

**Gate:** the button adds no network call to the puzzle until pressed, and is disabled with a
reason when offline.

---

## 8. Out of scope

Photo uploads, video, voice recordings, public feeds, discovery, accounts, push notifications,
moderation tooling beyond takedown of a reported chain, and any analytics.

## 9. Open questions

- Hosting for Cursus (the home server, or a small VPS) and the domain.
- Whether nicknames should be per chain or remembered on the device.
- Whether the finale's speech is worth keeping once tested with local voices only.
- Whether a touch may recolour the *Moin* bubble (D4 vs "red means Moin").
