<script lang="ts">
  import type { Slant } from '@moin/core';

  interface Props {
    slant: Slant;
    /** Briefly highlighted when a Moin bounces off it. */
    hit?: boolean;
  }
  let { slant, hit = false }: Props = $props();
</script>

<!-- A woven rope fender slung from the quay, leaning / (rising) or \ (falling). -->
<svg viewBox="0 0 100 100" aria-hidden="true" class="fender" class:hit>
  <g transform={`rotate(${slant === 'rising' ? 45 : -45} 50 50)`}>
    <rect x="40" y="22" width="24" height="62" rx="12" fill="#1e2b4c" fill-opacity="0.18" />
    <path d="M50 4 V20" stroke="#8c6a3e" stroke-width="3.4" stroke-linecap="round" />
    <path d="M50 4 V20" stroke="#d9bd8c" stroke-width="1.4" stroke-dasharray="2 2" />
    <rect x="37" y="18" width="26" height="64" rx="13" fill="#dcbb84" stroke="#5e4426" stroke-width="2" />
    <g>
      <path d="M38 24 Q50 20 62 24" fill="none" stroke="#5e4426" stroke-width="2.8" /><path d="M38 27 Q50 23 62 27" fill="none" stroke="#e4c690" stroke-width="1.4" stroke-opacity="0.85" />
      <path d="M38 32 Q50 28 62 32" fill="none" stroke="#5e4426" stroke-width="2.8" /><path d="M38 35 Q50 31 62 35" fill="none" stroke="#e4c690" stroke-width="1.4" stroke-opacity="0.85" />
      <path d="M38 40 Q50 36 62 40" fill="none" stroke="#5e4426" stroke-width="2.8" /><path d="M38 43 Q50 39 62 43" fill="none" stroke="#e4c690" stroke-width="1.4" stroke-opacity="0.85" />
      <path d="M38 48 Q50 44 62 48" fill="none" stroke="#5e4426" stroke-width="2.8" /><path d="M38 51 Q50 47 62 51" fill="none" stroke="#e4c690" stroke-width="1.4" stroke-opacity="0.85" />
      <path d="M38 56 Q50 52 62 56" fill="none" stroke="#5e4426" stroke-width="2.8" /><path d="M38 59 Q50 55 62 59" fill="none" stroke="#e4c690" stroke-width="1.4" stroke-opacity="0.85" />
      <path d="M38 64 Q50 60 62 64" fill="none" stroke="#5e4426" stroke-width="2.8" /><path d="M38 67 Q50 63 62 67" fill="none" stroke="#e4c690" stroke-width="1.4" stroke-opacity="0.85" />
      <path d="M38 72 Q50 68 62 72" fill="none" stroke="#5e4426" stroke-width="2.8" /><path d="M38 75 Q50 71 62 75" fill="none" stroke="#e4c690" stroke-width="1.4" stroke-opacity="0.85" />
    </g>
    <rect x="37" y="18" width="7" height="64" rx="3.5" fill="#fff0d0" fill-opacity="0.3" />
    <rect x="55" y="18" width="8" height="64" rx="4" fill="#5e4426" fill-opacity="0.28" />
    <ellipse cx="50" cy="83" rx="7" ry="3.5" fill="#4a3520" />
  </g>
</svg>

<style>
  .fender { display: block; width: 100%; height: 100%; overflow: visible; }
  .hit { animation: thud 0.22s cubic-bezier(0.3, 1.6, 0.5, 1); }
  @keyframes thud { 50% { transform: scale(0.8) rotate(8deg); } }
  /* Calm motion: the setting, or the phone's reduce-motion (settings.md). */
  :global(:root[data-calm]) .hit { animation: none; }
</style>
