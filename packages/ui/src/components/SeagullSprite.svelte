<script lang="ts">
  interface Props {
    /** Holding a stolen Moin in its beak. */
    holding?: boolean;
  }
  let { holding = false }: Props = $props();
</script>

<svg viewBox="0 0 100 100" aria-hidden="true" class="gull" class:holding>
  <ellipse cx="46" cy="88" rx="26" ry="5" fill="#1e2b4c" fill-opacity="0.18" />
  <ellipse cx="46" cy="64" rx="27" ry="17" fill="#f7f5f0" />
  <path d="M28 60 Q46 46 68 62 Q50 72 28 60Z" fill="#b7c2d2" />
  <path d="M33 62 Q46 54 60 63" fill="none" stroke="#8a97ad" stroke-width="1.5" />
  <path d="M40 70 Q46 74 54 72" fill="none" stroke="#cbd3de" stroke-width="2" />
  <path d="M20 68 L6 60 L17 76Z" fill="#5f6c86" />
  <path d="M41 80 V90 M52 80 V90" stroke="#d99a4a" stroke-width="3" stroke-linecap="round" />
  <circle cx="66" cy="40" r="14" fill="#f7f5f0" />
  <path d="M78 39 L96 43 L78 48Z" fill="#e8a447" />
  <circle cx="84" cy="44.5" r="1.8" fill="#b5651d" />
  <circle cx="69" cy="37" r="2.8" fill="#1b2236" />
  <circle cx="70" cy="36" r="0.9" fill="#fff" />
  <path d="M61 30 L75 33" stroke="#1b2236" stroke-width="2.6" stroke-linecap="round" />
  {#if holding}
    <g class="loot">
      <rect x="64" y="-6" width="40" height="26" rx="7" fill="#c8102e" stroke="#8e0a20" stroke-width="1.5" />
      <path d="M76 20 L79 30 L86 20 Z" fill="#c8102e" />
      <text x="84" y="14" text-anchor="middle" fill="#fff8ef" font-family="'Cormorant Garamond', Georgia, serif" font-style="italic" font-weight="700" font-size="18">M</text>
    </g>
  {/if}
</svg>

<style>
  .gull { display: block; width: 100%; height: 100%; overflow: visible; }
  .holding { animation: cackle 0.18s ease-out 2; transform-origin: 50% 90%; }
  @keyframes cackle { 50% { transform: translateY(-8%) rotate(-6deg); } }
  @media (prefers-reduced-motion: reduce) { .holding { animation: none; } }
</style>
