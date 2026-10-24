<script lang="ts">
  import harbourUrl from '@moin/assets/art/harbour.jpg';
  import marketUrl from '@moin/assets/art/market.jpg';
  import ferryUrl from '@moin/assets/art/ferry.jpg';

  interface Props {
    /** Which part of town is waking up. */
    place: 'harbour' | 'market' | 'ferry' | 'daily';
    /** 0 = clear morning, 1 = thick fog (the story: fog lifts as the part of town wakes up). */
    fog: number;
  }
  let { place, fog }: Props = $props();

  const paintings = { harbour: harbourUrl, market: marketUrl, ferry: ferryUrl, daily: harbourUrl } as const;
</script>

<div class="scene" aria-hidden="true" style:--painting={`url(${paintings[place]})`}>
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
  @media (prefers-reduced-motion: reduce) { .fog { transition: none; } }
</style>
