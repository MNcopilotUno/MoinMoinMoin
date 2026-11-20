# Review — feature/domi-feed (adversarial)

## Findings
1. **The feed reloaded forever** (`$effect` tracked `loading` and `posts` through `load()`): the
   *Load older* button stayed on "Looking…" and the relay got a request per frame. Found by the
   paging test; *fixed* with `untrack`, and the test now asserts exactly two reads. Lesson in
   `code.md`.
2. **Two headings called "The public feed"** (h1 and the list's h2). *Fixed*: "Newest first".
3. **Copy still promised "no feed"** on Home and in About. *Fixed*; About gained the feed's terms.
4. **XSS through a post**: the relay keeps whatever JSON it is given; the phone runs `toMeme`
   (strict, closed lists) before showing anything, and Svelte escapes captions. A planted
   `who: '<img onerror>'` post is skipped (tested). *Fine.*
5. **A public post id is relay-chosen** (6 random bytes), so links cannot be guessed in order;
   `seq` is exposed for paging — it reveals how many posts exist. *Accepted* (it is a public feed).
6. **Rate limit per address** (5, then one per 10 min) is the only spam brake; behind CGNAT many
   people share an address. *Accepted* for a friends-sized feed; `CURSUS_RATE_SCALE` exists.
7. **Reads of a popular post** hit the home server directly; reads are rate-limited per address
   and the response is tiny. *Accepted* (`HOSTING.md` §7 already names the exposure).
8. **Hidden posts stay in the database** until they expire (30 days) — the operator can
   `takedown` to delete at once. *Deliberate*: hiding is reversible by hand, deleting is not.
9. **Not built**: the library (`template`) in posts waits for `feature/meme-library`; a meme with
   a `template` is already publishable.
10. **Art. 24(3)** (report monthly active recipients on request): answered by counting posts and
    hops per month by hand (dsa.md). Not automated.

## Evidence
`.agents/features/domi-feed.md` → As built. Domi e2e (Chromium) 39/39; cursus 44; typechecks and
lint clean.
