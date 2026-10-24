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

<div class="sprite" class:smiling={mood === 'smiling'}>{@html svg}</div>

<style>
  .sprite { width: 100%; height: 100%; }
  .sprite :global(svg) { display: block; width: 100%; height: 100%; overflow: visible; }
  .smiling { animation: bob 0.55s ease-out; }
  @keyframes bob { 40% { transform: translateY(-5%); } }
  @media (prefers-reduced-motion: reduce) { .smiling { animation: none; } }
</style>
