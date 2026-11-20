# Likes on the public feed (A9)

## Problem
The owner asked for "public feed with like reactions". Domi has no accounts; the feed must stay
unranked (MOIN_DOMI §8) and the relay must keep no addresses.

## Design
- **The like is a Moin.** Under each post: a red *Moin* bubble with the count. Tap → you said Moin
  (pressed); tap again → taken back. Red stays reserved for Moin (CLAUDE.md §7), so no heart.
- **One per phone, revocable, no identity.** The phone makes a random 128-bit token per post it
  likes (`newSecret`) and keeps `{postId → token, day}` in IndexedDB (dropped after 31 days, when
  the post is gone anyway). The relay keeps `likes(postId, tokenHash)` with `tokenHash = SHA-256`;
  the same token twice counts once; *unlike* needs the token.
- **Relay**: `POST /v1/posts/<id>/like { token, on }` → `{ likes }`. 404 for a hidden, expired or
  unknown post. Rate kind `write` (60 at once, then one per 10 s). Posts in `GET /v1/posts` and
  `GET /v1/posts/<id>` carry `likes` (a count). Likes go with their post (expiry, takedown).
- **Order never changes**: `seq DESC`, as before.
- **Offline**: the button is disabled with the feed's offline line; no queue (a like is not worth one).

## Risks
- Inflating a count with fresh tokens — bounded by the rate limit; accepted (a count, not money).
- A like reveals nothing about the liker to the relay beyond the request itself, which is not logged.
- "Forget everything on this phone" forgets the tokens: those likes stay counted but can no longer
  be taken back from this phone. Said in the review; acceptable.

## Test matrix
| Happy day | Bad weather |
|:--|:--|
| like → count 1 on another phone; like again (same token) → still 1; unlike → 0; the feed's order unchanged by likes; the like survives a reload (token kept); likes deleted with the post | like on a hidden/expired/unknown post → 404; token not 22 base64url → 422; unlike with another token → count unchanged; `on` not boolean → 422; offline → disabled |

## As built (2026-11-20, `feature/domi-likes`)
As designed. The button is a pill: the Moin bubble (outlined in red, filled once you said it) and
the count; its accessible name says the action, that it is a like, and the count. Shown at once,
corrected by the relay's answer, put back with a line if it fails. Tokens live in IndexedDB `kv`
under `likes`; *Forget everything* drops them.

### Evidence
cursus 45 (same token counts once, another token cannot take a like back, counts on list and
single post, order unchanged, no token in the database file, hidden/unknown → 404, junk → 422,
likes deleted with a takedown); Domi e2e `feed.spec.ts` 7 (like, reload keeps it, another phone
makes it 2, newest first regardless, take it back; axe with the buttons); all Domi e2e 40/40.
