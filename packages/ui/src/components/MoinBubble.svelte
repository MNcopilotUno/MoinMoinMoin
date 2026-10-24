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
    fill={palette.moin} stroke="#8e0a20" stroke-width="2.5" stroke-linejoin="round" />
  <path d="M16 14 Q40 9 72 12" fill="none" stroke="#f0857a" stroke-width="3" stroke-linecap="round" opacity="0.55" />
  <text x={w / 2} y="44" text-anchor="middle" fill="#fff8ef"
    font-family="'Cormorant Garamond', Georgia, serif" font-style="italic" font-weight="700" font-size="36">{copy.moin(amount)}</text>
</svg>

<style>
  .bubble { display: block; width: 100%; height: auto; overflow: visible; filter: drop-shadow(0 6px 10px rgba(200, 16, 46, 0.45)); }
</style>
