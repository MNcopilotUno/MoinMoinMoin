# Review — feature/chatterbox

| # | Finding | Severity | Outcome |
|:--|:--|:--|:--|
| 1 | The wider "Moin moin" SVG set its own width to 166 % inside a one-cell container that is centred with `translate(-50%)`: the bubble would hang off to the right of the flight path. | major | Board widens the container instead; the SVG stays 100 %. |
| 2 | A 1.0 reader would accept `chatterbox` as an unknown-but-allowed field if the schema were lax, and play a different puzzle. | major | Validator requires `formatVersion` ≥ 1.1.0 for chatterboxes; fixture `chatterbox-old-version.json`. |
| 3 | `greeted.greetings` used to be "previous + 1"; it is now capped at `needs`. Anything counting greetings from events would under-count a chatterbox into a fisherman. | minor | Event carries `amount` and the capped `greetings`; GAME_RULES §5 documents both. |
| 4 | The golden replay file changed. | note | Rule change (R13); scenario extended with a chatterbox waking a captain so all three engines cover it. |
| 5 | Narration: "chatterbox" outranks "long chain"; a 5-person chain that also includes a chatterbox wake gets the chatterbox line. | note | Intended: the new mechanic is the rarer, more remarkable event. |

Test counts at merge: core 60, levels 33 (14 fixtures), narration 17, ui 22.
