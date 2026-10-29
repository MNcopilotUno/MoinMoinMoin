<script lang="ts">
  interface Props {
    /** Holding a stolen Moin in its beak. */
    holding?: boolean;
  }
  let { holding = false }: Props = $props();
</script>

<!-- A herring gull (Silbermöwe) on a mooring post (Dalben). No Moin red: the beak spot is orange. -->
<svg viewBox="0 0 100 100" aria-hidden="true" class="gull" class:holding>
  <ellipse cx="46" cy="96" rx="24" ry="4" fill="#1e2b4c" fill-opacity="0.2" />
  <path class="post" d="M30 84 V98 Q46 102 62 98 V84Z" fill="#8c6a3e" />
  <path d="M36 86 V99 M46 87 V100 M56 86 V99" stroke="#6e5130" stroke-width="1.4" stroke-opacity="0.7" />
  <ellipse cx="46" cy="84" rx="16" ry="4.5" fill="#c9a26a" />
  <ellipse cx="46" cy="84" rx="9" ry="2.4" fill="none" stroke="#9c7840" stroke-width="1" />
  <path d="M41 74 V84 M51 74 V84" stroke="#e3a59b" stroke-width="2.6" stroke-linecap="round" />
  <ellipse cx="46" cy="62" rx="26" ry="16" fill="#f8f6f1" />
  <path d="M40 72 Q48 77 60 72" fill="none" stroke="#d9dce6" stroke-width="2.2" />
  <path d="M22 58 Q44 44 70 58 Q66 66 52 68 Q34 69 22 58Z" fill="#a9b3c4" />
  <path d="M30 60 Q46 52 62 60" fill="none" stroke="#8a95ab" stroke-width="1.4" />
  <path d="M24 58 L4 56 L10 62 L4 66 L26 66Z" fill="#23272f" />
  <circle cx="11" cy="59.5" r="1.5" fill="#f8f6f1" /><circle cx="15" cy="63" r="1.3" fill="#f8f6f1" />
  <path d="M26 62 Q38 66 50 66" fill="none" stroke="#f8f6f1" stroke-width="1.4" stroke-opacity="0.8" />
  <circle cx="66" cy="40" r="14" fill="#fbfaf6" />
  <path d="M56 46 Q62 52 72 50" fill="none" stroke="#e1e3ea" stroke-width="2" />
  <path d="M78 38 L97 42 Q98 44 96 45 L78 48Z" fill="#ebc04a" />
  <path d="M78 45 L96 45 L78 48Z" fill="#d9a632" />
  <circle cx="88" cy="45.6" r="2" fill="#e07b2e" />
  <circle cx="69" cy="37" r="3.6" fill="#f3e3a4" stroke="#b88a22" stroke-width="1.2" />
  <circle cx="69.6" cy="37" r="1.7" fill="#14161e" />
  <circle cx="69" cy="36.2" r="0.6" fill="#fff" />
  <path d="M61 30.5 L75 33" stroke="#8a95ab" stroke-width="2.4" stroke-linecap="round" />
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
  /* Calm motion: the setting, or the phone's reduce-motion (settings.md). */
  :global(:root[data-calm]) .holding { animation: none; }
</style>
