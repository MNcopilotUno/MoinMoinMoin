<script lang="ts">
  import { palette } from '@moin/assets';
</script>

<svg viewBox="0 0 120 80" aria-hidden="true" class="bubble">
  <path d="M14 6 H106 Q114 6 114 14 V50 Q114 58 106 58 H48 L28 74 L32 58 H14 Q6 58 6 50 V14 Q6 6 14 6 Z"
    fill={palette.moin} stroke={palette.ink} stroke-width="5" stroke-linejoin="round" />
  <text x="60" y="42" text-anchor="middle" fill={palette.white}
    font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="30">Moin</text>
</svg>

<style>
  .bubble { display: block; width: 100%; height: auto; overflow: visible; filter: drop-shadow(0 2px 0 rgba(28, 35, 51, 0.25)); }
</style>
