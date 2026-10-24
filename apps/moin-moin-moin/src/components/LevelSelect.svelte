<script lang="ts">
  import { onMount } from 'svelte';
  import { stars as starsFor } from '@moin/core';
  import type { Level, LevelSet } from '@moin/levels';
  import { copy, Stars } from '@moin/ui';
  import type { LevelProgress } from '../lib/progress';

  interface Props {
    sets: readonly LevelSet[];
    best: Readonly<Record<string, LevelProgress>>;
    daily: { day: string; level: Level } | null;
    /** Id of the level being played, highlighted. */
    current: string;
    onpick: (index: number) => void;
    ondaily: () => void;
    onclose: () => void;
  }
  let { sets, best, daily, current, onpick, ondaily, onclose }: Props = $props();

  const starsOf = (l: Level): 0 | 1 | 2 | 3 => (best[l.id] ? starsFor(best[l.id]!.bestTaps, l.par) : 0);
  const total = $derived(sets.reduce((n, s) => n + s.levels.reduce((m, l) => m + starsOf(l), 0), 0));
  const max = $derived(sets.reduce((n, s) => n + s.levels.length * 3, 0));

  let dialog: HTMLElement;
  onMount(() => {
    dialog.querySelector<HTMLElement>('[aria-current="true"]')?.focus();
  });

  function keydown(event: KeyboardEvent) {
    if (event.key === 'Escape') onclose();
  }
</script>

<svelte:window onkeydown={keydown} />

<div class="backdrop" role="presentation" onclick={onclose}></div>
<div class="select" role="dialog" aria-modal="true" aria-labelledby="select-title" tabindex="-1" bind:this={dialog}>
  <header>
    <h2 id="select-title">{copy.levelsTitle}</h2>
    <span class="total" data-testid="star-total">★ {copy.starTotal(total, max)}</span>
    <button type="button" class="close" onclick={onclose} aria-label={copy.close}>✕</button>
  </header>

  {#if daily}
    <button type="button" class="daily" onclick={ondaily}>
      <strong>{copy.daily}</strong>
      <span>{copy.dailyHint(daily.day)}</span>
      {#if starsOf(daily.level) > 0}<Stars count={starsOf(daily.level)} size="1rem" />{/if}
    </button>
  {:else}
    <p class="note">{copy.dailyUnavailable}</p>
  {/if}

  {#each sets as set, s (set.id)}
    {@const got = set.levels.reduce((n, l) => n + starsOf(l), 0)}
    <h3>{set.title} <span>{copy.starTotal(got, set.levels.length * 3)}</span></h3>
    <ol class="tiles">
      {#each set.levels as l, i (l.id)}
        {@const n = starsOf(l)}
        <li>
          <button type="button" class="tile" class:solved={n > 0} aria-current={l.id === current ? 'true' : undefined}
            aria-label={copy.levelTile(i + 1, l.title, n)} onclick={() => onpick(sets.slice(0, s).reduce((n, x) => n + x.levels.length, 0) + i)}>
            <span class="no">{i + 1}</span>
            <span class="mini" aria-hidden="true">{'★'.repeat(n)}{'☆'.repeat(3 - n)}</span>
          </button>
        </li>
      {/each}
    </ol>
  {/each}
</div>

<style>
  .backdrop { position: fixed; inset: 0; background: rgba(28, 35, 51, 0.35); z-index: 30; }
  .select {
    position: fixed; z-index: 31; left: 50%; top: max(12px, env(safe-area-inset-top)); transform: translateX(-50%);
    width: min(calc(100vw - 24px), 30rem); max-height: calc(100dvh - 24px); overflow-y: auto;
    background: var(--white); border: var(--outline) solid var(--ink); border-radius: 20px; box-shadow: 0 6px 0 var(--ink);
    padding: 0.8rem 1rem 1.1rem;
  }
  header { display: flex; align-items: center; gap: 0.6rem; }
  h2 { margin: 0; font-size: 1.25rem; }
  .total { margin-left: auto; font-weight: 700; color: var(--royal); font-size: 0.9rem; }
  .close {
    min-width: 44px; min-height: 44px; border: 0; background: transparent; font-size: 1.2rem; cursor: pointer; color: var(--ink);
  }
  h3 { margin: 1rem 0 0.4rem; font-size: 1rem; display: flex; justify-content: space-between; }
  h3 span { font-weight: 600; color: var(--slate); font-size: 0.85rem; }
  .daily {
    width: 100%; margin-top: 0.6rem; min-height: 56px; display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;
    border: var(--outline) solid var(--ink); border-radius: 14px; background: var(--royal); color: var(--white);
    font: inherit; padding: 0.5rem 0.8rem; cursor: pointer; text-align: left;
  }
  .daily span { opacity: 0.9; font-size: 0.9rem; }
  .note { color: var(--slate); font-style: italic; }
  .tiles { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.45rem; }
  .tile {
    width: 100%; min-height: 52px; border: 2px solid var(--ink); border-radius: 12px; background: var(--fog);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
    font: inherit; font-weight: 800; cursor: pointer; color: var(--ink);
  }
  .tile.solved { background: var(--sand); }
  .tile[aria-current='true'] { outline: 3px solid var(--royal); outline-offset: 2px; }
  .tile:focus-visible, .daily:focus-visible, .close:focus-visible { outline: 3px solid var(--royal); outline-offset: 2px; }
  .mini { font-size: 0.7rem; color: var(--royal); letter-spacing: 1px; }
</style>
