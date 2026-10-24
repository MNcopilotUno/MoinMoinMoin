<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    onclick: () => void;
    pressed?: boolean | undefined;
    disabled?: boolean;
    children: Snippet;
    /** The button element, for returning focus to it. */
    element?: HTMLButtonElement | null;
  }
  let { label, onclick, pressed = undefined, disabled = false, children, element = $bindable(null) }: Props = $props();
</script>

<button bind:this={element} type="button" class="icon-button" aria-label={label} title={label} aria-pressed={pressed} {disabled} {onclick}>
  {@render children()}
</button>

<style>
  .icon-button {
    min-width: 44px; min-height: 44px; padding: 0;
    display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem;
    border: 1.5px solid var(--line, rgba(30, 43, 76, 0.75)); border-radius: 50%;
    background: var(--card, rgba(251, 246, 234, 0.84)); color: var(--ink, #1e2b4c);
    -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
    font: inherit; font-weight: 700; cursor: pointer;
    box-shadow: 0 3px 10px var(--shadow, rgba(30, 43, 76, 0.18));
    touch-action: manipulation;
  }
  .icon-button:active:not(:disabled) { transform: scale(0.94); }
  .icon-button:disabled { opacity: 0.45; cursor: default; }
  .icon-button:focus-visible { outline: 3px solid var(--ink, #1e2b4c); outline-offset: 3px; }
  .icon-button :global(svg) { width: 20px; height: 20px; stroke-width: 1.8; }
</style>
