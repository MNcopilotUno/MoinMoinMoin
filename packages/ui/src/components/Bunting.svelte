<script lang="ts">
  interface Props { flags?: number }
  let { flags = 14 }: Props = $props();
  // No red: red means Moin.
  const colours = ['#3552a6', '#8fae8a', '#f2c9a5', '#b7a9d3', '#d9a441'];
  const items = $derived(Array.from({ length: flags }, (_, i) => {
    const t = (i + 0.5) / flags;
    const x = t * 400;
    const y = 6 + 22 * 4 * t * (1 - t);
    return { x, y, colour: colours[i % colours.length] as string, i };
  }));
</script>

<svg class="bunting" viewBox="0 0 400 48" preserveAspectRatio="none" aria-hidden="true">
  <path d="M0 4 Q200 52 400 4" fill="none" stroke="#5e4329" stroke-width="1.4" />
  {#each items as f (f.i)}
    <g class="flag" style:--i={f.i} style:transform-origin={`${f.x}px ${f.y}px`}>
      <path d={`M${f.x - 8} ${f.y} L${f.x + 8} ${f.y} L${f.x} ${f.y + 16} Z`} fill={f.colour} />
      <circle class="bulb" cx={f.x + 14} cy={f.y + 1} r="2.2" />
    </g>
  {/each}
</svg>

<style>
  .bunting { display: block; width: 100%; height: 48px; overflow: visible; }
  .flag { animation: sway 4s ease-in-out infinite; animation-delay: calc(var(--i) * -0.3s); }
  .bulb { fill: var(--glow, transparent); filter: drop-shadow(0 0 3px var(--glow, transparent)); }
  @keyframes sway { 50% { transform: rotate(7deg); } }
  @media (prefers-reduced-motion: reduce) { .flag { animation: none; } }
</style>
