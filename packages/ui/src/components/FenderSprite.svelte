<script lang="ts">
  import type { Slant } from '@moin/core';
  import { palette } from '@moin/assets';

  interface Props {
    slant: Slant;
    /** Briefly highlighted when a Moin bounces off it. */
    hit?: boolean;
  }
  let { slant, hit = false }: Props = $props();
</script>

<svg viewBox="0 0 100 100" aria-hidden="true" class="fender" class:hit>
  <g transform={`rotate(${slant === 'rising' ? -45 : 45} 50 50)`}>
    <rect x="6" y="38" width="88" height="24" rx="12" fill={palette.wood} stroke={palette.ink} stroke-width="4" />
    <path d="M28 40 V60 M50 40 V60 M72 40 V60" stroke={palette.ink} stroke-width="2.5" opacity="0.45" />
  </g>
</svg>

<style>
  .fender { display: block; width: 100%; height: 100%; overflow: visible; }
  .hit { animation: thud 0.25s ease-out; }
  @keyframes thud { 50% { transform: scale(0.88); } }
  @media (prefers-reduced-motion: reduce) { .hit { animation: none; } }
</style>
