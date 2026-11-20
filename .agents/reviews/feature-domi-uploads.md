# Review — feature/domi-uploads (adversarial)

## Findings
1. **The proxy would have refused every picture.** The nginx block (`install.sh`, `HOSTING.md`)
   capped bodies at 16 KB. *Fixed*: 3 MB; Cursus keeps its own limit (2.2 MB). Caddy has no
   default cap. Nothing tests the proxy configs — `bash -n` only (as before).
2. **413 hung the connection** (lessons/technical.md). *Fixed* and stable over 4 full runs.
3. **A malicious hop can name another chain's picture id.** The box's AAD binds its chain id, so
   it does not open (tessera media test "moved box"); the meme shows black. *Fine.*
4. **Type of a picture is attacker-chosen** — but only from `IMAGE_TYPES` (JPEG/PNG/WebP/GIF), so
   no `image/svg+xml` blob with script can be made from a meme. *Fine*; keep the list closed.
5. **GIF metadata is not stripped** (comment blocks, XMP in application extensions). Documented as
   a risk; a GIF re-encoder would lose frames. *Open, low.*
6. **Two create tokens per picture chain** halve the rate for picture chains. *Accepted*, noted.
7. **Save image on a GIF downloads two files**; some browsers ask before a second download.
   *Accepted*: the still is first, so the main file always arrives.
8. **iPhone HEIC**: iOS converts to JPEG for an `accept` list without HEIC; not checked on a real
   iPhone (HANDOVER). *Open (predicted).*
9. **Picture never arrives** (offline, gone): the meme shows black with captions; the label still
   says "over their own picture". *Accepted.* It is retried on the next refresh.
10. **Who: 'none' with a painting** is now possible for every meme (captions over a painting) —
    deliberate, a plain template.
11. **Not yet**: the public feed's refusal of a picture meme (it is in `isPublishable`, used by the
    feed branch).

## Evidence
`.agents/features/domi-uploads.md` → As built. Unit: meme 45, core 60, tessera 58, narration 70,
levels 95, cursus 40, ui 92. Domi e2e (Chromium) 36/36 including pictures 4 and offline 6. Lint
and three typechecks clean.
