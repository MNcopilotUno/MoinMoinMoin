# Feature: the play screen as drawn on the canvas

## Problem
The North German design canvas (<https://claude.ai/artifact/N3zJU1QZCrMm4FXdqUbT6X>, artboards
Main, Win, Night) reads better than the game in four places, all about telling the rules at a
glance on a phone:
- **Facing** is a 6 px paper triangle on the tile edge — easy to miss on a busy painting.
- **A captain's greetings** are two 3.5 px dots *inside* the portrait (18, 18 in a 200 box).
- **The chatterbox** is told apart only by speech marks drawn beside her head.
- **The win card** centres everything; the canvas puts title and stars on one line, the narrator's
  quote in its own tinted block, and the stats on one line — calmer and shorter.

## Design
- **Facing chip**: a 20 × 14 paper chip with an ink chevron, sitting on the edge the person faces
  (rotated for east and west). Same position as before, three times the area.
- **Pips as tile chips**: `PersonSprite` draws the captain's two greeting pips as HTML dots in
  the tile's top-left corner (10 px, ink ring, Moin red when filled — red means Moin) and asks
  the portrait for none. The newest pip still pops.
- **×2 badge**: ink chip, paper text, top-right of a chatterbox's tile. Decorative
  (`aria-hidden`): the button's label already says "chatterbox".
- **Narrator card**: a small ship's bell on the left of the line.
- **Win card**: left-aligned; title + stars on one row; "2 taps — that is par." below; quote in a
  tinted block; buttons unchanged. Copy unchanged.

## Risks
- Chips sit outside the tile by 8 px: at 48 px cells the cell padding is 2 px, so a chip may
  overlap the neighbouring cell's edge — as the triangles did. Checked at 320 × 568 on 7 × 7.
- Pips moved out of the portrait SVG: onlookers already draw portraits with `pips: false`.

## Test matrix
| Case | Expected |
|:--|:--|
| captain, 0 / 1 / 2 greetings | 2 pip chips; 0 / 1 / 2 filled; portrait SVG has no pips |
| fisherman | no pip chips, no badge |
| chatterbox | `×2` badge, `aria-hidden` |
| facing E | chip present, class `facing-E` (unchanged hook) |
| e2e (built) | all journeys pass; 7 × 7 at 320 px still ≥ 44 px buttons |
