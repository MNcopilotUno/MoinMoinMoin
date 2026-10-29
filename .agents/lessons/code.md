# Lessons — code

- **`position: fixed` inside a transformed ancestor is not fixed.** A sheet centred with
  `transform: translateX(-50%)` turns its fixed confirm dialog into an absolute child of a scroll
  container. Centre fixed sheets with `left: 0; right: 0; margin-inline: auto`.
- **An app setting for reduced motion needs a selector, not a media query.** Svelte's scoped CSS
  can't toggle `@media`; `:global(:root[data-calm]) .x` can, and the app sets `data-calm` from
  the setting or, until touched, the phone's `prefers-reduced-motion`.
