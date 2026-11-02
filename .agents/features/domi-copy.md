# Feature: Moin Domi's interface text in the shared copy module

## Problem
CLAUDE.md §7: "Copy lives in `packages/ui/src/copy/`." The puzzle follows it (`copy/en.ts`); Moin
Domi did not — every sentence, label, placeholder and alt text was written inline in its Svelte
screens, in `App.svelte`, and in `lib/flow.ts` (`errorText`, the report mail), `lib/look.ts`
(cast, places, weather, the meme description) and `lib/diff.ts` (what a touch changed). The owner
decided on 2026-11-01 that Domi follows the rule too.

## Design
- **`packages/ui/src/copy/domi.ts`** exports `domi` and `type DomiCopy`, in the style of `en.ts`:
  a plain `as const` object, small functions for interpolated sentences, grouped by screen
  (`home`, `create`, `rules`, `ready`, `turn`, `tree`, `finale`, `postcard`, `yours`, `gone`,
  `settings`, `about`, `unlock`, `queued`, `opening`, `update`, `report`, `errors`) plus the
  shared vocabulary (`common`, `lock`, `cast`, `places`, `weather`, `moods`, `bubble`, `meme`,
  `changes`, `bridge`).
- **The module imports nothing.** Functions take plain strings and numbers (or a structural
  `{ top, bottom }`), never a `@moin/meme` type, so `ui` gains no dependency. The type checker
  still ties the keyed tables to the meme vocabulary: `look.ts` assigns `domi.places` to a
  `Record<Where, string>`, so a new place without a name fails `typecheck`.
- **Subpath export** `@moin/ui/copy/domi` in `packages/ui/package.json`. Domi never imports the
  `@moin/ui` barrel: it pulls in the puzzle's `Scene` and every day painting
  (`.agents/reviews/feature-domi-polish.md`, finding 1).
- **Whole sentences.** A sentence is one entry. Where markup sits inside a sentence (`<strong>`
  in the Rules hint, `<em>` in About and in the postcard's "Moin from …") the entry is a tuple of
  parts `[before, marked, after]` kept together in one place, never fragments spread over keys.
- **Visible text is byte-identical.** The e2e suite asserts many exact strings with curly ’ and
  dashes. Where the markup had `{#if}` blocks around text, the text moves into a ternary; the
  only possible difference is whitespace at the edge of an element, which no screen shows and
  Playwright normalises.

## What stays where it is (not interface text)
- `lib/passphrase.ts` — the 256 German passphrase words: security data, not copy.
- URL shapes the router parses (`/m/<id>`), ids, CSS, `'en-GB'` date locales, internal
  `TesseraError` messages that `errorText` never shows (`'not a meme'`, `'take your turn first'`).
- The typographic quotes “ ” around the tree's caption, which wrap per-word `<strong>` marks of
  user data, and the `·` separators inside markup where they only separate two copy entries.

## Risks
- **A changed byte.** Moving ~200 strings by hand can drop a curly apostrophe or a space. The
  e2e suite catches the strings it asserts; for the rest, a script compares every string literal
  and text node of the old Svelte/TS files against `domi.ts` (review notes).
- **The barrel creeping back.** Importing `@moin/ui` instead of `@moin/ui/copy/domi` would still
  build and pass every test, and silently add the puzzle's paintings to Domi's precache. A unit
  test asserts `domi.ts` imports nothing; the import path is checked in review.
- **Parallel work on `en.ts`.** Another agent edits the puzzle's copy; this change does not touch
  `en.ts` or the barrel, so the two merge cleanly.

## Test matrix
| Happy day | Bad weather |
|:--|:--|
| Domi e2e (flow, locks, offline, update, a11y) passes unchanged, exact strings included | `domi.ts` gains an import → unit test fails |
| interpolated functions give the old sentences (stop counts, plurals, nick hints, the meme description) | a straight `'` where Domi writes ’ → unit test fails |
| `typecheck` 0/0 with `look.ts` tying `places`/`weather`/`cast` to the meme unions | an entry left empty → unit test fails |
