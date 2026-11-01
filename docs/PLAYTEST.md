# Playtest kit — running the gates

Companion to [`ROADMAP.md`](ROADMAP.md) and [`MOIN_DOMI.md`](MOIN_DOMI.md). Every phase ends in a
gate: a question with an observable answer. The software for every phase is built; **the gates are
what is left**, and only people can pass them. This page makes each one an evening's work.

No analytics exist and none are added for this (CLAUDE.md §1): you watch, and you write it down.
Print the sheets, or copy them into a note on your phone.

## Ground rules for every session
- **Say nothing.** No "tap here", no "it's a puzzle about…". The gates ask whether it explains
  itself. If someone is stuck for a minute, write down where — that is the result — then help.
- **Their phone if possible**, otherwise yours with the app freshly installed (Settings → *Start
  over* in the puzzle; *Forget everything on this phone* in Domi).
- **Write down words, not impressions.** "She said *ha, the gull!*" beats "she liked it".
- Afterwards, each finding goes where the manual says: a level problem into
  `.agents/lessons/puzzles.md`, a narrator line that fell flat into `packages/narration/`, the gate's
  yes/no into the status line of `ROADMAP.md` with the date.

---

## Gate status (2026-11-01)

| Gate | What it asks | State |
|:--|:--|:--|
| Phase 0 | the sketch is fun to watch five times; replay identical on Chromium, Firefox, WebKit; `validate:levels` passes and fails every fixture | **technical half met** (CI runs both on every push); "fun to watch" was waived by the owner |
| Phase 1 | three people, no explanation: level 1 in ten seconds, a narrator line read aloud or laughed at, someone asks for more levels | **not run** — sheet A |
| Phase 2 | you, a month later, still open it for fun | **not run** — sheet B, check on 2026-12-01 |
| Domi S0 | every Tessera bad-weather test fails for the right reason; the DSA answer written with its source | **met** (tessera tests; `.agents/features/dsa.md`) |
| Domi S1 | a chain of six real people finishes without anyone asking how it works, and the finale gets a laugh | **blocked: the relay has no host** — sheet C |
| Domi S2 | someone browses the tree unprompted after their turn | **blocked: the relay** — sheet C, last column |
| Domi S3 | a non-technical person opens a password link on the first try | **blocked: the relay** — sheet D |
| Domi S4 / Phase 4 | the button adds no network call until pressed; disabled with a reason offline | **met by test** (`apps/moin-moin-moin/e2e/bridge.spec.ts`, every push) |

---

## Sheet A — Phase 1: the puzzle explains itself
*Three people, one at a time. Hand over the phone on the puzzle's first level. Start a stopwatch
when they hold it.*

| | Person 1 | Person 2 | Person 3 |
|:--|:--|:--|:--|
| Seconds until the first *Moin* flies (their first tap) | | | |
| Seconds until level 1 is solved | | | |
| Read a narrator line aloud, or laughed at one? Which line? | | | |
| Asked for more levels, unprompted? Their words: | | | |
| Where they got stuck (level, what they tried) | | | |
| Tapped at random and won anyway? (→ `puzzles.md`) | | | |

**Pass:** level 1 within ten seconds for all three; at least one narrator reaction; at least one
unprompted "more". **Fail →** fix the first levels, the model or the lines before anything else.

## Sheet B — Phase 2: a month later
*Put a reminder in your own calendar for **2026-12-01**. Answer honestly, alone.*

- Did I open it in the last week without meaning to test something? ___
- Did I play the daily level on most days? ___
- Is there a level I still think about? Which? ___

**Pass:** yes to the first. **Fail →** "done as a toy — ship what exists and stop" (ROADMAP).

## Sheet C — Domi S1 and S2: a chain of six
*Needs the relay hosted (`services/cursus/deploy/README.md`) and the repository variables
`CURSUS_URL` and `DOMI_CONTACT` set. Six people who know each other; you are the first stop. Send
the link the way you normally send things (a messenger), with nothing else in the message.*

| Stop | Opened it? How long after? | Asked how it works? Their question: | Changed a word / a touch / nothing | Looked at the tree afterwards, unprompted? (S2) |
|:--|:--|:--|:--|:--|
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 (finale) | | | | |

- The finale: did the last person laugh, or forward a screenshot? Their words: ___
- Did anyone send the link on in a way that broke it (cut off after `#`)? ___

**Pass S1:** all six stops done, nobody asked how it works, a laugh at the finale.
**Pass S2:** at least one person opened the tree without being told.

## Sheet D — Domi S3: a password link
*One person who would describe themselves as "not good with phones". Make a chain with **With a
password**, take the suggested passphrase. Send the link by message; **say** the password, or send
it in a different app.*

- Opened the link and found where the password goes without help? ___
- Typed the five words right the first time? If not, what went wrong (capitals, hyphens, spaces)? ___
- Seconds from opening the link to *Your turn*: ___

**Pass:** first try, no help. **If the typing went wrong**, that answers the owner's open question
on the strength rule and the passphrase (`.agents/features/password-links.md`).

---

## Running a Domi playtest before the real host exists
WebCrypto works only on secure pages (HTTPS or `localhost`), so phones cannot reach a relay on a
laptop over the home Wi-Fi by its address. For one evening you can put the laptop's relay behind
a temporary HTTPS tunnel and build the app against it — but that sends the session's (encrypted)
traffic through the tunnel's company, which is the owner's call. The clean way is the host.
