# Feature: a crowded, living harbour and the night harbour (dark mode)

## Problem
The owner: "the game should be more crowded and interactive, full of assets, and add dark mode".
The board floated on a lot of empty painting; nothing but the puzzle responded to touch.

## Design
- **Crowd on the quay** (`ui/Onlookers.svelte`): seven townsfolk drawn with the portrait painter
  (no captain pips — they are not in the puzzle), behind a wooden rail, with lanterns, crates, a
  barrel and coiled rope. They react to the same events as the narrator: each smile on the board
  makes the next onlooker hop and beam; a solved level sets the whole quay celebrating. Poking an
  onlooker makes them wave and say "Moin!" (a real Moin, so it is red).
- **Sky life** (`ui/SkyLife.svelte`, `ui/Bunting.svelte`): bunting across the sky (no red flags),
  three gulls gliding by — tap one and it squawks and flees — and a little sailboat bobbing at the
  horizon that toots.
- **Water ripples** (`ui/Board.svelte`): touching open water on the board ripples it.
- **All of it is decoration:** it never calls `tap`, never counts, and never decides anything. The
  board's own seagulls and fenders stay non-buttons (R1 and the a11y test).
- **Sounds** (`assets/sfx.ts`): synthesised gull squawk and boat horn; onlookers say Moin at their
  own pitch. Muted with the game.
- **Night harbour:** the painter gained a `night` palette — indigo sky with stars, a pale moon and
  its silver path, lit windows on the shore with warm wobbling reflections, a lit ferry. Three
  nocturnes plus night water are rendered and committed. Theme roles invert (`--ink` text/lines,
  `--paper`/`--card` surfaces); Moin red stays Moin red. The phone's preference applies before any
  JS (CSS media query); the app then sets `data-theme` from the setting (Auto / Day / Night, in the
  level-select menu, stored in IndexedDB).

## Risks
- Precache grows to ≈ 1.3 MB with the nocturnes. Needed for offline in either theme.
- More animation: all ambient motion is CSS transform/opacity and stops under reduced motion.
- Ambient buttons in the tab order: placed after the board, so keyboard play reaches people first.

## Test matrix
| Case | Expected |
|:--|:--|
| onlookers | 7 labelled buttons; poke → onpoke(i), "Moin!", waving |
| cheer counter | one onlooker per smile; celebrate → every face smiling |
| water touch | ripple, `ontap` not called; touching a person: no ripple |
| gulls / boat | shoo → one squawk (not twice while fleeing); boat → horn |
| e2e crowd | poking crowd, boat, gull, water: still "0 taps"; quay celebrates on solve |
| e2e dark | phone dark → `data-theme=dark`, night painting, dark tokens; Day in menu → light, survives reload; Night → dark |
| no sideways scroll | `scrollWidth ≤ innerWidth` on a phone |
