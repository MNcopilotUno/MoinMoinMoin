# Feature: North German Monet (realistic scenes and northern dress)

## Problem
The owner asked for a "proper" design: Claude Monet's style, North German styling, realistic. The
first impressionist pass (`impressionist-art.md`) scattered random seeded dabs over a generic
*Impression, Sunrise* harbour: pretty, but nothing in it said Hamburg or the coast, and the
dabs did not follow any form. Design canvas (private to the owner):
<https://claude.ai/artifact/N3zJU1QZCrMm4FXdqUbT6X>.

## Design
- **Paint like a painter: underpainting, then brushwork.** `packages/assets/scripts/paint.js`
  (runs in the local Chromium, called by `render-art.mjs`) first draws a composed scene on a
  canvas — perspective, light, and a real reflection (the scene above the waterline mirrored and
  rippled). Then a brush pass (after Hertzmann's painterly rendering) covers it in seeded strokes,
  coarse to fine: each stroke takes the underpainting's colour, follows the edge it sits on
  (perpendicular to the luminance gradient), stops when the colour changes, and lies flat on the
  water. A share of strokes is broken towards lilac, peach and sage — Monet's broken colour.
- **Three parts of town, recognisably northern:**
  - *Harbour* — Speicherstadt brick warehouses with stepped gables, hoist beams and copper
    turrets; the Michel's verdigris spire; port cranes; a lighthouse; a green shrimp cutter
    (Krabbenkutter) with its net booms raised; moored dinghies.
  - *Market* — the fish auction hall: brick nave, great arched window, copper roof and dome;
    striped stalls along the quay.
  - *Ferry* — the dyke with a windmill, a thatched house and sheep; Strandkörbe on the sand; a
    container ship in the haze; the river ferry.
  - Each also as a nocturne: lamp-lit windows, moon, the lighthouse beam.
- **Red still means Moin.** The lighthouse is white with ink bands (not red and white), the brick
  is a dusty rose (`#A9604D`), the gull's beak spot is orange.
- **Northern dress for the cast** (`packages/ui/src/portrait.ts`): fisherman in a yellow
  sou'wester (Südwester) and oilskin (Friesennerz); captain in a navy Elbsegler cap with a gold
  cord; market woman in a blue dotted Kopftuch; kids in a yellow raincoat over a striped
  Fischerhemd.
- **Board pieces:** a herring gull (grey mantle, black wingtips, yellow beak with an orange spot)
  standing on a wooden mooring post (Dalben); the fender becomes a woven rope fender.
- **Bunting:** navy, paper, oilskin yellow, verdigris, sage — still no red.

## Risks
- **Re-renders are not byte-stable** across Chromium builds (`lessons/technical.md`); the
  committed JPEGs are the source of truth, and the script re-creates them closely, not exactly.
  This is art, not simulation: determinism of *gameplay* is untouched.
- **Image weight:** 6 paintings + 2 water textures, aimed at ≤ 300 KB each (precache budget).
- **Readability:** paintings are busier than before; header and cards keep paper backgrounds and
  the fog overlay still sits between painting and board.
- **Portrait size:** a sou'wester brim is wide; checked at the 44 px floor on a 320 px phone.

## Gaps
- Onlooker boats in the sky band (SkyLife) stay the old small boat.
- Set names stay English (CLAUDE.md §7: interface in plain English); the German words live in
  the paintings and the analysis, not in the UI.

## Test matrix
| Case | Expected |
|:--|:--|
| every role × mood portrait | well-formed SVG, ids prefixed |
| red means Moin | `#C8102E` only in smiles and a captain's received pips (unchanged test) |
| northern dress | fisherman has the sou'wester yellow, captain the navy cap + gold cord, market the blue scarf, kid the raincoat yellow and shirt stripes |
| gull sprite | no Moin red unless holding a stolen Moin |
| fender sprite | rotates `/` for rising, `\` for falling |
| board/app e2e (built) | all 26 journeys pass unchanged |
| paintings | 6 scenes + 2 water textures render; each JPEG ≤ 300 KB; looked at by eye in light and dark |
