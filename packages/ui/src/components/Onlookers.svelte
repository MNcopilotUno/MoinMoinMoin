<script lang="ts">
  import plankUrl from '@moin/assets/art/plank.svg';
  import { copy } from '../copy/en.js';
  import { portrait } from '../portrait.js';
  import type { PortraitRole } from '../portrait.js';

  interface Props {
    /** Bumped once per smile on the board: the next onlooker cheers (the UI reacts to events). */
    cheer?: number;
    /** Everyone celebrates (the level is solved). */
    celebrate?: boolean;
    /** Called when an onlooker is poked (for a sound); never a move. */
    onpoke?: (index: number) => void;
  }
  let { cheer = 0, celebrate = false, onpoke }: Props = $props();

  const crowd: readonly { role: PortraitRole; tone: number }[] = [
    { role: 'kid', tone: 1 }, { role: 'market', tone: 0 }, { role: 'fisherman', tone: 2 },
    { role: 'captain', tone: 0 }, { role: 'market', tone: 2 }, { role: 'fisherman', tone: 1 }, { role: 'kid', tone: 0 },
  ];
  const names: Record<PortraitRole, string> = { kid: 'kid', market: 'market woman', fisherman: 'fisherman', captain: 'retired captain' };

  /** Index → time until which that onlooker beams (cheer) or waves (poke). */
  let happyUntil = $state<number[]>(crowd.map(() => 0));
  let waving = $state<number[]>(crowd.map(() => 0));
  let now = $state(0);

  function brighten(i: number, ms: number, wave: boolean) {
    const until = performance.now() + ms;
    happyUntil[i] = until;
    if (wave) waving[i] = until;
    now = performance.now();
    setTimeout(() => (now = performance.now()), ms + 20);
  }

  let lastCheer = 0;
  $effect(() => {
    if (cheer > lastCheer) {
      for (let k = lastCheer; k < cheer; k++) brighten((k * 3) % crowd.length, 1100, false);
      lastCheer = cheer;
    }
    if (cheer === 0) lastCheer = 0;
  });

  function poke(i: number) {
    brighten(i, 1400, true);
    onpoke?.(i);
  }

  const faces = $derived(crowd.map((c, i) => {
    const happy = celebrate || (happyUntil[i] ?? 0) > now;
    return portrait({ role: c.role, mood: happy ? 'smiling' : 'grumpy', facing: 'N', tone: c.tone, id: `o${i}`, pips: false });
  }));
</script>

<div class="quay" style:--plank={`url(${plankUrl})`} class:celebrate>
  <div class="lantern left" aria-hidden="true"><span class="lamp"></span></div>
  <div class="crowd">
    {#each crowd as c, i (i)}
      <button type="button" class="onlooker" class:cheering={(happyUntil[i] ?? 0) > now} class:waving={(waving[i] ?? 0) > now}
        aria-label={copy.onlooker(names[c.role])} onclick={() => poke(i)} style:--i={i}>
        {#if (waving[i] ?? 0) > now}<span class="hello" aria-hidden="true">Moin!</span>{/if}
        <span class="face" aria-hidden="true">{@html faces[i]}</span>
      </button>
    {/each}
  </div>
  <div class="rail" aria-hidden="true"></div>
  <div class="lantern right" aria-hidden="true"><span class="lamp"></span></div>
  <svg class="props" viewBox="0 0 360 40" preserveAspectRatio="none" aria-hidden="true">
    <rect x="6" y="14" width="26" height="22" rx="2" fill="#a77b4f" /><path d="M6 25 H32 M19 14 V36" stroke="#7a5634" stroke-width="2" />
    <rect x="30" y="20" width="18" height="16" rx="2" fill="#bf9364" /><path d="M30 28 H48" stroke="#7a5634" stroke-width="2" />
    <ellipse cx="330" cy="30" rx="16" ry="7" fill="none" stroke="#d8c6a0" stroke-width="3" /><ellipse cx="330" cy="30" rx="9" ry="4" fill="none" stroke="#c9b48a" stroke-width="2.5" />
    <rect x="296" y="12" width="18" height="24" rx="6" fill="#8a6440" /><path d="M296 18 H314 M296 30 H314" stroke="#5e4329" stroke-width="2" />
  </svg>
</div>

<style>
  .quay {
    position: relative; width: 100%; max-width: 30rem; height: 104px; margin: 0 auto;
    border-radius: 18px 18px 22px 22px;
    background: linear-gradient(var(--quay-shade, transparent), var(--quay-shade, transparent)),
      linear-gradient(180deg, rgba(0, 0, 0, 0) 0 48%, rgba(110, 78, 46, 0.25) 48% 50%, transparent 50%), var(--plank) center / 90px 90px, #ddc195;
    box-shadow: 0 10px 24px var(--shadow, rgba(30, 43, 76, 0.22)), inset 0 2px 0 rgba(255, 255, 255, 0.35);
    overflow: visible;
  }
  :global([data-theme='dark']) .quay { --quay-shade: rgba(14, 20, 44, 0.5); }
  :global([data-theme='dark']) .face { filter: brightness(0.86) sepia(0.12); }
  .crowd { position: absolute; left: 34px; right: 34px; bottom: 18px; display: flex; justify-content: center; }
  .onlooker {
    position: relative; width: 48px; min-width: 44px; height: 70px; margin: 0 -2px; padding: 0;
    border: 0; background: transparent; cursor: pointer; -webkit-tap-highlight-color: transparent;
    transform-origin: 50% 100%;
    animation: idle 3.2s ease-in-out infinite; animation-delay: calc(var(--i) * -0.45s);
  }
  .onlooker:focus-visible { outline: 2.5px solid var(--ink); outline-offset: 2px; border-radius: 12px; }
  .face { position: absolute; inset: 0; }
  .face :global(svg) { width: 100%; height: 100%; display: block; }
  .cheering, .celebrate .onlooker { animation: hop 0.5s ease-out 2; }
  .celebrate .onlooker { animation: hop 0.6s ease-out 3; animation-delay: calc(var(--i) * 0.08s); }
  .waving { animation: wave 0.35s ease-in-out 4; }
  .hello {
    position: absolute; left: 50%; top: -18px; transform: translateX(-50%); z-index: 2; white-space: nowrap;
    background: var(--moin, #c8102e); color: #fff8ef; border-radius: 8px; padding: 1px 6px;
    font: italic 700 0.85rem var(--serif); box-shadow: 0 3px 6px rgba(200, 16, 46, 0.35);
  }
  @media (max-width: 359px) { .onlooker:nth-child(n + 6) { display: none; } }
  .rail {
    position: absolute; left: 10px; right: 10px; bottom: 30px; height: 5px; border-radius: 3px;
    background: #7a5634; box-shadow: 0 9px 0 -1px #7a5634; opacity: 0.85; pointer-events: none;
  }
  .lantern { position: absolute; bottom: 14px; width: 6px; height: 74px; background: #2b2f45; border-radius: 3px; }
  .lantern.left { left: 14px; }
  .lantern.right { right: 14px; }
  .lamp {
    position: absolute; left: 50%; top: -12px; transform: translateX(-50%); width: 16px; height: 18px; border-radius: 5px 5px 7px 7px;
    background: #f6e6b8; border: 2px solid #2b2f45;
    box-shadow: 0 0 18px 8px var(--glow, transparent), 0 0 4px 1px var(--glow, transparent);
  }
  .props { position: absolute; left: 0; right: 0; bottom: 2px; width: 100%; height: 34px; pointer-events: none; }
  @keyframes idle { 50% { transform: translateY(-1.5px) rotate(0.6deg); } }
  @keyframes hop { 40% { transform: translateY(-10px); } }
  @keyframes wave { 25% { transform: rotate(-6deg); } 75% { transform: rotate(6deg); } }
  /* Calm motion: the setting, or the phone's reduce-motion (settings.md). */
  :global(:root[data-calm]) .onlooker, :global(:root[data-calm]) .cheering, :global(:root[data-calm]) .waving, :global(:root[data-calm]) .celebrate .onlooker { animation: none; }
</style>
