# Feature: own photos and GIFs in Domi (A8)

## Problem
The owner wants memes from your own pictures and GIFs, without giving up what Domi promises:
the relay cannot see what friends send each other.

## Design
- **On the phone first.** A picked JPEG, PNG or WebP is decoded, shrunk to at most 1080 px on its
  long side and re-encoded as JPEG (≈ 0.85) — which also drops EXIF (GPS, camera, time). A GIF is
  kept as it is (re-encoding would lose the animation) if it is ≤ 2 MB; bigger is refused with the
  reason. The person ticks *I may share this picture* before it is used.
- **A media key per picture.** The phone makes a random 128-bit key `M` and a media id, seals the
  bytes with `M` (purpose `media`, AAD `tessera/v1|media|<chainId>|<mediaId>`), uploads the box,
  and puts `{ id, key: M, type, w, h }` **inside the meme** — which is sealed with the hop's key
  as before. The relay holds a box it cannot open, and a hop that it cannot read either.
- **Once per chain.** Every later stop's meme carries the same reference (the picture cannot be
  swapped in a turn: it is part of the template, like the cast member), so a 2 MB GIF is uploaded
  once, not six times.
- **Order of things.** The chain id is chosen on the phone (Tessera already does), so the picture
  is uploaded *before* the chain exists; the relay keeps such a box for 30 minutes, then deletes it
  unless a chain with that id appeared. A box lives and dies with its chain (expiry, takedown).
- **Relay**: `POST /v1/media/<id>?chain=<chainId>` (raw bytes ≤ 2.2 MB, counts as *create* for
  rate limits, disk guard), `GET /v1/media/<id>` (bytes; immutable, private cache). Media are files
  in a `media` table (SQLite blob), never logged.
- **Showing it**: fetch → open with `M` → `Blob` → object URL in the meme (CSP `img-src blob:`). A
  GIF animates on screen; *Save image* exports a still with captions (and the original GIF without
  captions as a second file).
- **Not public**: a meme with an uploaded picture cannot be posted to the public feed (A8).

## Risks
- A GIF may carry metadata blocks (comments); not stripped. *(predicted, low)*
- 2 MB per chain on the home server: 1 000 live chains with pictures ≈ 2 GB; the disk guard
  (`CURSUS_MAX_MB`) applies to media too.
- The uploader's consent tick is a statement, not a check; reports and takedown still apply.

## Test matrix
| Happy day | Bad weather |
|:--|:--|
| a photo is shrunk, re-encoded, uploaded once, opens for the next stop and in the tree; a GIF keeps its frames; the relay's stored bytes contain neither the picture nor its EXIF | 3 MB GIF refused with the reason; wrong media key / moved box locked; media for a chain that never appeared deleted after 30 min; media gone with its chain; a public post with a picture refused (client and relay) |

## As built (2026-11-20, `feature/domi-uploads`)
- The phone picks the picture's **id and key when it is chosen** (Create), keeps the bytes in
  IndexedDB (`pictures` store, v3), and the draft meme already carries `{ id, key, type, w, h }`.
  On *make*, `start()` chooses the chain id, uploads with that key (`uploadMedia(…, key)`; a taken
  id gets a fresh one and the meme follows), then starts the chain under that id. The outbox needs
  nothing new: the queued meme names the picture, the bytes wait in IndexedDB (tested across a
  reload while offline).
- A received picture is opened once and kept on the phone; pictures no item, snapshot, queued Moin
  or draft names are pruned at start-up. *Forget everything* clears them.
- **Nobody** (`who: 'none'`) is a choice for every meme and the default with a picture; the
  smile/frown touch is not offered then (there is no face).
- Photos: `createImageBitmap(…, { imageOrientation: 'from-image' })` → canvas on black → JPEG 0.85.
  Larger than 4096 px GIFs are refused as "not a picture" (the meme's own bound).
- Relay: refuses an oversized body as soon as it passes the limit **or declares it will**
  (`content-length`), answers 413 with `connection: close` (lessons/technical.md). The nginx block
  in `install.sh` and `HOSTING.md` now allows 3 MB bodies (it was 16 KB: every picture would have
  been refused by the proxy).
- Starting a chain with a picture costs **two** *create* tokens (picture + chain): 5 picture chains
  at once instead of 10, then one per 6 minutes. Accepted for friends; revisit if it bites.

### Evidence
cursus 40 (new: upload → chain → open over real HTTP and a DB scan for the bytes; 413 / too-many /
junk ids; 30-minute orphan sweep; pictures go with a takedown), tessera 58 (media seal/open, wrong
key, moved box), meme 45. Domi e2e: `pictures.spec.ts` 4 (photo shrunk to 1080 × 810 and its EXIF
marker gone from what the next stop holds; the POSTed box has no JPEG marker; GIF byte for byte in
a postcard; 2.1 MB GIF refused with the reason; not-a-picture; axe + 44 px on the controls),
`offline.spec.ts` +1 (picture meme queued offline, reload, sent once).
