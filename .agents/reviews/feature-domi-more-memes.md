# Review — feature/domi-more-memes (adversarial)

## Findings
1. **Two new "people" reuse portraits** in other skin tones (harbour master, net mender). They are
   distinct in the picker and named differently, but a close look shows the same drawing. *Accepted*
   for now; a new role in `packages/ui/src/portrait.ts` is real art work (the puzzle shares it).
2. **Older apps refuse new content** (strict validation): an app cached before this deploy cannot
   open a meme with the gull as the star. With no relay live, nobody has such a chain; after
   launch, a content change like this needs the update prompt to have reached people first.
3. **Fog was nearly invisible** on the dark water painting. *Fixed* (thicker bands), checked by eye.
4. **Selector clash in my own screenshot script**: "Rain" also matched *A kid in a raincoat*. The
   app's labels are right; tests use exact names.

## Evidence
meme 37 tests; Domi e2e 25/25 on Chromium; typecheck 0/0; three new memes checked by screenshot.
