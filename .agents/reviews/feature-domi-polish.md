# Review — feature/domi-polish (adversarial)

Scope: deep imports from `@moin/ui` (no unused paintings in Domi's build), statuses in *Yours*
refreshed from the relay (finale, gone), *Remove from this phone* for gone chains, Domi's
update prompt under test.

## Findings
1. **3.4 MB of build for 1.2 MB of app.** `@moin/ui`'s barrel pulls in the puzzle's `Scene`, and
   Vite emitted every day and wide painting into Domi's `dist/`. *Fixed* with two subpath exports
   (`@moin/ui/portrait`, `@moin/ui/SeagullSprite.svelte`); Domi ships its four night paintings.
2. **Stale statuses** (domi-app review, finding 7): a creator's chain said *Travelling* after its
   finale. *Fixed*: opening *Yours* online asks for up to ten readable trees, newest first, and
   marks finales and chains the relay no longer has. A chain past its day on the phone's clock is
   *Gone* without asking.
3. **That costs reads**: up to ten tree requests per visit to *Yours* — inside the read limit
   (120 at once) and only for chains still *travelling*.
4. **"Gone" from a 404 could be wrong** if the relay was wiped by mistake; the record stays until
   the person removes it, and its snapshot (the tree as last seen) is kept.
5. **I first skipped the new update test on WebKit without evidence** — a guess dressed as a
   harness limit. *Removed the skip*; CI decides.
6. **No e2e for *Gone* in Yours**: expiry is 30 days and the test relay runs in another process.
   The status logic is three lines; *gap*, noted.

## Evidence
Domi e2e 18/18 on Chromium (finale-in-Yours and update prompt new); `svelte-check` 0/0; lint clean;
`du -sh dist` 3.4 MB → 1.2 MB.
