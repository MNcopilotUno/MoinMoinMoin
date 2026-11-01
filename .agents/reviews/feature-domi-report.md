# Review — feature/domi-report (adversarial)

Scope: DSA contact, terms and notice in Moin Domi (`.agents/features/dsa.md`, Built).

## Findings
1. **A report without the key is useless** — we cannot read a chain. The mail body carries the
   full link and says to keep the part after `#`. *By design*; a test checks the link is in it.
2. **Mailing a key hands that hop to the operator** — and only that hop, plus whatever a turn
   would reveal if the operator abused it. That is the notice's purpose; stated in About.
3. **`mailto:` needs a mail app.** On a phone without one the link does nothing. *Accepted*: the
   address is also shown in About to copy by hand. A web form would need a server — out of scope.
4. **The inline address was an 18 px tap target.** *Fixed*: a 48 px row of its own (caught by
   the tap-target check in the new test).
5. **A malformed `DOMI_CONTACT`** (spaces, quotes) could have built a broken `mailto:`. *Guarded*:
   anything not shaped like an address is treated as unset.
6. **No receipt or decision notice (Art. 16(4)–(5))** — answered by a person by mail. *Gap*,
   recorded in `dsa.md`.
7. Own postcards show no *Report* (you sent it); trees always do (others' versions are in them).

## Evidence
e2e Domi **11/11** (Chromium); `svelte-check` 0/0; lint clean.
