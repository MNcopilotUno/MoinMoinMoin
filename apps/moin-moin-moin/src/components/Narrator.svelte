<script lang="ts">
  import type { Line } from '@moin/narration';
  import { copy } from '@moin/ui';

  interface Props {
    line: Line | null;
    /** Changes whenever a new line is spoken, even the same text later on. */
    key: number;
  }
  let { line, key }: Props = $props();

  /** Lines sit beside the play, auto-dismiss and never gate input (CLAUDE.md §8). */
  const SHOW_MS = 5200;
  let visible = $state(false);

  $effect(() => {
    void key;
    if (line === null) return;
    visible = true;
    const timer = setTimeout(() => (visible = false), SHOW_MS);
    return () => clearTimeout(timer);
  });
</script>

<div class="narrator" aria-live="polite">
  {#if visible && line}
    <button type="button" class="line" onclick={() => (visible = false)} title={copy.narratorDismiss}>
      <span class="text">{line.text}</span>
      <span class="visually-hidden">{copy.narratorDismiss}</span>
    </button>
  {/if}
</div>

<style>
  .narrator { min-height: 4.2rem; display: flex; align-items: flex-start; justify-content: center; padding: 0 16px; }
  .line {
    max-width: 30rem; min-height: 44px;
    border: 0; border-left: 5px solid var(--slate); border-radius: 4px 12px 12px 4px;
    background: var(--white); color: var(--deep);
    padding: 0.55rem 0.9rem; font: inherit; font-style: italic; text-align: left; cursor: pointer;
    box-shadow: 0 2px 0 var(--stone);
    animation: drift 0.35s ease-out;
  }
  @keyframes drift { from { opacity: 0; transform: translateY(6px); } }
  @media (prefers-reduced-motion: reduce) { .line { animation: none; } }
</style>
