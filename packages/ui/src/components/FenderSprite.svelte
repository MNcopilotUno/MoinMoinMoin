<script lang="ts">
  import type { Slant } from '@moin/core';

  interface Props {
    slant: Slant;
    /** Briefly highlighted when a Moin bounces off it. */
    hit?: boolean;
  }
  let { slant, hit = false }: Props = $props();
</script>

<svg viewBox="0 0 100 100" aria-hidden="true" class="fender" class:hit>
  <g transform={`rotate(${slant === 'rising' ? -45 : 45} 50 50)`}>
    <rect x="8" y="42" width="84" height="22" rx="11" fill="#1e2b4c" fill-opacity="0.18" />
    <rect x="6" y="38" width="88" height="22" rx="11" fill="#b08458" />
    <rect x="6" y="38" width="88" height="9" rx="4.5" fill="#d2a978" fill-opacity="0.8" />
    <path d="M24 40 V58 M50 40 V58 M76 40 V58" stroke="#7a5634" stroke-width="2" stroke-opacity="0.55" />
    <path d="M10 49 Q4 49 4 55 M90 49 Q96 49 96 55" fill="none" stroke="#e9dcc0" stroke-width="2.5" stroke-linecap="round" />
  </g>
</svg>

<style>
  .fender { display: block; width: 100%; height: 100%; overflow: visible; }
  .hit { animation: thud 0.22s cubic-bezier(0.3, 1.6, 0.5, 1); }
  @keyframes thud { 50% { transform: scale(0.8) rotate(8deg); } }
  @media (prefers-reduced-motion: reduce) { .hit { animation: none; } }
</style>
