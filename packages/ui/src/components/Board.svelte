<script lang="ts">
  import { CELL } from '@moin/core';
  import waterUrl from '@moin/assets/art/water.jpg';
  import plankUrl from '@moin/assets/art/plank.svg';
  import type { Cell } from '@moin/core';
  import { copy } from '../copy/en.js';
  import { cellLabel, roleOf } from '../labels.js';
  import FenderSprite from './FenderSprite.svelte';
  import MoinBubble from './MoinBubble.svelte';
  import PersonSprite from './PersonSprite.svelte';
  import SeagullSprite from './SeagullSprite.svelte';

  interface Point { x: number; y: number }
  interface Props {
    width: number;
    height: number;
    cells: readonly Cell[];
    /** Greetings per person, in the order people appear in `cells` (core's order). */
    greetings: readonly number[];
    /** The Moin in flight, in core sub-units (R12), or null. */
    moin?: { px: number; py: number; amount?: 1 | 2 } | null;
    /** A seagull currently holding a stolen Moin. */
    thief?: Point | null;
    /** A fender a Moin just bounced off; `key` restarts the animation. */
    bounce?: (Point & { key: number }) | null;
    ontap: (x: number, y: number) => void;
  }
  let { width, height, cells, greetings, moin = null, thief = null, bounce = null, ontap }: Props = $props();

  const placed = $derived.by(() => {
    let person = 0;
    return cells.map((cell) => ({ cell, index: cell.kind === 'person' ? person++ : -1 }));
  });
</script>

<div class="board" role="group" aria-label={copy.board}
  style:--w={width} style:--h={height} style:--water={`url(${waterUrl})`} style:--plank={`url(${plankUrl})`}>
  {#each placed as { cell, index } (`${cell.x},${cell.y}`)}
    <div class="cell" style:grid-column={cell.x + 1} style:grid-row={cell.y + 1}>
      {#if cell.kind === 'person'}
        {@const g = greetings[index] ?? 0}
        <button type="button" class="person" class:smiling={g >= cell.needs}
          aria-label={cellLabel(cell, g)} data-x={cell.x} data-y={cell.y}
          onclick={() => ontap(cell.x, cell.y)}>
          <PersonSprite role={roleOf(cell)} facing={cell.facing} needs={cell.needs} greetings={g}
            chatterbox={cell.chatterbox === true} variant={cell.x * 3 + cell.y} uid={`p${cell.x}-${cell.y}`} />
          <span class={`facing facing-${cell.facing}`} aria-hidden="true"></span>
        </button>
      {:else if cell.kind === 'seagull'}
        {@const holding = thief?.x === cell.x && thief?.y === cell.y}
        <div class="thing" role="img" aria-label={holding ? copy.seagullHolding : copy.seagull}>
          <SeagullSprite {holding} />
        </div>
      {:else}
        {@const hit = bounce?.x === cell.x && bounce?.y === cell.y}
        <div class="thing" role="img" aria-label={cellLabel(cell)}>
          {#key hit ? bounce?.key : -1}<FenderSprite slant={cell.slant} {hit} />{/key}
        </div>
      {/if}
    </div>
  {/each}
  {#if moin}
    <div class="moin" data-testid="moin"
      style:left={`${(moin.px / (width * CELL)) * 100}%`}
      style:top={`${(moin.py / (height * CELL)) * 100}%`}
      style:width={`${(100 / width) * 0.95 * ((moin.amount ?? 1) === 2 ? 200 / 120 : 1)}%`}>
      <MoinBubble amount={moin.amount ?? 1} />
    </div>
  {/if}
</div>

<style>
  .board {
    --cell: min(calc((100vw - 28px) / var(--w)), calc((100dvh - 320px) / var(--h)), 72px);
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--w), max(44px, var(--cell)));
    grid-template-rows: repeat(var(--h), max(44px, var(--cell)));
    padding: 6px;
    border-radius: 26px;
    background: var(--water) center / cover, #8eadc5;
    box-shadow: 0 18px 40px rgba(30, 43, 76, 0.35), inset 0 0 0 1.5px rgba(255, 255, 255, 0.35);
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
  }
  .cell { position: relative; padding: 5%; }
  .person, .thing { width: 100%; height: 100%; }
  .person {
    position: relative;
    padding: 2% 3% 0; margin: 0;
    border: 0; border-radius: 26%;
    background: var(--plank) center / cover, #ddc195;
    box-shadow: 0 3px 0 rgba(110, 78, 46, 0.45), 0 6px 10px rgba(30, 43, 76, 0.25);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .person:hover:not(.smiling) { box-shadow: 0 3px 0 rgba(110, 78, 46, 0.45), 0 0 0 2px rgba(251, 246, 234, 0.9), 0 6px 14px rgba(30, 43, 76, 0.3); }
  .person:active:not(.smiling) { transform: scale(0.94); }
  .person:focus-visible { outline: 3px solid var(--ink, #1e2b4c); outline-offset: 2px; }
  .person.smiling { cursor: default; }
  /* Facing: a paper chip at the edge the person faces (readable on every coat and tile). */
  .facing { position: absolute; width: 0; height: 0; filter: drop-shadow(0 0 1px #1e2b4c) drop-shadow(0 0 1px #1e2b4c); }
  .facing-N { top: -7px; left: 50%; transform: translateX(-50%); border: 6px solid transparent; border-top: 0; border-bottom: 8px solid #fbf6ea; }
  .facing-S { bottom: -7px; left: 50%; transform: translateX(-50%); border: 6px solid transparent; border-bottom: 0; border-top: 8px solid #fbf6ea; }
  .facing-E { right: -7px; top: 50%; transform: translateY(-50%); border: 6px solid transparent; border-right: 0; border-left: 8px solid #fbf6ea; }
  .facing-W { left: -7px; top: 50%; transform: translateY(-50%); border: 6px solid transparent; border-left: 0; border-right: 8px solid #fbf6ea; }
  .moin {
    position: absolute;
    transform: translate(-50%, -78%);
    pointer-events: none;
    z-index: 2;
  }
</style>
