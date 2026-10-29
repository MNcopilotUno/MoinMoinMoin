<script lang="ts">
  import harbourUrl from '@moin/assets/art/harbour.jpg';
  import marketUrl from '@moin/assets/art/market.jpg';
  import ferryUrl from '@moin/assets/art/ferry.jpg';
  import harbourNightUrl from '@moin/assets/art/harbour-night.jpg';
  import marketNightUrl from '@moin/assets/art/market-night.jpg';
  import ferryNightUrl from '@moin/assets/art/ferry-night.jpg';

  interface Props {
    /** Which part of town is waking up. */
    place: 'harbour' | 'market' | 'ferry' | 'daily';
    /** 0 = clear morning, 1 = thick fog (the story: fog lifts as the part of town wakes up). */
    fog: number;
    /** Dark mode: the same part of town as a moonlit nocturne. */
    night?: boolean;
  }
  let { place, fog, night = false }: Props = $props();

  const paintings = { harbour: harbourUrl, market: marketUrl, ferry: ferryUrl, daily: harbourUrl } as const;
  const nocturnes = { harbour: harbourNightUrl, market: marketNightUrl, ferry: ferryNightUrl, daily: harbourNightUrl } as const;
</script>

<div class="scene" class:night aria-hidden="true" data-painting={night ? 'night' : 'day'} style:--painting={`url(${(night ? nocturnes : paintings)[place]})`}>
  <div class="fog" style:opacity={Math.min(0.85, Math.max(0, fog))}></div>
</div>

<style>
  .scene {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: var(--painting) center top / cover no-repeat, var(--fog, #f6f1e7);
  }
  .fog {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 80% 40% at 50% 38%, rgba(246, 241, 231, 0.9), rgba(246, 241, 231, 0) 70%),
      linear-gradient(180deg, rgba(232, 226, 238, 0.85), rgba(246, 241, 231, 0.7) 45%, rgba(230, 228, 236, 0.55));
    transition: opacity 1.4s ease-out;
  }
  .night .fog {
    background:
      radial-gradient(ellipse 80% 40% at 50% 38%, rgba(26, 33, 66, 0.85), rgba(26, 33, 66, 0) 70%),
      linear-gradient(180deg, rgba(16, 22, 44, 0.85), rgba(22, 28, 56, 0.7) 45%, rgba(16, 22, 44, 0.55));
  }
  /* Calm motion: the setting, or the phone's reduce-motion (settings.md). */
  :global(:root[data-calm]) .fog { transition: none; }
</style>
