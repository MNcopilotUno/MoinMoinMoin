# Feature: the public feed (A8)

## Problem
The owner wants Domi to work "as a micro social network" and chose, of the options, a public
feed: memes anyone can see.

## Design
- **A third kind in *How it travels***: *A chain*, *Just send*, **Post publicly**. Choosing it shows
  plainly: *Anyone can see this, for 30 days. It is not encrypted: the relay can read it.*
- **What can be posted**: a meme from the cast, the paintings or the open-licensed library, with
  captions and an optional nickname. **Not an uploaded photo** (A8); the button says why.
- **Relay**: `POST /v1/posts { content }` (the meme as JSON, ≤ 2 KB, own rate limit: 5 at once,
  then one per 10 minutes), `GET /v1/posts?before=<seq>` (20 newest, not hidden, not expired),
  `GET /v1/posts/<id>`. Posts expire 30 days after their day. No author, no address stored.
  The relay checks only that the content is a JSON object within size; **every phone validates
  each post with the strict meme check** and skips what fails (a hostile client could post junk).
- **Operator**: `node src/cli.ts hide <postId>` (and `takedown` removes it).
- **In the app**: Home gets *The public feed*; the Feed screen shows the newest memes with
  nickname and day, *Load more*, *Share* (the post's link `…/domi/p/<id>`) and *Report* on each.
  A shared post link opens that post. The 404 page learns `/domi/p/<id>` like `/domi/m/<id>`.
- **Not**: likes, follows, comments, search, ranking, profiles — the owner chose the feed alone.

## Risks
- Abuse in captions: report + hide; no automatic filter.
- A popular post link reaches the home server directly — rate limits per address apply to reads.
- The public page is not end-to-end encrypted by definition; the app must never mix private
  content into a post (the post is built from the meme value, which has no keys for public kinds).

## Test matrix
| Happy day | Bad weather |
|:--|:--|
| post → appears at the top of another phone's feed; post link opens it; load more pages back; expired posts gone; hidden posts gone | a post with an uploaded picture refused (app and relay); non-JSON or > 2 KB refused; 6th post in a burst → slow-down; invalid meme JSON in the feed skipped on the phone; report mail carries the post link |

## As built (2026-11-20, `feature/domi-feed`)
- *How it travels* has three kinds: *A chain*, *Just send*, **Public**. Public hides the link
  choices (there is no key and no password), shows a gold card saying what public means, and
  refuses a meme with the person's own picture with the reason (`isPublishable`). Not queued
  offline: posting is deliberate and needs the network.
- Relay: `posts` table (`seq` autoincrement, relay-chosen 8-character id, `day`, `expiresDay`,
  `content`, `hidden`); `post` rate kind 5 at once then 1 per 10 min — refused posts spend it too;
  `publicMeme()` checks a JSON object ≤ 2 KB without `image` (`422 not-public`). Swept with the rest.
  `cli.ts hide <postId>`; `takedown <postId>` deletes a post.
- App: Home's third choice *The public feed*; `Feed.svelte` lists 20 a page with *Load older posts*,
  nickname and age, *Share* (or *Copy link*) and *Report* (mail with the post's link, DSA Art. 16).
  `…/domi/p/<id>` opens that post first (404 page → `?p=<id>`, the worker's navigation fallback
  serves the app for it when installed). Each post is checked with `toMeme` on the phone; junk is
  skipped. About gained *The public feed* (Art. 14); Home's foot no longer says "no feed".

### Evidence
cursus 44 (feed paging, picture refused, hide/expire/takedown, the burst limit), Domi e2e
`feed.spec.ts` 6 (post → top of another phone's feed with nickname; report mail carries the post
link; post link through the 404 page; unknown post gone; own picture refused; junk skipped and
paging with exactly two reads; without a relay; axe + 44 px on Rules-public, Feed and Home).
