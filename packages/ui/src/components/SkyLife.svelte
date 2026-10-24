<script lang="ts">
  import { copy } from '../copy/en.js';
  import Bunting from './Bunting.svelte';

  interface Props {
    /** A gull was shooed (for a squawk); never a move. */
    onsquawk?: () => void;
    /** The boat was tooted (for a horn); never a move. */
    onhorn?: () => void;
  }
  let { onsquawk, onhorn }: Props = $props();

  const gulls = [
    { top: 30, duration: 23, delay: -4, scale: 1 },
    { top: 8, duration: 31, delay: -17, scale: 0.8 },
    { top: 50, duration: 27, delay: -11, scale: 0.9 },
  ];
  let startled = $state<boolean[]>(gulls.map(() => false));
  let tooting = $state(false);

  function shoo(i: number) {
    if (startled[i]) return;
    startled[i] = true;
    onsquawk?.();
    setTimeout(() => (startled[i] = false), 5000);
  }
  function toot() {
    tooting = true;
    onhorn?.();
    setTimeout(() => (tooting = false), 900);
  }
</script>

<div class="sky">
  <div class="bunting"><Bunting /></div>
  {#each gulls as g, i (i)}
    <div class="lane" style:top={`${g.top}px`} style:animation-duration={`${g.duration}s`} style:animation-delay={`${g.delay}s`}
      style:--rest={`${8 + i * 28}%`}>
      <button type="button" class="gull" class:startled={startled[i]} aria-label={copy.gull} onclick={() => shoo(i)} style:--s={g.scale}>
        <svg viewBox="0 0 60 30" aria-hidden="true">
          <path class="wings" d="M2 14 Q14 2 28 14 Q42 2 58 14 Q42 9 30 18 Q18 9 2 14Z" fill="#f7f5f0" stroke="#5f6c86" stroke-width="1.4" />
          <circle cx="30" cy="17" r="3.4" fill="#f7f5f0" stroke="#5f6c86" stroke-width="1" />
          <path d="M32 18 L37 19 L32 20Z" fill="#e8a447" />
        </svg>
      </button>
    </div>
  {/each}
  <button type="button" class="boat" class:tooting aria-label={copy.boat} onclick={toot}>
    <svg viewBox="0 0 70 50" aria-hidden="true">
      <path d="M30 6 V36" stroke="#3b3324" stroke-width="2" />
      <path d="M31 8 L52 32 H31Z" fill="#f4efe2" stroke="#8a7b5e" stroke-width="1" />
      <path d="M29 12 L14 32 H29Z" fill="#e7dcc4" stroke="#8a7b5e" stroke-width="1" />
      <path d="M30 6 L40 9 L30 12Z" fill="#3552a6" />
      <path d="M8 36 H62 L54 46 H16Z" fill="#3552a6" stroke="#1e2b4c" stroke-width="1.2" />
      <path d="M12 40 H58" stroke="#f4efe2" stroke-width="1.5" />
      <path class="wake" d="M4 48 Q20 44 36 48 T66 48" fill="none" stroke="#f4efe2" stroke-width="1.6" opacity="0.7" />
    </svg>
  </button>
</div>

<style>
  .sky { position: relative; height: 92px; margin: 2px 0 0; pointer-events: none; overflow-x: clip; }
  .bunting { position: absolute; left: 0; right: 0; top: 0; }
  .lane {
    position: absolute; left: 0; width: 100%; height: 44px;
    animation-name: glide; animation-timing-function: linear; animation-iteration-count: infinite;
  }
  .gull {
    pointer-events: auto; position: absolute; left: 0; width: 44px; height: 44px; padding: 6px; border: 0; background: transparent;
    cursor: pointer; transform: scale(var(--s)); -webkit-tap-highlight-color: transparent;
  }
  .gull svg { width: 100%; height: 100%; overflow: visible; }
  .wings { transform-origin: 30px 16px; animation: flap 0.6s ease-in-out infinite; }
  .startled { animation: flee 1.2s ease-in forwards; }
  .startled .wings { animation-duration: 0.18s; }
  .boat {
    pointer-events: auto; position: absolute; right: 18px; bottom: -6px; width: 64px; height: 48px; padding: 0;
    border: 0; background: transparent; cursor: pointer; animation: bob 3s ease-in-out infinite; -webkit-tap-highlight-color: transparent;
  }
  .boat svg { width: 100%; height: 100%; }
  .tooting { animation: toot 0.3s ease-in-out 3; }
  .gull:focus-visible, .boat:focus-visible { outline: 2.5px solid var(--ink); outline-offset: 1px; border-radius: 10px; }
  @keyframes glide { from { transform: translateX(-60px); } to { transform: translateX(calc(100% + 60px)); } }
  @keyframes flap { 50% { transform: scaleY(0.55); } }
  @keyframes flee { to { transform: translate(40px, -140px) scale(0.4); opacity: 0; } }
  @keyframes bob { 50% { transform: translateY(-3px) rotate(-2deg); } }
  @keyframes toot { 50% { transform: translateY(-2px) rotate(4deg); } }
  /* Without motion each gull rests in its own place, so none covers another's tap target. */
  @media (prefers-reduced-motion: reduce) { .lane, .wings, .boat, .startled, .tooting { animation: none; } .lane { transform: translateX(var(--rest)); } .startled { opacity: 0.35; } }
</style>
