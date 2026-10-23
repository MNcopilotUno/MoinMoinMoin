<script lang="ts">
  import { palette } from '@moin/assets';
  import { copy } from '../copy/en.js';

  interface Props { count: 0 | 1 | 2 | 3; size?: string }
  let { count, size = '2.5rem' }: Props = $props();
</script>

<div class="stars" role="img" aria-label={copy.stars(count)} style:--size={size}>
  {#each [0, 1, 2] as i (i)}
    <svg viewBox="0 0 100 100" aria-hidden="true" class:on={i < count} style:animation-delay={`${i * 120}ms`}>
      <path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36 Z"
        fill={i < count ? palette.royal : palette.mist} stroke={palette.ink} stroke-width="5" stroke-linejoin="round" />
    </svg>
  {/each}
</div>

<style>
  .stars { display: flex; gap: 0.25rem; justify-content: center; }
  svg { width: var(--size); height: var(--size); }
  .on { animation: pop 0.4s ease-out both; }
  @keyframes pop { 0% { transform: scale(0.4); } 70% { transform: scale(1.15); } }
  @media (prefers-reduced-motion: reduce) { .on { animation: none; } }
</style>
