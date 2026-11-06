# Review — feature/side-by-side (adversarial)

## Findings
1. **Where to put it without breaking the ten-second rule.** A landing page with both apps would
   have put a menu before level 1 (CLAUDE.md §1). *Chosen*: the level menu, which a player opens
   on purpose; the cold open is unchanged.
2. **A link inside a modal with a focus trap**: the trap cycles first/last focusable elements;
   the new link sits between them, so the cycle still holds. Covered by the full puzzle suite
   (level-menu modal test).
3. **The puzzle's precache does not include Domi** (by design, `/domi/` is denylisted), so the
   card's link needs the network the first time even when the puzzle is offline-ready — hence the
   offline text. Once Domi was opened, its own worker serves it offline; the card still says
   "needs the internet" then. *Accepted* (it cannot know whether Domi's worker is installed
   without a request).
4. **Black in a light menu**: deliberate, Domi's identity; contrast of `#c9c3e2` on black is 12.4:1.
5. The puzzle's name in Domi comes from `GAME_NAME`, keeping §2's rule on where the name appears.

## Evidence
Puzzle bridge spec 2/2 (new: the level-menu card, offline); Domi e2e 28/28 (new: back to the
puzzle; Home re-audited by axe); both typechecks 0/0; full puzzle suite in the merge run.
