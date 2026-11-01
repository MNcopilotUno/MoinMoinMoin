# Review — feature/domi-app (adversarial)

Scope: the Moin Domi app at `/domi/` after the owner's dark design canvas
(<https://claude.ai/artifact/DjZsy8JNkX6pj4g9SWJUJp>), the 404 redirect for `/domi/m/…` links,
`budget` in the meme value, e2e against a local Cursus. Feature doc: `.agents/features/domi-app.md`.

## Findings
1. **Puzzle palette overrode Domi's paper.** `palette.css`'s night rule
   (`:root:not([data-theme='light'])` under `prefers-color-scheme: dark`) outranks Domi's
   `:root` tokens and would have turned `--paper` navy on dark phones. *Fixed*: Domi no longer
   imports the puzzle palette; the style board's tokens live in `app.css` with the font stacks.
2. **"1" read as "I".** Cormorant's old-style numerals in the gold steppers. *Fixed*: Figtree,
   tabular figures. Found by looking at screenshots, not by a test.
3. **The change budget could not travel.** The relay never sees D3's word budget, so a hop alone
   could not tell the next person how many words they may swap. *Fixed*: `budget` is part of the
   sealed meme; `checkTurn` refuses a turn that changes it (meme tests 29 → 33).
4. **Gone said "went quiet for 30 days"** for any 404, including a link that never existed — the
   relay cannot tell them apart. *Fixed*: "Nothing answers to this link any more…".
5. **Grammar and spacing**: "You started it of 3" in Yours; "Moin· a gull joined" in the drift
   list (Svelte trims the leading space inside `<em>`); *Replay the wave* wrapped. *Fixed*.
6. **The key leaves the address bar before the hop is saved.** `openLink` replaces the URL first,
   so if the relay is unreachable the key is in neither place; the person taps the link in their
   messenger again. *Accepted*: the alternative leaves keys in history on every failure.
7. **The creator's status stays "Travelling"** after the chain's finale until they open the
   tree (statuses are refreshed when a tree is read). *Accepted*, noted.
8. **Keys sit unencrypted in IndexedDB.** In the threat model (`tessera.md`): an unlocked phone
   in other hands is out of scope; *Forget everything* removes them.
9. **Unused day paintings ship in `dist/`** (`@moin/ui`'s barrel imports `Scene`). Never fetched
   by the page, ~1.5 MB of deploy size. *Accepted for now*; deep imports would fix it.
10. **Password and custom links** are shown as *Later* and do nothing — S3, waiting for A2. The
    canvas's *Unlock* screen is not built.
11. **Only Chromium was run locally.** Firefox and WebKit run in CI (`PW_ALL_BROWSERS=1`);
    `canvas.roundRect`, `paint-order` on HTML text and the download are the likely differences.
12. **Not reachable from the live site**: no relay is hosted. The live app says so on Home and
    on the send button; e2e covers that build too.

## Evidence
`svelte-check` 0 errors 0 warnings; e2e Domi **7/7** on the built app (Chromium, Pixel 7) with a
loopback Cursus, including the `/m/` path through the 404 page, a three-stop chain with a word, a
touch and the finale, branch refusal, a postcard with a real 1080 px PNG, broken and unknown
links, settings, and the relay-less build. Screens compared by eye with the canvas
(screenshots of all 14 states).
