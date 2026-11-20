# The meme library

Square backgrounds for Moin Domi memes that **nobody owns**: public-domain paintings and
photographs, and photographs whose authors waived their rights with CC0. Credits are in
[`library.json`](library.json); the app shows them. Import a file as
`@moin/assets/library/<id>.jpg`.

This is the legal answer to "download some memes": famous meme photos are copyrighted (and often
show real, identifiable people), so they are not here and never will be.

## The licence rule

1. **Only `Public domain` or `CC0 1.0`.** No CC BY, no CC BY-SA, no "free for personal use", no
   "royalty-free", no "found it on Pinterest".
2. **Verified per file, from the source's own metadata** — never from memory or from a file's age.
   For Wikimedia Commons that is the API's `extmetadata.LicenseShortName`
   (`action=query&prop=imageinfo&iiprop=url|extmetadata`), which must read `Public domain`,
   `PD-…` or `CC0`. Openverse (`license=cc0,pdm`) is only a search engine for candidates.
3. **"Public domain mark" by a random uploader is not enough.** Anyone can tag someone else's
   photo. Accept it only when there is an objective reason: the author died more than 70 years ago
   *and* the work was published before 1931 (EU and US both satisfied), or it is a US federal
   work (NASA, USFWS…). Faithful photographs of public-domain paintings add no new copyright
   (*Bridgeman v. Corel*; EU DSM Directive Art. 14).
4. **No identifiable private person in a modern photo, no logos, no brands, nothing violent or
   sexual.** Copyright is not the only right in a picture.

## How the files were made

From the Commons thumbnail (1920 px wide, or the original when smaller):

- crop to a square around a chosen focus point, resize to **1080 × 1080** (Lanczos);
- copy the pixels into a fresh image, so **no EXIF, XMP, IPTC or ICC** survives;
- save as a **progressive JPEG**, quality 78, stepping down to 70 — and for busy paintings
  (craquelure, canvas weave) a Gaussian blur of at most 1.1 px first — until the file is
  **≤ 180 KB** (the test allows 200 KB).

Downloads were treated as untrusted data: a separate empty directory, Python run with `-I`,
nothing from them executed. Commons answers 429 to bursts, so lookups were batched (up to 50
files per API request) with a descriptive User-Agent and `Retry-After` honoured.

## Adding one

1. Find a candidate (Commons, or Openverse with `license=cc0,pdm`). Check it is funny: a figure
   or animal to project onto, a situation, and room for a caption at the top and the bottom.
2. Read its licence from the Commons API as above. Write down the landing URL, creator and date.
3. Make the 1080² JPEG as above and **look at it at phone size**. If the joke needs a detail you
   cannot see on a phone, drop it.
4. Add `library/<id>.jpg` (kebab-case id) and an entry to `library.json`:
   `{ "id", "title", "creator", "year"?, "license": "Public domain" | "CC0 1.0", "source", "tags" }`.
5. `pnpm --filter @moin/assets test` checks the pairing, ids, licence strings, https sources,
   size, dimensions and stripped metadata. It cannot check the licence is *true* — that is step 2,
   and the review (`.agents/reviews/`) records what was checked.
