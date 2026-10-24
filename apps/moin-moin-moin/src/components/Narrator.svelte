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
  .narrator { min-height: 5rem; display: flex; align-items: flex-start; justify-content: center; padding: 0 16px; }
  .line {
    width: 100%; max-width: 30rem; min-height: 44px;
    border: 0; border-radius: 18px;
    background: rgba(251, 246, 234, 0.9); color: var(--ink);
    -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
    padding: 0.8rem 1.1rem; text-align: left; cursor: pointer;
    font-family: var(--serif); font-style: italic; font-weight: 500; font-size: 1.3rem; line-height: 1.25;
    box-shadow: 0 8px 20px rgba(30, 43, 76, 0.18);
    animation: drift 0.35s ease-out;
  }
  @keyframes drift { from { opacity: 0; transform: translateY(6px); } }
  @media (prefers-reduced-motion: reduce) { .line { animation: none; } }
</style>
