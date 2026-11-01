<script lang="ts">
  import type { Weather } from '@moin/meme';

  // Weather over the painting (a touch, D4). Deterministic: the same meme draws the same rain.
  let { weather }: { weather: Exclude<Weather, 'clear'> } = $props();
  const drops = Array.from({ length: 46 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 53) % 100, l: 7 + ((i * 11) % 6) }));
</script>

<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  {#if weather === 'rain'}
    <rect width="100" height="100" fill="#0b1020" fill-opacity="0.28" />
    {#each drops as d, i (i)}<path d={`M${d.x} ${d.y} l-2.2 ${d.l}`} stroke="#c9d6e3" stroke-opacity="0.55" stroke-width="0.6" stroke-linecap="round" />{/each}
  {:else if weather === 'fog'}
    <defs><filter id="fogblur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3" /></filter></defs>
    <g filter="url(#fogblur)" fill="#dfe4ea">
      <rect x="-10" y="38" width="120" height="14" fill-opacity="0.62" />
      <rect x="-10" y="58" width="120" height="18" fill-opacity="0.5" />
      <rect x="-10" y="18" width="120" height="10" fill-opacity="0.36" />
    </g>
  {:else}
    <defs><linearGradient id="beamfade" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stop-color="#f2c46b" stop-opacity="0.55" /><stop offset="1" stop-color="#f2c46b" stop-opacity="0" /></linearGradient></defs>
    <path d="M6 14 L104 -6 L104 40 Z" fill="url(#beamfade)" />
    <circle cx="6" cy="14" r="2.4" fill="#fff6dc" />
  {/if}
</svg>
