# Feature: Moin Domi on the home screen, and in the share sheet

## Problem
Moin Domi is a sharing app as much as a game (owner, 2026-10-31). Links arrive in messengers; on
a phone the natural move is *Share → Moin Domi*, not copying a URL into a browser. And a sharing
app you use every week belongs on the home screen.

## Design
- **Its own icon** (`packages/assets/icons/domi/`, original): two meme cards passed along after
  dark, the front one with a lamp-gold moon and harbour waves, the red Moin bubble on top. Black,
  lilac, paper, gold; red only for the bubble. Maskable variant with the drawing in the safe zone.
  Rendered with the existing `pnpm --filter @moin/assets icons`.
- **Web manifest** (vite-plugin-pwa): *Moin Domi*, standalone, portrait, black, scoped to
  `/domi/`. The puzzle keeps its own manifest; the two install separately.
- **Share target** (`GET`, action `./`, params `share-title`, `share-text`, `share-url`): Android
  hands over whatever the messenger shared — often a sentence with the link inside. The app finds
  the first `…/m/<id>#<key>` (or `?m=` form) in url, text, title, opens it like a tapped link and
  cleans the address. Nothing Moin-like → *No Moin in that*, with the reason (the key is the part
  after `#`).
- iOS: apple-touch-icon and standalone metas (Safari has no share target; *Add to Home Screen*
  still works).

## Risks
- **Share targets exist only in installed PWAs on Android Chrome/Edge**; iOS and desktop never
  show Moin Domi in the share sheet. Predicted acceptable: the link still opens by tapping it.
- A messenger that drops the fragment when sharing would hand over a link without its key → *No
  Moin in that*. *(predicted, check on a real phone with two messengers)*.
- A link from another host (a self-hosted Domi) is opened against *this* app's relay → not found
  → Gone. Acceptable while there is one deployment.

## Test matrix
| Happy day | Bad weather |
|:--|:--|
| manifest with name, standalone, black, scope and the share target; every icon answers 200; a sentence with a link opens the turn and the address is cleaned | shared text with no link → *No Moin in that* |
