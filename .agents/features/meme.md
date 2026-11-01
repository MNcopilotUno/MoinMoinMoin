# Feature: the meme value (`packages/meme`)

## Problem
Tessera seals bytes; the app needs a meme those bytes stand for, and it must treat every
decrypted hop as hostile input (any chain member can post any bytes). The turn rules (D3–D5)
need one pure place to live that tests can reach.

## Design
- `Meme` = `{ v: 1, who, where, top, bottom, bubble, gull, mood, nick, budget }`. `budget` (D3,
  1–3) is a chain rule the relay cannot see, so it travels sealed in every hop; a turn may not
  change it. `who` is our cast only
  (D1: captain, fisherman, market woman, kid, chatterbox); `where` is one of the four night
  paintings; captions ≤ 140 characters, tidied (one space, no control characters) (D2).
- **Touches (D4)**: the Moin bubble (none / *Moin* / *Moin moin*), the gull on or off, and the
  face's mood (grumpy / smiling). The bubble's **colour is not a touch**: red means Moin — this
  answers the open D4 question the conservative way until the owner says otherwise.
- `toMeme` validates strictly (unknown fields, versions, lengths, types, untidy text all throw);
  `decodeMeme` adds JSON and fatal UTF-8.
- `checkTurn(before, after, budget)`: the cast member and place stay; words are swapped **in
  place** (same word count per caption) up to the budget; at most one touch; unchanged is fine
  (D5). The nickname belongs to the new hop and is not compared. Client-enforced (§3).

## Risks
- Swapping in place forbids "When the *old* captain" (adding a word). Predicted to keep the game
  legible; revisit after the S1 playtest.
- Mood as a touch is new (D4 says "and similar"); the design canvas shows bubble and gull only.

## Test matrix
| Happy day | Bad weather |
|:--|:--|
| bytes round trip; 140 emoji count as 140; unchanged, one word, one touch, word + touch pass | not JSON, bad UTF-8, array, null, v2, unknown field, unknown cast/place, recoloured bubble, 141 characters, non-text, untidy, control character, long nickname, string gull, missing mood; two words at budget 1, two touches, new cast/place, added word |
