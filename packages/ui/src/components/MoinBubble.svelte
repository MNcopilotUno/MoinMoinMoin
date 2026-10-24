<script lang="ts">
  import { palette } from '@moin/assets';
  import { copy } from '../copy/en.js';

  interface Props {
    /** Greetings carried: 2 is a chatterbox's "Moin moin" (R13). */
    amount?: 1 | 2;
  }
  let { amount = 1 }: Props = $props();
  const w = $derived(amount === 2 ? 200 : 120);
</script>

<svg viewBox={`0 0 ${w} 80`} aria-hidden="true" class="bubble">
  <path d={`M14 6 H${w - 14} Q${w - 6} 6 ${w - 6} 14 V50 Q${w - 6} 58 ${w - 14} 58 H48 L28 74 L32 58 H14 Q6 58 6 50 V14 Q6 6 14 6 Z`}
    fill={palette.moin} stroke={palette.ink} stroke-width="5" stroke-linejoin="round" />
  <text x={w / 2} y="42" text-anchor="middle" fill={palette.white}
    font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="30">{copy.moin(amount)}</text>
</svg>

<style>
  .bubble { display: block; width: 100%; height: auto; overflow: visible; filter: drop-shadow(0 2px 0 rgba(28, 35, 51, 0.25)); }
</style>
