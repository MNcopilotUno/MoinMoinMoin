# Moin Moin Moin — game rules v1 (grid-aligned flight)

> **Status:** v1, decided in the Phase 0 design round
> ([`.agents/features/physical-model.md`](../.agents/features/physical-model.md)). Every rule is
> **proposed** until the Phase 1 playtest, then **confirmed** or struck out.
> v1 keeps every v0 rule except R3, which is replaced by **R3′ (line of flight)**, and adds the
> fender (R11) and the timing model (R12). v0 is kept below as Appendix A, the fallback.

Normative. `packages/core` implements exactly this, and every rule below has a test in
`packages/core/test/`. A change here is a change to every level: re-run `pnpm validate:levels`.

---

## 1. The board

- A level is a grid, at most **7 × 7** (seven 44 px tap targets fit a 360 px phone screen).
- Each square is **empty water**, a **person**, a **seagull** or a **fender**. At most one thing
  per square.
- A person has a **facing** (N, E, S, W) and **needs** 1 or 2 greetings to smile.
  `needs: 2` is drawn as the grumpy captain.
- A fender has a **slant**: `rising` (drawn `/`) or `falling` (drawn `\`).
- A level has 1–16 people.

## 2. A tap

1. **R1 — Only people can be tapped.** Tapping empty water, a seagull or a fender does nothing
   and does not count.
2. **R2 — A smiling person cannot be tapped.** It does nothing and does not count.
3. Tapping a person who is not smiling gives them **one greeting** and counts as **one tap**.

## 3. How a Moin travels

1. When a person's received greetings reach `needs`, they **smile** and, after a short beat,
   send a *Moin* in the direction they face.
2. **R3′ — Line of flight.** The Moin flies straight over empty water until the next square in its
   way is not empty water. It reaches people at any distance, as long as nothing is in between.
3. A person reached this way receives one greeting, exactly as if tapped (but no tap is counted).
4. **R4 — Seagulls stay.** A Moin flying into a seagull's square is stolen and the chain ends.
   The seagull stays for the rest of the level.
5. A smiling person who is reached again smiles back. Nothing travels further.
6. **R5 — Greetings persist.** A grumpy person greeted once stays half-greeted (drawn with a
   half-smile) across later taps until a second greeting arrives. A Moin that leaves them
   half-greeted ends the chain (`waiting`).
7. Flying out over the board edge ends the chain (`edge`): the Moin is lost at sea.
8. **R11 — Fenders deflect.** A Moin reaching the centre of a fender square turns 90° and flies
   on: `rising` (`/`) turns E→N, N→E, W→S, S→W; `falling` (`\`) turns E→S, S→E, W→N, N→W.
   Fenders are never greeted and never stop a Moin.

**Termination.** Every person starts smiling at most once, and only that moment sends anything
onward, so a tap sends at most `people` Moins, one after another. A single flight cannot circle
forever: fender reflection is reversible, so a flight that began at a person cannot enter a loop
of water and fenders (see the design document). `core` caps a flight at `4 × width × height`
cell crossings and a property test shows the cap is never reached.

## 4. Time and space (R12)

- **R12 — Fixed step, integers only.** One cell is 12 sub-units; the simulation advances in ticks
  (60 per second); a Moin moves exactly one sub-unit per tick. A smile launches its Moin 9 ticks
  later from the centre of the smiling person's square. A Moin reaches a person or seagull at the
  **edge** of that square, a fender at its **centre**, and is lost at the board's outer edge.
- No floating point, no transcendental functions, no clock and no randomness in `core`.
  The same taps produce the same events, tick for tick, on every engine.

## 5. What core returns

`tap(game, state, x, y)` returns `{ state, events }`, where events are in the order they happen,
each with its tick `t`:

| Event | Meaning |
|:--|:--|
| `greeted(x, y, source: "tap" \| "moin", greetings, needs)` | a person received a greeting |
| `smiled(x, y)` | that greeting reached `needs` |
| `launched(x, y, dir)` | a Moin leaves that person |
| `bounced(x, y, dir)` | a Moin turned on a fender |
| `stolen(x, y)` | a seagull took it |
| `chainEnded(reason: "edge" \| "seagull" \| "alreadySmiling" \| "waiting")` | the chain is over |

Moin events also carry the sub-unit point `px, py`. Every chain ends with exactly one
`chainEnded`. An ignored tap (R1, R2) returns the same state and `[]`. The UI animates the list
and decides nothing.

## 6. Winning

1. A level is **solved** when every person smiles.
2. **R6 — No fail state.** There is no tap limit; you can always finish.
3. **R7 — Stars:** 3 at par, 2 at par + 1, 1 otherwise. Par is set by the solver (§8), never by
   hand.
4. **R8 — Undo and restart are free.** Undo reverts the last tap and its tap count. Because core is
   pure, undo is just the previous state.

## 7. A property worth knowing

**R9 — The order of taps does not matter.** Flight paths depend only on the static board, greetings
only add up, and each person fires once on reaching their threshold, so the final board depends
only on *how many times* each person was tapped, not in which order (the "abelian" property of a
sandpile model). `core` carries a fast-check property test that applies random tap sequences and
their shuffles and asserts identical final states. Puzzles are therefore about *where* to start
ripples, not *when*; if the playtest says that gets samey, the first mechanic added should be one
where order matters.

## 8. The solver

- Thanks to R9, the solver searches **tap counts per person** (0 … `needs`) rather than tap
  sequences, smallest total first. A person no Moin can ever reach must be tapped `needs` times,
  which prunes the search.
- It returns the minimum number of taps (par) and one solution.
- **R10 — Levels must have a unique-feeling answer.** The validator also reports how many minimum
  solutions exist and how many people can be tapped first on the way to a par finish. More than
  three minimum solutions on a level after the tutorial set is a warning, not an error.
- Because tapping everyone `needs` times always works, every level with at least one person is
  solvable. "Unsolvable" therefore means a level with no people.

## 9. Not in v1 (parking lot)

Ideas that need their own analysis document before they enter the rules: people who turn, a
chatterbox who says "Moin moin" and greets twice (Phase 2), a seagull that flies off after one
theft, a moving ferry. Each must keep chains terminating (§3), and any that makes order matter
must say so in R9.

---

## Appendix A — v0 (grid fallback)

Kept in case v1 is abandoned. Identical to v1 except:

- **R3 — Adjacent only.** The greeting reaches the next square, not the first person in line of
  sight. An empty square or the board edge ends the chain (`chainEnded(reason: "empty" | "edge" |
  "alreadySmiling")`).
- There are no fenders and no timing; events carry no `t`.
- Property test: no tap on any level produces more than `people + 1` events.
