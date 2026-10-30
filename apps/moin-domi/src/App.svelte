<script lang="ts">
  import harbourUrl from '@moin/assets/art/harbour.jpg';
  import { GAME_NAME } from '@moin/core';

  // D0 scaffold (DOMI_ROADMAP): an honest card. D1 builds compose, share, unlock and receive.
  // A Moin link that arrives early is acknowledged, never read: nothing is decoded yet.
  const waiting = typeof location !== 'undefined' && /^#m\d/.test(location.hash);
</script>

<main style:--painting={`url(${harbourUrl})`}>
  <section class="card" aria-labelledby="title">
    <p class="kicker">Moin Domi</p>
    <h1 id="title">A real Moin, passed by a link.</h1>
    {#if waiting}
      <p class="waiting" role="status">A Moin is waiting in this link. Keep it — Moin Domi will open it soon.</p>
    {/if}
    <p>Being built. Soon you can send a Moin — a wave, a few words, locked with a password if you
      like — and see how far it travels. No accounts, no tracking: the Moin lives in the link.</p>
    <a class="play" href="../">Play {GAME_NAME} meanwhile</a>
  </section>
</main>

<style>
  :global(html, body) { margin: 0; height: 100%; background: var(--fog); color: var(--ink); font-family: var(--sans); }
  main {
    min-height: 100dvh; display: grid; place-items: end center; box-sizing: border-box;
    padding: 16px 16px max(16px, env(safe-area-inset-bottom));
    background: var(--painting) center top / cover no-repeat, var(--fog);
  }
  .card {
    width: min(100%, 28rem); box-sizing: border-box; padding: 22px 22px 20px; border-radius: 28px;
    background: var(--card-strong); box-shadow: 0 14px 34px var(--shadow);
  }
  .kicker { margin: 0; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ink-soft); }
  h1 { margin: 6px 0 0; font-family: var(--serif); font-weight: 700; font-size: 2.1rem; line-height: 1.02; }
  p { margin: 12px 0 0; line-height: 1.45; color: var(--ink-soft); }
  .waiting { padding: 10px 12px; border-radius: 14px; background: color-mix(in srgb, var(--ink) 8%, var(--paper)); color: var(--ink); font-weight: 600; }
  .play {
    margin-top: 16px; min-height: 48px; display: grid; place-items: center; border-radius: 999px;
    background: var(--ink); color: var(--paper); font-weight: 800; text-decoration: none;
  }
  .play:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }
</style>
