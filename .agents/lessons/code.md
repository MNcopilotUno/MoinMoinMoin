# Lessons — code

- **`position: fixed` inside a transformed ancestor is not fixed.** A sheet centred with
  `transform: translateX(-50%)` turns its fixed confirm dialog into an absolute child of a scroll
  container. Centre fixed sheets with `left: 0; right: 0; margin-inline: auto`.
- **An app setting for reduced motion needs a selector, not a media query.** Svelte's scoped CSS
  can't toggle `@media`; `:global(:root[data-calm]) .x` can, and the app sets `data-calm` from
  the setting or, until touched, the phone's `prefers-reduced-motion`.

## Svelte state is a Proxy, and IndexedDB will not clone it (2026-11-01, Moin Domi)
Storing an object taken from `$state` (`put(screen.item)`, or `{ ...item }` whose nested `meme` is
still a Proxy) throws `DataCloneError`. The storage helper swallowed request errors, so the
outbox entry simply never existed: the "Waiting to send" screen showed, and nothing was ever
sent. Found only by the offline e2e test. Fix: the one storage module stores
`JSON.parse(JSON.stringify(value))` — the data is plain JSON by design.

## "online" is a promise, not a fact (2026-11-01, Moin Domi outbox)
The outbox sent on the `online` event and gave up on the first network error. In Firefox CI the
event came before a fetch could get through, so a chain made offline stayed queued forever; real
phones do the same on captive portals and waking radios. Now: an "offline" failure while
`navigator.onLine` is true retries itself with backoff (2 s → 60 s). Test: abort the relay's
first answer while online and see the chain go out by itself.

**Correction, same day.** The backoff above was a guess; CI failed again. The Firefox trace
showed no request at all after reconnecting: the `online` event never reached a page loaded
offline, and the backoff only starts once the browser says it is online. Now the outbox also
looks every 5 s while it holds something. Read the trace before writing the fix.
