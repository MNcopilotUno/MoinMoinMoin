<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    onclick: () => void;
    pressed?: boolean | undefined;
    disabled?: boolean;
    children: Snippet;
  }
  let { label, onclick, pressed = undefined, disabled = false, children }: Props = $props();
</script>

<button type="button" class="icon-button" aria-label={label} title={label} aria-pressed={pressed} {disabled} {onclick}>
  {@render children()}
</button>

<style>
  .icon-button {
    min-width: 44px; min-height: 44px; padding: 0 0.6rem;
    display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem;
    border: var(--outline, 3px) solid var(--ink, #1c2333); border-radius: 12px;
    background: var(--white, #fff); color: var(--ink, #1c2333);
    font: inherit; font-weight: 700; cursor: pointer;
    box-shadow: 0 3px 0 var(--ink, #1c2333);
    touch-action: manipulation;
  }
  .icon-button:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 1px 0 var(--ink, #1c2333); }
  .icon-button:disabled { opacity: 0.45; cursor: default; }
  .icon-button:focus-visible { outline: 3px solid var(--royal, #2346b8); outline-offset: 3px; }
  .icon-button :global(svg) { width: 22px; height: 22px; }
</style>
