# Review — feature/domi-offline (adversarial)

Scope: Domi service worker, the outbox (offline create and pass-on), tree snapshots, the
*Your link* button on the tree, the update prompt, links opened offline. Feature doc:
`.agents/features/domi-app.md` (Offline).

## Findings
1. **The outbox never stored anything.** Svelte `$state` values are Proxies; IndexedDB's
   structured clone refuses them and `run()` swallowed the error. The screen said *Waiting for
   the tide* and nothing would ever be sent — and the same failure hit `putItem` for items taken
   from screen state (tree snapshots, finale status). *Fixed* in the one storage module (plain JSON
   copies); caught by the new e2e test; lesson in `code.md`.
2. **A link opened offline lost its key**: the address was cleaned before the open was tried.
   *Fixed*: on `offline` the link is put back (`replaceState(href)`); test added.
3. **The outbox keeps plaintext memes on the phone** until sent — the same data Yours already
   keeps; *Forget everything* clears the outbox too.
4. **Sending happens only while the app is open** (no Background Sync — Chromium only). Said on
   the *Waiting for the tide* screen; *accepted*.
5. **A queued turn can lose the race** for its stop while offline (branches full); it is kept with
   the relay's reason and *Discard*, never retried forever.
6. **The puzzle's worker also covers `/domi/`** (scope `/`). The narrower `/domi/` worker wins for
   Domi pages; before it installs the puzzle worker passes Domi requests to the network
   (navigation denylisted, no precache match). *Checked by reasoning, not by a test with both
   workers installed* — the e2e server serves Domi alone.
7. **The update prompt has no e2e test** (the puzzle's has one); it is the same `registerSW`
   pattern. *Gap*, noted.
8. Home and the finale now use the portrait night painting instead of the wide one, so the wide
   painting is neither precached nor needed.

## Evidence
e2e Domi **10/10** (Chromium): 7 earlier + 3 offline; `svelte-check` 0/0; lint clean.
