# Review — feature/qa-polish (two QA agents' findings and what happened to each)

## Functional / accessibility QA
| # | Finding | Outcome |
|:--|:--|:--|
| B1 | Solve not saved when any person is tapped during the solving animation | Fixed: saved at the solving tap; ignored taps finish the animation with its remark. Regression e2e. |
| M1 | Chatterbox-greeted captain drawn half-greeted while sending his Moin | Fixed in `timeline.ts` (adds `amount`). Unit test. |
| M2 | Update toast covers the header, cannot be dismissed | Moved to the bottom, ✕ dismisses. |
| M3 | Fleeing gull is an invisible button over the header for ~3.8 s | `pointer-events: none` while startled. |
| M4 | Menu not modal; focus lost; win card steals focus | `inert` page, Tab cycle, focus return, no autofocus while the menu is open. Regression e2e. |
| M5 | Person buttons 40 px on small phones | Cell ≥ 48 px, padding ≤ 2 px. Regression e2e at 320 × 568. |
| M6 | Night banners unreadable | Night paintings in the menu at night. Regression e2e. |
| m1 | Focus lost between levels | Focus moves to the new level title. |
| m2 | Repeated announcements silent | Cleared and re-set on the next frame. |
| m3 | Slow IndexedDB → saved progress/theme/mute ignored | Late progress merged. The 50 ms first-paint flash remains (not fixed). |
| m4 | Two intros contradict their boards | Fixed lines (and market-09's title); every intro now tested against its board. |
| m5 | Daily does not roll over at midnight | Today recomputed when the menu opens. |
| m6 | Landscape / very short screens push the board below the fold | **Not fixed** — portrait-first game; noted. |
| m7 | Decor tab stops before the board; small gull hit boxes | Sky drawn above but tabbed after the board; 44 px gull targets. |
| m8 | Day mini stars 2.54:1 | Darker star ink. |
| p1 | Unearned star brighter than earned at night | Theme-aware fill. |
| p2 | Gull beak spot was Moin red | Now ochre. |
| p3 | 320 px: lanterns cut onlookers; kicker/title wraps | Five onlookers under 360 px. Title wrap remains. |
| p4 | Daily name shown twice | Kicker says "Today's harbour". |
| p5 | Hidden "Dismiss" read after every narrator line | Removed. |

## Feel / sound QA
| # | Finding | Outcome |
|:--|:--|:--|
| H1 | Win scrolls the page; small phones lose the board | Fixed sheet, no scroll; measured board top 254 → 254 and 240 → 240 at 375 × 667. |
| H2 | No win moment; card waits for a stray Moin; endless crowd hop | Wave + bells + haptic at the last smile, card +600 ms, hop × 3. |
| H3 | Captain half-greet tap: no feedback | Harrumph, pip pop, "Mo-" sound. |
| H4 | Bounce, theft, win, undo silent | Tok, squawk, bells, undo glide. |
| H5 | Chain tune swings 11 LU | Q 9 → 5 + trim: all notes −24.0 LUFS. |
| M1 | No haptics | Added (Android), muted with sound. |
| M2 | Horn loudest, squawk inaudible | Re-balanced + master compressor. |
| M3 | Fast chains smear; sounds late from rAF | Pre-scheduled on the audio clock; voices shortened to the gap. |
| M4 | Bubble pops, covers faces; fender hidden; theft loot unreadable | Pop-in/shrink-out, arc, trailing tail, fender raised, readable loot. Lead offset not done. |
| M5 | Smile reward small | Squash and stretch + glow. |
| M6 | Board edge 1.03:1 in daylight | Paper inner border + inner shade. |
| M7 | First tap slow; ignored taps silent; press flicker | Unlock on pointerdown; wiggle; held press state. |
| L1 | Long chains 5–6 s | Accelerando from the 4th Moin, capped 1.4×. |
| L2 | Skip snaps all faces at once | **Not done.** |
| L3 | Board pops in on flat colour | 200 ms fade-in. |
| L4 | Narrator time fixed; collides with the card | Length-based time; line moves into the card. |
| L5 | Chatterbox's second "moin" identical | −2 semitones, shorter, softer. |
| L6 | "Play again" wraps | `nowrap`. |

Test counts at merge: core 60, levels 62, narration 48, ui 52; e2e 26 (Chromium, `BASE_PATH=/MoinMoinMoin/`).
