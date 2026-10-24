<script lang="ts">
  import { palette } from '@moin/assets';

  interface Props {
    /** Which part of town is waking up. */
    place: 'harbour' | 'market' | 'ferry' | 'daily';
    /** 0 = clear morning, 1 = thick fog (the story: fog lifts as the part of town wakes up). */
    fog: number;
  }
  let { place, fog }: Props = $props();
</script>

<div class="scene" aria-hidden="true">
  <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice">
    <rect x="0" y="86" width="400" height="34" fill={palette.waterDeep} />
    <path d="M0 92 Q25 87 50 92 T100 92 T150 92 T200 92 T250 92 T300 92 T350 92 T400 92" fill="none" stroke={palette.white} stroke-width="2" opacity="0.6" />
    {#if place === 'harbour' || place === 'daily'}
      <!-- lighthouse, crane, a fishing boat -->
      <path d="M40 86 L46 30 H58 L64 86 Z" fill={palette.white} stroke={palette.ink} stroke-width="3" />
      <path d="M44 50 H60 M42 68 H62" stroke={palette.royal} stroke-width="6" />
      <rect x="44" y="20" width="16" height="10" fill={palette.sand} stroke={palette.ink} stroke-width="3" />
      <path d="M300 86 V24 H360 M300 34 L340 24 M352 24 V46" fill="none" stroke={palette.deep} stroke-width="4" />
      <path d="M150 86 L156 98 H214 L222 86 Z" fill={palette.royal} stroke={palette.ink} stroke-width="3" />
      <path d="M186 86 V60 L204 80 Z" fill={palette.sand} stroke={palette.ink} stroke-width="2.5" />
    {:else if place === 'market'}
      <!-- market stalls with striped awnings -->
      {#each [20, 120, 220, 320] as x (x)}
        <rect x={x} y="56" width="70" height="30" fill={palette.sand} stroke={palette.ink} stroke-width="3" />
        <path d={`M${x - 6} 56 L${x + 6} 38 H${x + 64} L${x + 76} 56 Z`} fill={palette.white} stroke={palette.ink} stroke-width="3" />
        {#each [0, 1, 2] as k (k)}
          <path d={`M${x + 4 + k * 24} 56 L${x + 12 + k * 22} 38 H${x + 22 + k * 22} L${x + 16 + k * 24} 56 Z`} fill={palette.royal} />
        {/each}
      {/each}
    {:else}
      <!-- the morning ferry -->
      <path d="M60 70 H330 L310 98 H86 Z" fill={palette.white} stroke={palette.ink} stroke-width="3" />
      <rect x="120" y="46" width="150" height="24" fill={palette.white} stroke={palette.ink} stroke-width="3" />
      <rect x="180" y="26" width="20" height="20" fill={palette.royal} stroke={palette.ink} stroke-width="3" />
      {#each [132, 156, 214, 238] as x (x)}<rect x={x} y="53" width="14" height="10" rx="2" fill={palette.royalDeep} />{/each}
      <path d="M70 82 H322" stroke={palette.royal} stroke-width="5" />
    {/if}
    <rect class="fog" x="0" y="0" width="400" height="120" fill={palette.fog} opacity={Math.min(0.9, Math.max(0, fog)) } />
  </svg>
</div>

<style>
  .scene {
    position: fixed; left: 0; right: 0; bottom: 0; height: min(22vh, 150px);
    pointer-events: none; z-index: 0; opacity: 0.85;
  }
  svg { width: 100%; height: 100%; display: block; }
  .fog { transition: opacity 1.2s ease-out; }
  @media (prefers-reduced-motion: reduce) { .fog { transition: none; } }
</style>
