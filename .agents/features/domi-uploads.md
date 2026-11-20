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
