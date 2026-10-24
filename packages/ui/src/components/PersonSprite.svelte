<script lang="ts">
  import type { Facing } from '@moin/core';
  import { palette } from '@moin/assets';

  interface Props {
    role: 'fisherman' | 'captain' | 'market' | 'kid';
    facing: Facing;
    needs: 1 | 2;
    greetings: number;
    /** R13: drawn with speech marks. */
    chatterbox?: boolean;
    /** Index used to vary skin tone deterministically. */
    variant?: number;
  }
  let { role, facing, needs, greetings, chatterbox = false, variant = 0 }: Props = $props();

  const look: Record<Facing, [number, number]> = { N: [0, -3], E: [3.5, 0], S: [0, 3], W: [-3.5, 0] };
  const smiling = $derived(greetings >= needs);
  const half = $derived(!smiling && greetings > 0);
  const [lx, ly] = $derived(look[facing]);
  const skin = $derived(palette.skin[variant % palette.skin.length]);
  const coat = $derived(
    role === 'captain' ? palette.royalDeep : role === 'market' ? palette.sandDeep : role === 'kid' ? palette.royal : palette.royal,
  );
  const pointer: Record<Facing, string> = {
    N: '43,9 57,9 50,1', E: '91,43 91,57 99,50', S: '43,91 57,91 50,99', W: '9,43 9,57 1,50',
  };
</script>

<svg viewBox="0 0 100 100" aria-hidden="true" class="sprite" class:smiling class:half>
  <polygon points={pointer[facing]} fill={palette.ink} opacity="0.7" />
  <!-- shoulders -->
  <path d="M20 100 Q20 72 50 70 Q80 72 80 100 Z" fill={coat} stroke={palette.ink} stroke-width="4" />
  {#if role === 'market'}
    <path d="M36 100 L38 80 L62 80 L64 100 Z" fill={palette.white} stroke={palette.ink} stroke-width="3" />
  {:else if role === 'kid'}
    <path d="M24 86 H76 M22 94 H78" stroke={palette.white} stroke-width="4" />
  {/if}
  <!-- head -->
  <circle cx="50" cy="45" r={role === 'kid' ? 21 : 23} fill={skin} stroke={palette.ink} stroke-width="4" />
  {#if role === 'captain'}
    <path d="M30 52 Q32 74 50 74 Q68 74 70 52 Q60 60 50 60 Q40 60 30 52 Z" fill={palette.white} stroke={palette.ink} stroke-width="3" />
    <path d="M26 30 Q28 14 50 13 Q72 14 74 30 Z" fill={palette.white} stroke={palette.ink} stroke-width="4" />
    <rect x="26" y="27" width="48" height="7" fill={palette.royalDeep} stroke={palette.ink} stroke-width="3" />
    <path d="M28 34 Q50 42 72 34" fill="none" stroke={palette.ink} stroke-width="4" />
  {:else if role === 'fisherman'}
    <path d="M27 38 Q26 17 50 16 Q74 17 73 38 Z" fill={palette.royal} stroke={palette.ink} stroke-width="4" />
    <path d="M27 36 H73" stroke={palette.ink} stroke-width="3" />
    <circle cx="50" cy="15" r="5" fill={palette.royal} stroke={palette.ink} stroke-width="3" />
  {:else if role === 'market'}
    <path d="M26 46 Q24 18 50 18 Q76 18 74 46 Q70 30 50 28 Q30 30 26 46 Z" fill={palette.sandDeep} stroke={palette.ink} stroke-width="4" />
    <circle cx="50" cy="16" r="7" fill={palette.sandDeep} stroke={palette.ink} stroke-width="3" />
  {:else}
    <path d="M32 34 Q36 20 50 22 Q62 20 68 32 Q58 28 50 30 Q42 26 32 34 Z" fill={palette.deep} stroke={palette.ink} stroke-width="3" />
  {/if}

  <!-- eyes -->
  {#if smiling}
    <path d="M37 46 Q42 40 47 46 M53 46 Q58 40 63 46" fill="none" stroke={palette.ink} stroke-width="3.5" stroke-linecap="round" />
  {:else}
    <circle cx={42 + lx} cy={45 + ly} r="3.2" fill={palette.ink} />
    <circle cx={58 + lx} cy={45 + ly} r="3.2" fill={palette.ink} />
    {#if role === 'captain' && !half}
      <path d="M34 36 L46 40 M66 36 L54 40" stroke={palette.ink} stroke-width="4" stroke-linecap="round" />
    {:else}
      <path d="M36 39 H47 M53 39 H64" stroke={palette.ink} stroke-width="3" stroke-linecap="round" />
    {/if}
  {/if}

  <!-- mouth: red means Moin, so only a smile is red -->
  {#if smiling}
    <path d="M38 55 Q50 68 62 55" fill="none" stroke={palette.moin} stroke-width="5" stroke-linecap="round" />
  {:else if half}
    <path d="M40 58 Q52 60 61 53" fill="none" stroke={palette.ink} stroke-width="4" stroke-linecap="round" />
  {:else}
    <path d="M40 60 Q50 53 60 60" fill="none" stroke={palette.ink} stroke-width="4" stroke-linecap="round" />
  {/if}

  {#if chatterbox}
    <g class="chatter" stroke={palette.ink} stroke-width="3.5" stroke-linecap="round" fill="none">
      <path d="M80 30 Q88 24 86 14" /><path d="M88 36 Q98 30 97 18" />
    </g>
  {/if}

  {#if needs === 2}
    {#each [0, 1] as pip (pip)}
      <circle cx={10 + pip * 12} cy="10" r="5" stroke={palette.ink} stroke-width="2.5"
        fill={pip < greetings ? palette.moin : palette.white} />
    {/each}
  {/if}
</svg>

<style>
  .sprite { display: block; width: 100%; height: 100%; overflow: visible; }
  .sprite.smiling { animation: bob 0.5s ease-out; }
  @keyframes bob { 40% { transform: translateY(-6%); } }
  @media (prefers-reduced-motion: reduce) { .sprite.smiling { animation: none; } }
</style>
