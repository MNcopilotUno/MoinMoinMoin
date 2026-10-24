<script lang="ts">
  import { CELL } from '@moin/core';
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
  style:--w={width} style:--h={height}>
  {#each placed as { cell, index } (`${cell.x},${cell.y}`)}
    <div class="cell" style:grid-column={cell.x + 1} style:grid-row={cell.y + 1}>
      {#if cell.kind === 'person'}
        {@const g = greetings[index] ?? 0}
        <button type="button" class="person" class:smiling={g >= cell.needs}
          aria-label={cellLabel(cell, g)} data-x={cell.x} data-y={cell.y}
          onclick={() => ontap(cell.x, cell.y)}>
          <PersonSprite role={roleOf(cell)} facing={cell.facing} needs={cell.needs} greetings={g}
            chatterbox={cell.chatterbox === true} variant={cell.x * 3 + cell.y} />
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
    --cell: min(calc((100vw - 32px) / var(--w)), calc((100dvh - 230px) / var(--h)), 76px);
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--w), max(44px, var(--cell)));
    grid-template-rows: repeat(var(--h), max(44px, var(--cell)));
    border: var(--outline, 3px) solid var(--ink, #1c2333);
    border-radius: 18px;
    background:
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.35) 0 2px, transparent 3px) 0 0 / 38px 31px,
      repeating-linear-gradient(170deg, transparent 0 14px, rgba(255, 255, 255, 0.22) 14px 16px, transparent 16px 30px),
      var(--water, #c9d6e3);
    box-shadow: 0 5px 0 var(--ink, #1c2333);
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
  }
  .cell { position: relative; padding: 6%; }
  .person, .thing { width: 100%; height: 100%; }
  .person {
    padding: 4%; margin: 0;
    border: 2px solid rgba(28, 35, 51, 0.55); border-radius: 22%;
    background: repeating-linear-gradient(90deg, var(--sand, #ecdcb8) 0 30%, var(--sand-deep, #d4bc8c) 30% 33%);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .person:hover:not(.smiling) { border-color: var(--ink, #1c2333); }
  .person:active:not(.smiling) { transform: scale(0.94); }
  .person:focus-visible { outline: 3px solid var(--royal, #2346b8); outline-offset: 2px; }
  .person.smiling { cursor: default; }
  .moin {
    position: absolute;
    transform: translate(-50%, -78%);
    pointer-events: none;
    z-index: 2;
  }
</style>
