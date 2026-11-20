# Review: `feature/meme-library` (adversarial)

Scope: `packages/assets/library/` (24 JPEGs, `library.json`, `README.md`), the test, the
`./library/*` export, vitest in `@moin/assets`. Not wired into Domi (the lead does that).

## How the licences were checked
One batched Commons API request per group (`prop=imageinfo&iiprop=url|extmetadata`), reading
`LicenseShortName`. Every kept file read **`Public domain`** (paintings via PD-Art, NASA) or
**`CC0`** (authors' own waivers; Rijksmuseum and the Met's open-access releases). The assembler
refuses any other value. Openverse was used to *find* CC0 candidates only. The JSON keeps the
landing page so anyone can re-check.

## Findings

1. **MOIN_DOMI D1 says "templates are our own cast only".** This library contradicts the letter
   of D1 (not its reasons: no copyrighted images, nothing uploaded, the relay sees ids only).
   **Blocker for wiring**, not for merging the assets: the lead needs an amendment (A8) before
   Domi offers these.
2. **CLAUDE.md §3 says seven packages have tests; now eight** (`assets`). The root `pnpm test`
   picks it up via `./packages/**`. The count in CLAUDE.md should be updated by whoever merges —
   I did not touch CLAUDE.md.
3. **The test cannot prove a licence is true**, only that the string is one of two. The real
   check is the metadata read above; it is recorded here, not re-run in CI (CI must not depend on
   Commons, which rate-limits).
4. **Blur to fit the budget.** Six files only fit ≤ 180 KB after a Gaussian blur: Great Wave,
   Hunters, Sea of Ice and seal pup at 1.1 px, Desperate Man and grey seal at 0.5 px. At phone size it is invisible;
   on a desktop at 100 % the craquelure is softer than the original. Accepted: these are meme
   backgrounds, not reproductions.
5. **Red means Moin** (CLAUDE.md §7) — Monet's red sun, Munch's red sky and Courbet's red
   signature are red. The rule is about our UI colour; a painting's own colours are not a UI
   signal. Noted so a reviewer does not think it was missed.
6. **Size**: 24 files, 3.6 MB in git forever. Within the ~4.5 MB budget; if Domi precaches all of
   them the PWA install grows by the same. The lead should lazy-load (not precache) the library.

## Per image — what I was unsure about

| id | licence read | doubt |
|:--|:--|:--|
| wanderer-fog | Public domain | Photo of the painting by a Commons user (Cybershot800i); PD-Art covers faithful 2D reproductions. |
| monk-by-sea, moonrise-sea, fishermen-at-sea, ninth-wave, hunters-snow, impression-sunrise, view-of-delft | Public domain | Google Art Project / museum scans; PD-Art. No doubt in the US/EU; UK museums once claimed reproduction rights. |
| sea-of-ice | Public domain | Source is a 1974 book scan (Prestel); colours are off and a little contrasty. A better Kunsthalle scan would be nicer — same licence. |
| great-wave | Public domain | Met copy (1831 print). Crop cuts the boat on the left; the wave and Fuji remain. |
| fighting-temeraire | Public domain | National Gallery scan; fine. |
| storm-galilee | Public domain | Shows Christ among the panicking crew — a religious subject. Kept: it is one of the most-quoted "everyone panics, one stays calm" paintings, and the figure is small. Drop it if the owner prefers no religious scenes. The painting was stolen in 1990; the photo predates that, irrelevant to copyright. |
| the-scream | Public domain | Munch died 1944 → PD in the EU/EEA since 2015; published 1893/1895, so PD in the US. Scan by the National Museum of Norway; Commons says PD. |
| desperate-man | Public domain | Source only 1500 × 1228 from an old art-history site (still downscaled, 1228 → 1080, no upscaling). Private collection; PD-Art. |
| pearl-earring, whistlers-mother | Public domain | Mauritshuis / Orsay scans; fine. Whistler died 1903. |
| threatened-swan | CC0 | Rijksmuseum release. The painting carries painted words ("de raad-pensionaris", "Holland") — part of the 1650 work, tiny at phone size. |
| cat-stealing-fish | CC0 | Met Open Access. Dark; cropped 4 % to lose the scan's black border. A cat stealing fish is our gull's crime — on theme. |
| earthrise | Public domain | NASA work (US federal). Not North Sea, kept for "perspective" jokes. |
| gull-on-post | CC0 | W.carter's own work. A Swedish flag corner shows at the bottom (a national flag, not a brand). |
| grey-seal | CC0 | Bj.schoenmakers' own work, at Ecomare (Texel) — seal in a pool, possibly a rescue animal. Funniest face in the set. |
| seal-pup | CC0 | **Unsplash** (2016). Unsplash photos were CC0 until June 2017; this one was published under CC0 and Commons records the archived source. CC0 is irrevocable, but this is the weakest provenance in the set. The Commons title says "sea lion"; it is a grey seal pup — my title says "seal pup". |
| guillemot | CC0 | Hobbyfotowiki's own work, Heligoland. |
| blue-eyed-cat | CC0 | **Pixabay** (2018). Pixabay was CC0 until January 2019; Commons marks it CC0 with an archive link. Same caveat as seal-pup. |

## Dropped candidates and why
- **Fall of Icarus** (Bruegel): only a 1246 × 800 file on that page, and the joke (tiny legs in
  the water) disappears at phone size; the original host also rate-limited the download.
- **Northern gannets at Heligoland** (CC0): looked fine in the list, but the photo shows a
  mating pair — out (nothing sexual).
- **Snow Storm** (Turner): reads as grey mush at phone size; Ninth Wave and Storm on Galilee cover
  "chaos at sea".
- **The Magpie** (Monet): the magpie is a 30-pixel dot at phone size — no subject.
- **The Milkmaid** (Vermeer), **Two Men Contemplating the Moon** (Friedrich): good, but weaker
  than what stayed and off-theme (kitchen, forest); keep for a second batch.
- **Common eider on the dune** (CC0): good, but the set already has four North Sea animals.
- **Cat with green eyes** (CC0, Vera Kratochvil): 1280 × 853 source, upscaling needed; the
  blue-eyed cat is better.
- **Herring gull near Terschelling** (CC0): verified, but Commons' original-file host answered 429
  with `Retry-After: 600` for it; not in this batch.
- **Not even downloaded**: Grumpy Cat and other famous meme photos (copyrighted, trademarked);
  Flickr "Public Domain Mark" photos set by uploaders who are not the author (a claim, not a
  waiver); Hopper (died 1967), Nolde (died 1956 → PD only from 2027), Liebermann/Arcimboldo/Dürer
  (no file title found without Commons search, which was rate-limited).

## Verdict
Mergeable as assets. Not yet usable in Domi until D1 is amended (finding 1) and the loading
strategy is decided (finding 6).

## Lead review (2026-11-20, before merging)
- **Licences re-checked independently** on the Commons API for the riskiest five: seal-pup (ex-
  Unsplash) CC0, blue-eyed-cat (ex-Pixabay) CC0, gull-on-post CC0, threatened-swan (Rijksmuseum)
  CC0 — confirmed. guillemot: Commons rate-limited my request; checked by the agent only.
- **D1 is already widened by A8** ("an open-licensed template library"), so no new amendment is
  needed — the agent's point 1 is answered by `MOIN_DOMI.md` A8.
- **Contact sheet** looked at in full: all 24 read at phone size; nothing gory, nothing private.
  `storm-galilee` shows a religious scene — kept, flagged for the owner.
- **CLAUDE.md §3**: eight packages have tests now (`assets` 53); updated.
- **Not precached** (3.6 MB): agreed; the picker will load thumbnails on demand (next branch).
- Merge conflict in `lessons/technical.md` (both sides appended): both lessons kept.

## Review — feature/domi-library (wiring it into Domi, adversarial)
1. **Credits as small inline links** failed the 44 px rule (the existing About test caught it).
   *Fixed*: full-height row links inside a disclosure.
2. **3.6 MB in the precache** would have tripled the install. *Avoided*: runtime `CacheFirst`;
   checked in the built `sw.js` (library files absent from the manifest, `domi-library` present).
   Consequence: a library meme never seen on this phone shows black while offline. *Accepted.*
3. **Unknown template ids** (a newer phone's library) render black, never crash; the label falls
   back to the painting's place. *Fine.*
4. **The row loads up to 3.6 MB** if someone scrolls through all 24 tiles (no thumbnails).
   *Accepted for now*; 128 px thumbnails would cut it to ~200 KB — a small follow-up if it bites.
5. **Licence stays with the file**: the credit is shown when picked and in About, not burned into
   saved images (not required for PD/CC0).
