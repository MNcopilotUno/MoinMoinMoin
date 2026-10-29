<script lang="ts">
  import type { Facing } from '@moin/core';
  import { portrait } from '../portrait.js';
  import type { PortraitRole } from '../portrait.js';

  interface Props {
    role: PortraitRole;
    facing: Facing;
    needs: 1 | 2;
    greetings: number;
    /** R13: drawn with speech marks. */
    chatterbox?: boolean;
    /** Picks the skin tone deterministically. */
    variant?: number;
    /** Unique on the page: prefixes the portrait's SVG ids. */
    uid?: string;
  }
  let { role, facing, needs, greetings, chatterbox = false, variant = 0, uid = 'p' }: Props = $props();

  const mood = $derived(greetings >= needs ? 'smiling' : greetings > 0 ? 'half' : 'grumpy');
  // Pips are drawn as tile chips below, not inside the portrait (canvas-parity.md).
  const svg = $derived(portrait({ role, mood, facing, tone: variant % 3, chatter: chatterbox, id: uid, pips: false }));
</script>

<div class="sprite" class:smiling={mood === 'smiling'} class:half={mood === 'half'}>{@html svg}</div>
{#if needs === 2}
  {#key greetings}
    <span class="pips" aria-hidden="true">
      {#each [0, 1] as i (i)}<span class="pip" class:filled={i < greetings} class:newest={i === greetings - 1}></span>{/each}
    </span>
  {/key}
{/if}
{#if chatterbox}<span class="badge" aria-hidden="true">×2</span>{/if}

<style>
  .sprite { width: 100%; height: 100%; }
  .sprite :global(svg) { display: block; width: 100%; height: 100%; overflow: visible; }
  .sprite { transform-origin: 50% 90%; }
  /* The smile is the reward: squash and stretch (QA feel M5). */
  .smiling { animation: pop 0.32s ease-out; }
  @keyframes pop { 30% { transform: scale(1.12, 0.92); } 60% { transform: scale(0.96, 1.06); } }
  /* A captain's first greeting: a grudging harrumph, and the new pip pops in (QA feel H3). */
  .half { animation: harrumph 0.26s ease-in-out 2; }
  @keyframes harrumph { 25% { transform: rotate(-4deg); } 75% { transform: rotate(4deg); } }
  /* A captain's greetings, on the tile: red means Moin (canvas-parity.md). */
  .pips { position: absolute; left: 7%; top: 6%; display: flex; gap: 3px; pointer-events: none; }
  .pip { width: 9px; height: 9px; border-radius: 50%; border: 1.5px solid #1e2b4c; background: #fbf6ea; box-sizing: content-box; }
  .pip.filled { background: #c8102e; }
  .pip.newest { animation: pip 0.22s cubic-bezier(0.3, 1.6, 0.5, 1); }
  .badge {
    position: absolute; right: 6%; top: 6%; padding: 1px 5px; border-radius: 8px; pointer-events: none;
    background: #1e2b4c; color: #fbf6ea; font: 800 10px/1.3 var(--sans, sans-serif);
  }
  @keyframes pip { from { transform: scale(0); } 60% { transform: scale(1.4); } }
  /* Calm motion: the setting, or the phone's reduce-motion (settings.md). */
  :global(:root[data-calm]) .smiling, :global(:root[data-calm]) .half, :global(:root[data-calm]) .pip.newest { animation: none; }
</style>
