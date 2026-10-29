<script lang="ts">
  import { CELL } from '@moin/core';
  import waterUrl from '@moin/assets/art/water.jpg';
  import waterNightUrl from '@moin/assets/art/water-night.jpg';
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
    moin?: { px: number; py: number; amount?: 1 | 2; scale?: number; dir?: 'N' | 'E' | 'S' | 'W' } | null;
    /** A seagull currently holding a stolen Moin. */
    thief?: Point | null;
    /** A fender a Moin just bounced off; `key` restarts the animation. */
    bounce?: (Point & { key: number }) | null;
    /** Night harbour (dark mode): moonlit water. */
    night?: boolean;
    /** People just reached by a Moin ("x,y"): a brief red ring (red is a Moin). */
    arrivals?: ReadonlySet<string>;
    /** Everyone is smiling: a wave runs across the tiles. */
    celebrating?: boolean;
    ontap: (x: number, y: number) => void;
  }
  let { width, height, cells, greetings, moin = null, thief = null, bounce = null, night = false, arrivals = new Set(), celebrating = false, ontap }: Props = $props();

  /** Brief press and "already smiling" feedback, held long enough to be seen on a quick tap. */
  let pressed = $state<string | null>(null);
  let wiggling = $state<string | null>(null);
  function press(key: string) {
    pressed = key;
    setTimeout(() => { if (pressed === key) pressed = null; }, 110);
  }
  function tapPerson(x: number, y: number, smiling: boolean) {
    if (smiling) {
      // R2: nothing happens in the rules; the person just wiggles so the tap is felt.
      wiggling = `${x},${y}`;
      setTimeout(() => { if (wiggling === `${x},${y}`) wiggling = null; }, 160);
    }
    ontap(x, y);
  }

  /** Ripples where the water is touched: decoration only, never a move (R1). */
  let ripples = $state<{ x: number; y: number; key: number }[]>([]);
  let rippleKey = 0;
  function splash(event: PointerEvent) {
    const el = event.currentTarget as HTMLElement;
    if ((event.target as HTMLElement).closest('button')) return;
    const box = el.getBoundingClientRect();
    const key = ++rippleKey;
    ripples = [...ripples.slice(-4), { x: event.clientX - box.left, y: event.clientY - box.top, key }];
    setTimeout(() => (ripples = ripples.filter((r) => r.key !== key)), 900);
  }

  const placed = $derived.by(() => {
    let person = 0;
    return cells.map((cell) => ({ cell, index: cell.kind === 'person' ? person++ : -1 }));
  });
</script>

<div class="board" role="group" aria-label={copy.board} onpointerdown={splash}
  style:--w={width} style:--h={height} style:--water={`url(${night ? waterNightUrl : waterUrl})`} style:--plank={`url(${plankUrl})`}>
  {#each ripples as r (r.key)}
    <span class="ripple" data-testid="ripple" aria-hidden="true" style:left={`${r.x}px`} style:top={`${r.y}px`}></span>
  {/each}
  {#each placed as { cell, index } (`${cell.x},${cell.y}`)}
    <div class="cell" style:grid-column={cell.x + 1} style:grid-row={cell.y + 1}
      class:raised={cell.kind === 'fender' && bounce?.x === cell.x && bounce?.y === cell.y} style:--order={cell.y * width + cell.x}>
      {#if cell.kind === 'person'}
        {@const g = greetings[index] ?? 0}
        {@const key = `${cell.x},${cell.y}`}
        <button type="button" class="person" class:smiling={g >= cell.needs} class:pressed={pressed === key}
          class:struck={arrivals.has(key)} class:wiggle={wiggling === key} class:cheer={celebrating}
          aria-label={cellLabel(cell, g)} data-x={cell.x} data-y={cell.y}
          onpointerdown={() => press(key)} onclick={() => tapPerson(cell.x, cell.y, g >= cell.needs)}>
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
      style:width={`${(100 / width) * 0.95 * ((moin.amount ?? 1) === 2 ? 200 / 120 : 1)}%`}
      style:transform={`translate(-50%, -78%) scale(${moin.scale ?? 1})`}>
      <MoinBubble amount={moin.amount ?? 1} flip={moin.dir === 'W'} />
    </div>
  {/if}
</div>

<style>
  .board {
    --cell: min(calc((100vw - 28px) / var(--w)), calc((100dvh - 500px) / var(--h)), 72px);
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--w), max(48px, var(--cell)));
    grid-template-rows: repeat(var(--h), max(48px, var(--cell)));
    padding: 6px;
    border-radius: 26px;
    background: var(--water) center / cover, #8eadc5;
    /* A readable edge: flying off it ends a chain (QA feel M6). */
    box-shadow: 0 18px 40px var(--shadow, rgba(30, 43, 76, 0.35)), inset 0 0 0 3px rgba(251, 246, 234, 0.55), inset 0 0 22px rgba(30, 43, 76, 0.22);
    animation: board-in 0.2s ease-out;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
  }
  /* The cell is at least 48 px and its padding at most 2 px: every person button is ≥ 44 px (§7). */
  .cell { position: relative; padding: min(5%, 2px); }
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
  .person { transition: transform 80ms ease-out, box-shadow 0.5s ease-out; }
  .person.pressed:not(.smiling) { transform: scale(0.94); }
  .person.smiling { box-shadow: 0 3px 0 rgba(110, 78, 46, 0.45), 0 0 14px rgba(255, 196, 110, 0.55), 0 6px 10px rgba(30, 43, 76, 0.25); }
  .person.struck { animation: struck 0.26s ease-out; }
  .person.wiggle { animation: wiggle 0.12s ease-in-out; }
  .person.cheer { animation: cheer 0.28s cubic-bezier(0.3, 1.6, 0.5, 1) both; animation-delay: calc(var(--order) * 40ms); }
  .cell.raised { z-index: 3; }
  @keyframes struck { from { box-shadow: 0 0 0 0 rgba(200, 16, 46, 0.7); } to { box-shadow: 0 0 0 6px rgba(200, 16, 46, 0); } }
  @keyframes wiggle { 33% { transform: rotate(-3deg); } 66% { transform: rotate(3deg); } }
  @keyframes cheer { 50% { transform: scale(1.1); } }
  @keyframes board-in { from { opacity: 0; } }
  /* Calm motion: the setting, or the phone's reduce-motion (settings.md). */
  :global(:root[data-calm]) .board, :global(:root[data-calm]) .person.struck, :global(:root[data-calm]) .person.wiggle, :global(:root[data-calm]) .person.cheer { animation: none; }
  .person:focus-visible { outline: 3px solid var(--ink, #1e2b4c); outline-offset: 2px; }
  .person.smiling { cursor: default; }
  /* Facing: a paper chip at the edge the person faces (readable on every coat and tile). */
  .facing { position: absolute; width: 0; height: 0; filter: drop-shadow(0 0 1px #1e2b4c) drop-shadow(0 0 1px #1e2b4c); }
  .facing-N { top: -7px; left: 50%; transform: translateX(-50%); border: 6px solid transparent; border-top: 0; border-bottom: 8px solid #fbf6ea; }
  .facing-S { bottom: -7px; left: 50%; transform: translateX(-50%); border: 6px solid transparent; border-bottom: 0; border-top: 8px solid #fbf6ea; }
  .facing-E { right: -7px; top: 50%; transform: translateY(-50%); border: 6px solid transparent; border-right: 0; border-left: 8px solid #fbf6ea; }
  .facing-W { left: -7px; top: 50%; transform: translateY(-50%); border: 6px solid transparent; border-left: 0; border-right: 8px solid #fbf6ea; }
  .ripple {
    position: absolute; width: 14px; height: 6px; margin: -3px 0 0 -7px; border-radius: 50%; pointer-events: none; z-index: 1;
    border: 2px solid rgba(255, 255, 255, 0.75); animation: ripple 0.85s ease-out forwards;
  }
  @keyframes ripple { to { transform: scale(5); opacity: 0; } }
  /* Calm motion: the setting, or the phone's reduce-motion (settings.md). */
  :global(:root[data-calm]) .ripple { animation-duration: 0.01s; }
  :global([data-theme='dark']) .person { box-shadow: 0 3px 0 rgba(60, 40, 20, 0.6), 0 0 14px rgba(255, 196, 110, 0.35), 0 6px 10px rgba(0, 0, 0, 0.4); }
  .moin {
    position: absolute;
    transform: translate(-50%, -78%);
    pointer-events: none;
    z-index: 2;
  }
</style>
