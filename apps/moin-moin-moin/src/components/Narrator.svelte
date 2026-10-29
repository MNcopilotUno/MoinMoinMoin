<script lang="ts">
  import type { Line } from '@moin/narration';
  import { copy } from '@moin/ui';

  interface Props {
    line: Line | null;
    /** Changes whenever a new line is spoken, even the same text later on. */
    key: number;
  }
  let { line, key }: Props = $props();

  /** Lines sit beside the play, auto-dismiss and never gate input (CLAUDE.md §8); longer lines
   *  stay longer (QA feel L4). */
  const showMs = (text: string) => Math.min(6200, Math.max(3200, 2200 + 230 * text.split(/\s+/).length));
  let visible = $state(false);

  $effect(() => {
    void key;
    if (line === null) return;
    visible = true;
    const timer = setTimeout(() => (visible = false), showMs(line.text));
    return () => clearTimeout(timer);
  });
</script>

<div class="narrator" aria-live="polite">
  {#if visible && line}
    <button type="button" class="line" onclick={() => (visible = false)} title={copy.narratorDismiss}>
      <svg class="bell" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v2M7 17v-6a5 5 0 0 1 10 0v6l2 2H5z" /><path d="M10 21h4" /></svg>
      <span class="text">{line.text}</span>
    </button>
  {/if}
</div>

<style>
  .narrator { min-height: 5rem; display: flex; align-items: flex-start; justify-content: center; padding: 0 16px; }
  .line {
    width: 100%; max-width: 30rem; min-height: 44px;
    border: 0; border-radius: 18px;
    background: var(--card); color: var(--ink);
    -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px);
    padding: 0.8rem 1.1rem; text-align: left; cursor: pointer;
    display: flex; align-items: center; gap: 0.75rem;
    font-family: var(--serif); font-style: italic; font-weight: 500; font-size: 1.3rem; line-height: 1.25;
    box-shadow: 0 8px 20px var(--shadow);
    animation: drift 0.35s ease-out;
  }
  .bell { width: 24px; height: 24px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; opacity: 0.8; }
  @keyframes drift { from { opacity: 0; transform: translateY(6px); } }
  /* Calm motion: the setting, or the phone's reduce-motion (settings.md). */
  :global(:root[data-calm]) .line { animation: none; }
</style>
