# Feature: impressionist art direction ("a touch of Monet")

## Problem
The owner asked for a new art style: a *little* Claude Monet impressionism, while staying stylish
and realistic enough to read faces and details. The first canvas sketch used blurry CSS ovals and
small flat faces and was rightly rejected as not nice. Sketch: Claude Design canvas
<https://claude.ai/artifact/QxeLYGuqYwX6WmKqmmSoKk> (private to the owner).

## Design
- **Paintings, generated:** `packages/assets/scripts/paint.ts` lays down thousands of short,
  seeded brush strokes — a lilac-to-peach morning sky, a low orange sun (the *Impression, Sunrise*
  nod), a hazy far shore with lighthouse and cranes, and water of short horizontal strokes with
  the sun's broken reflection. One painting per part of town: harbour (boats), market (striped
  stalls on the quay), ferry (the morning ferry). Rendered once to JPEG with the local Chromium and
  committed (≈100–150 KB each); the generator is deterministic, so they can be re-rendered
  exactly. Also a painted water texture for the board and a plank texture for the pier tiles.
- **Portraits, not icons:** `packages/ui/src/portrait.ts` draws each person as a small gouache
  portrait — shaped head with soft shading clipped to it, almond eyes with iris, pupil and
  catchlight, lids that drop when grumpy, hair-stroke brows, a shaded nose, real lips (Moin red
  only when smiling), and role detail: ribbed beanie and cable knit with stubble; peaked cap,
  brass anchor and full white beard; polka-dot headscarf, earrings, lilac cardigan and apron;
  tousled hair, freckles, Breton stripes. Three skin tones. Eyes and features turn toward the
  facing direction. A light displacement wobble and paper grain give the hand-painted edge.
- **Type:** Cormorant Garamond (titles, narrator, *Moin* in the bubble) and Figtree (counts,
  buttons), self-hosted from `@fontsource` (OFL-1.1) — never fetched from a CDN.
- **Palette:** harbour ink `#1E2B4C` replaces black outlines; paper `#FBF6EA`; Moin red `#C8102E`
  stays the only red. Stars turn ochre-gold so they never read as Moin.
- **Layout:** full-bleed painting behind everything; header = place/level kicker with round
  paper buttons, then a serif title over the sky; the board is painted water floating on the
  painted harbour; narrator and win card are translucent paper cards.

## Risks
- Image weight in the precache (≈0.5 MB with fonts). Acceptable for an installable PWA; checked
  in the build output.
- SVG filters (displacement, blur) on up to 16 portraits can cost frame time on old phones
  *(predicted)*; portraits do not animate, only the bubble moves.
- Contrast: text sits over a painting; header and cards keep ≥ 4.5:1 via ink colour and paper
  backgrounds.

## Test matrix
| Case | Expected |
|:--|:--|
| portrait for each role × mood | valid SVG, unique ids per instance, role features present |
| red only for Moin | `#C8102E` appears in a portrait only when smiling (or a received captain pip) |
| facing | pupils shift toward the facing direction |
| determinism | same inputs → identical SVG string |
| board | still one labelled button per person, gull and fender images, Moin at sub-unit position |
| app e2e (built) | all existing journeys pass: cold open, 30 levels, select, daily, offline, update |
| fonts offline | woff2 files precached; no request leaves the origin |
