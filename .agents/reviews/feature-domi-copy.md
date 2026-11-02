# Review: feature/domi-copy

Moin Domi's interface text moves from its Svelte screens and `lib/` into
`packages/ui/src/copy/domi.ts` (CLAUDE.md §7), imported as `@moin/ui/copy/domi`.
Analysis: `.agents/features/domi-copy.md`.

## How it was checked
- **Old strings → copy.** A script took every quoted literal, template-literal piece, attribute
  value and text node from the `HEAD` versions of `apps/moin-domi/src/**` (passphrase list
  excluded) and looked each English one up verbatim in `domi.ts`. What it still reports is class
  names, selectors, font stacks, `'UTC'`, `'#app missing'`, the two internal `TesseraError`
  messages, the `1 of 3` step labels (now `common.step(n)`), About's two sentences (now two
  entries, joined by the same space) and nested-template pieces whose whole sentences the new
  unit test asserts (Yours' meta line, the tree node label).
- **Copy → screens, nothing left behind.** `grep` over the new Svelte files for text nodes and
  `aria-label` / `placeholder` / `alt` / `title` attributes with letters: none.
- **Exact strings in the browser.** The Domi e2e suite (26 tests, Chromium) asserts many exact
  sentences with ’ and —; it passes unchanged.
- **The barrel stays out.** The built `dist/` is 1.4 MB with only the five night paintings and no
  puzzle copy (`Everyone is smiling` absent).

## Findings

1. **Fixed — `…/m/` was written three times in `domi.ts`** (`lock.prefix`, `lock.path`,
   `rules.nameHint`), so the hint under a custom name could drift from the link shown on Ready
   and Unlock. Hoisted to one module constant `PATH`.
2. **Open — `look.ts` still lower-cases copy** (`describe` lower-cases the cast name and the
   place: "The grumpy captain" → "the grumpy captain"). The visible text is identical, but the
   copy module no longer holds the exact words of the meme's spoken label; a reword with a
   proper noun ("Hamburg") would be lower-cased silently. Lower-case forms in the copy would be
   cleaner; left as is to keep this change a pure move.
3. **Open — `ready.lockFailed(reason)` relies on `reason` ending with its own full stop**
   (`"…set (The relay didn’t answer. Try again in a moment.) This link…"`). That coupling between
   two entries was already there in `App.svelte`; it is now written down in a comment and pinned
   by a unit test, not removed.
4. **Accepted — markup glue left in screens.** The typographic quotes “ ” around the tree's and
   finale's per-word `<strong>` caption, the `' '` between those words, and `'en-GB'` date and
   time locales stay in Svelte. They wrap user data or pick a format; none is a sentence.
5. **Accepted — duplicated sentences.** "Everyone after you will see your version." is in both
   `rules.chainWarn` and `turn.warn`, and "A meme postcard" in both `rules.postcardTitle` and
   `postcard.kicker.postcard`. Each screen may want to reword its own; sharing a key would tie
   them together for no gain.
6. **Accepted — whitespace at element edges.** Home's foot note, the postcard's status line and
   Queued's body were `{#if}…{:else}…{/if}` blocks with newlines inside `<p>`; they are now
   ternaries. `textContent` can lose a trailing space; nothing renders it and Playwright
   normalises it. The `<li>` lists (Rules, Settings, About) became `{#each}` with no whitespace
   between items: block items, invisible.
7. **Accepted — unreachable states now render `''` not `undefined`.** Turn's
   `swapFor(base[picked] ?? '')` and `swapped(swaps[i] ?? '', w)` add `?? ''` because the copy
   functions take `string` under `noUncheckedIndexedAccess`; the old code would have printed
   "undefined" in a state the UI cannot reach.
8. **Scope — a test file outside the listed paths.** `packages/ui/test/domi-copy.test.ts` is new
   (the brief listed `packages/ui/src/copy/` and `package.json`). It is additive, touches nothing
   the parallel puzzle work edits, and is the only guard that `domi.ts` stays import-free and
   apostrophe-clean. Drop it with one `git rm` if the scope must be exact.
9. **Debatable — content-ish strings moved.** The Turn screen's suggested words (`turn.ideas`)
   and the bridge's prefilled captions (`bridge.top`, `bridge.bottom`) are meme text more than
   interface text. They are English and shown as-is, so they moved; the German passphrase words
   did not (security data, and the brief says so).
10. **Not verified here — Firefox and WebKit.** Only Chromium is installed locally; CI runs all
    three (`PW_ALL_BROWSERS=1`).
11. **Pre-existing, now visible — `settings.version` is hand-written** (`Moin Domi 0.1 · relay v1`)
    and does not follow `package.json` (0.1.0). Out of scope; noted.
