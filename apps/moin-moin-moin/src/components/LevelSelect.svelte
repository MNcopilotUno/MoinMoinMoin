<script lang="ts">
  import { onMount } from 'svelte';
  import { stars as starsFor } from '@moin/core';
  import type { Level, LevelSet } from '@moin/levels';
  import { copy, Stars } from '@moin/ui';
  import type { LevelProgress, ThemeSetting } from '../lib/progress';
  import harbourUrl from '@moin/assets/art/harbour.jpg';
  import marketUrl from '@moin/assets/art/market.jpg';
  import ferryUrl from '@moin/assets/art/ferry.jpg';

  const paintings: Record<string, string> = { harbour: harbourUrl, market: marketUrl, ferry: ferryUrl };

  interface Props {
    sets: readonly LevelSet[];
    best: Readonly<Record<string, LevelProgress>>;
    daily: { day: string; level: Level } | null;
    /** Id of the level being played, highlighted. */
    current: string;
    onpick: (index: number) => void;
    ondaily: () => void;
    onclose: () => void;
    theme: ThemeSetting;
    ontheme: (theme: ThemeSetting) => void;
  }
  let { sets, best, daily, current, onpick, ondaily, onclose, theme, ontheme }: Props = $props();
  const themes: ThemeSetting[] = ['light', 'auto', 'dark'];

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

  <fieldset class="theme">
    <legend>{copy.theme}</legend>
    {#each themes as t (t)}
      <label class:on={theme === t}>
        <input type="radio" name="theme" value={t} checked={theme === t} onchange={() => ontheme(t)} />
        {copy.themes[t]}
      </label>
    {/each}
  </fieldset>

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
    <div class="banner" style:--painting={`url(${paintings[set.id] ?? harbourUrl})`}
      style:--mist={1 - got / (set.levels.length * 3)}>
      <h3>{set.title} <span>{copy.starTotal(got, set.levels.length * 3)}</span></h3>
    </div>
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
  .backdrop { position: fixed; inset: 0; background: rgba(30, 43, 76, 0.32); z-index: 30; }
  .select {
    position: fixed; z-index: 31; left: 50%; top: max(12px, env(safe-area-inset-top)); transform: translateX(-50%);
    width: min(calc(100vw - 24px), 30rem); max-height: calc(100dvh - 24px); overflow-y: auto;
    background: var(--card-strong); border-radius: 24px; box-shadow: 0 18px 44px var(--shadow);
    -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
    padding: 0.9rem 1rem 1.2rem;
  }
  header { display: flex; align-items: center; gap: 0.6rem; }
  h2 { margin: 0; font-family: var(--serif); font-weight: 700; font-size: 2.1rem; line-height: 1; color: var(--ink); }
  .total { margin-left: auto; font-weight: 700; color: var(--ink-soft); font-size: 0.85rem; }
  .close {
    min-width: 44px; min-height: 44px; border-radius: 50%; border: 1.5px solid var(--line);
    background: var(--paper); font-size: 1rem; cursor: pointer; color: var(--ink);
  }
  .daily {
    width: 100%; margin-top: 0.8rem; min-height: 56px; display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;
    border: 0; border-radius: 18px; background: var(--ink); color: var(--paper);
    font: inherit; padding: 0.6rem 1rem; cursor: pointer; text-align: left;
    box-shadow: 0 8px 18px var(--shadow);
  }
  .daily strong { font-family: var(--serif); font-size: 1.45rem; font-weight: 700; }
  .daily span { opacity: 0.9; font-size: 0.9rem; }
  .note { color: var(--ink-soft); font-style: italic; }
  .theme { margin: 0.8rem 0 0; padding: 0; border: 0; min-width: 0; display: flex; align-items: center; gap: 0.35rem; }
  .theme legend { float: left; margin-right: 0.4rem; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-soft); }
  .theme label {
    flex: 1; min-height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 999px;
    border: 1.5px solid var(--line); cursor: pointer; font-weight: 700; font-size: 0.9rem; color: var(--ink);
  }
  .theme label.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .theme input { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .theme label:focus-within { outline: 3px solid var(--ink); outline-offset: 2px; }
  .banner {
    position: relative; margin: 1rem 0 0.5rem; height: 68px; border-radius: 16px; overflow: hidden;
    background: var(--painting) center 30% / cover;
    display: flex; align-items: flex-end; padding: 0 0.8rem 0.45rem;
  }
  .banner::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(180deg, transparent, var(--card-strong));
    opacity: calc(0.35 + var(--mist) * 0.55);
  }
  h3 {
    position: relative; margin: 0; width: 100%; display: flex; justify-content: space-between; align-items: baseline;
    font-family: var(--serif); font-size: 1.55rem; font-weight: 700; color: var(--ink);
  }
  h3 span { font-family: var(--sans); font-weight: 700; color: var(--ink-soft); font-size: 0.78rem; }
  .tiles { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.45rem; }
  .tile {
    width: 100%; min-height: 52px; border: 1.5px solid var(--line); border-radius: 14px; background: var(--paper);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
    font: inherit; font-weight: 800; cursor: pointer; color: var(--ink);
  }
  .tile.solved { background: var(--tile-solved, #e8cfa3); border-color: rgba(110, 78, 46, 0.5); }
  .tile[aria-current='true'] { outline: 2.5px solid var(--ink); outline-offset: 2px; }
  .tile:focus-visible, .daily:focus-visible, .close:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }
  .mini { font-size: 0.7rem; color: var(--star, #a87a22); letter-spacing: 1px; }
</style>
