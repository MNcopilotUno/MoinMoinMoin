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
  const svg = $derived(portrait({ role, mood, facing, tone: variant % 3, chatter: chatterbox, id: uid }));
</script>

<div class="sprite" class:smiling={mood === 'smiling'} class:half={mood === 'half'}>{@html svg}</div>

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
  .sprite :global(.pip.newest) { transform-box: fill-box; transform-origin: center; animation: pip 0.22s cubic-bezier(0.3, 1.6, 0.5, 1); }
  @keyframes pip { from { transform: scale(0); } 60% { transform: scale(1.4); } }
  @media (prefers-reduced-motion: reduce) { .smiling, .half, .sprite :global(.pip.newest) { animation: none; } }
</style>
