# Feature: more to make memes from

## Problem
The owner asked for more meme content. Five faces and four places run out quickly in a chain of
six; D4 lists touches "and similar" beyond the bubble and the gull.

## Design
- **Cast** (D1, our own only): + *the harbour master* (captain's portrait, darker skin tone),
  + *the net mender* (the market woman's portrait, another tone), + **the gull as the star** — the
  cast's cheeky villain drawn large instead of a portrait. Picker: two rows of four.
- **Place**: + *the open water* (the existing water nocturne). Bridge from the puzzle: *When the
  whole North Sea…* if a level ever names it.
- **Weather, a touch** (D4 "and similar"): clear, rain, fog, or the lighthouse beam, drawn as
  an SVG layer between the painting and the face — deterministic (no random drops), and drawn the
  same into the saved PNG. In a turn it cycles clear → rain → fog → beam → clear and counts as the
  one touch. The beam is lamp gold, not red: red means Moin.
- **Compatibility**: `weather` is optional when reading (absent = clear), so memes stored before
  this open; a *new* cast member or place is refused by an older app (strict validation) — no
  relay is live yet, so no chain spans the two versions.

## Test matrix
| Happy day | Bad weather |
|:--|:--|
| every new cast member and the water place validate; weather is a touch; a meme without weather opens as clear | unknown weather refused; weather plus another touch in one turn refused |
