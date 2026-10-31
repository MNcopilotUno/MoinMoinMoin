<script lang="ts">
  import harbourUrl from '@moin/assets/art/harbour.jpg';
  import { GAME_NAME } from '@moin/core';

  // The app shell (docs/MOIN_DOMI.md): an honest card until stage S1 builds create, pass on and
  // the finale.
</script>

<main style:--painting={`url(${harbourUrl})`}>
  <section class="card" aria-labelledby="title">
    <p class="kicker">Moin Domi</p>
    <h1 id="title">Pass the meme on.</h1>
    <p>Being built: a private Stille Post for memes. Someone makes a meme from the harbour cast,
      each friend may change one word and one small touch, and at the last stop everyone sees how
      far it drifted. No accounts, no feed, no tracking.</p>
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
  .play {
    margin-top: 16px; min-height: 48px; display: grid; place-items: center; border-radius: 999px;
    background: var(--ink); color: var(--paper); font-weight: 800; text-decoration: none;
  }
  .play:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }
</style>
