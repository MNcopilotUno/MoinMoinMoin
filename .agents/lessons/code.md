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
