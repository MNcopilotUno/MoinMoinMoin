<script lang="ts">
  import { palette } from '@moin/assets';

  interface Props {
    /** Holding a stolen Moin in its beak. */
    holding?: boolean;
  }
  let { holding = false }: Props = $props();
</script>

<svg viewBox="0 0 100 100" aria-hidden="true" class="gull" class:holding>
  <ellipse cx="48" cy="62" rx="28" ry="20" fill={palette.white} stroke={palette.ink} stroke-width="4" />
  <path d="M30 58 Q46 44 66 60 Q50 70 30 58 Z" fill={palette.stone} stroke={palette.ink} stroke-width="3" />
  <path d="M20 66 L6 60 L18 74 Z" fill={palette.slate} stroke={palette.ink} stroke-width="3" stroke-linejoin="round" />
  <path d="M42 82 V92 M54 82 V92" stroke={palette.sandDeep} stroke-width="4" stroke-linecap="round" />
  <circle cx="66" cy="38" r="15" fill={palette.white} stroke={palette.ink} stroke-width="4" />
  <path d="M78 38 L96 42 L78 47 Z" fill={palette.sandDeep} stroke={palette.ink} stroke-width="3" stroke-linejoin="round" />
  <circle cx="69" cy="35" r="3" fill={palette.ink} />
  <path d="M62 28 L74 31" stroke={palette.ink} stroke-width="3.5" stroke-linecap="round" />
  {#if holding}
    <g class="loot">
      <rect x="74" y="8" width="26" height="16" rx="5" fill={palette.moin} stroke={palette.ink} stroke-width="2.5" />
      <path d="M82 24 L84 31 L88 24 Z" fill={palette.moin} stroke={palette.ink} stroke-width="2" stroke-linejoin="round" />
    </g>
  {/if}
</svg>

<style>
  .gull { display: block; width: 100%; height: 100%; overflow: visible; }
  .holding { animation: cackle 0.35s ease-in-out 2; }
  @keyframes cackle { 50% { transform: rotate(-8deg); } }
  @media (prefers-reduced-motion: reduce) { .holding { animation: none; } }
</style>
