# Review — feature/domi-likes (adversarial)

## Findings
1. **Scope**: the owner chose "public feed only" earlier (A8) and now asked for likes. Recorded as
   **A9** in `MOIN_DOMI.md` with what it does *not* bring (no ranking, no list of likers, no
   notifications); CLAUDE.md §1/§8 follow. CLAUDE.md stays at 244 lines.
2. **A like is a credential-free counter**: anyone can make fresh tokens and inflate a count up
   to the `write` rate limit (60, then 1 per 10 s per address). *Accepted* (A9 says so); nothing
   is ordered by it, so inflating buys nothing but a number.
3. **Taking back someone else's like** needs their token; the relay keeps only its SHA-256, so a
   database thief cannot either. Tested.
4. **First replacement landed on the wrong interface** (`HopView` instead of `PublicPost`) while
   editing Tessera — caught by the typecheck, fixed before any test ran. Lesson: anchor edits on
   the unique interface name, not on a field list two interfaces share.
5. **Red**: the like is the Moin bubble — red still means only Moin. A heart would have broken §7.
6. **Forgotten phone**: after *Forget everything*, earlier likes stay counted and can't be taken
   back from that phone. Accepted; said in `domi-likes.md`.
7. **No offline queue for likes**: the button is disabled offline. Accepted (not worth a queue).
8. **The relay trusts its own count**; the phone clamps a non-integer or negative `likes` to 0.

## Evidence
`.agents/features/domi-likes.md` → As built. Unit: meme 45, core 60, tessera 58, narration 70,
levels 95, cursus 45, ui 92; Domi e2e 40/40 (Chromium); lint and typechecks clean.
