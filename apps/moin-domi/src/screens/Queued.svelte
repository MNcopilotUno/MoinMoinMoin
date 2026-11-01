<script lang="ts">
  import ferry from '@moin/assets/art/ferry-night.jpg';
  import Meme from '../components/Meme.svelte';
  import type { Outgoing } from '../lib/db.js';

  interface Props { outgoing: Outgoing; online: boolean; onhome: () => void }
  let { outgoing, online, onhome }: Props = $props();
</script>

<main class="screen queued">
  <img class="sky" src={ferry} alt="" />
  <div class="card"><Meme meme={outgoing.meme} size={200} /></div>
  <section aria-live="polite">
    <p class="label">{outgoing.kind === 'start' ? (outgoing.rules?.kind === 'postcard' ? 'A postcard' : 'A new chain') : 'Your turn'}</p>
    <h1 tabindex="-1">Waiting for the tide</h1>
    <p class="t">
      {#if online}Back online — sending it now…
      {:else}You’re offline. It’s kept on this phone and goes out the moment you’re back, while Moin Domi is open. Nothing is sent before then.{/if}
    </p>
  </section>
  <div class="foot">
    <button type="button" class="primary" onclick={onhome}>Home</button>
    <p class="note c">You’ll find it on Home under “Waiting to send”.</p>
  </div>
</main>

<style>
  .queued { padding-top: 0; }
  .sky { position: absolute; left: 0; top: 0; width: 100%; height: 360px; object-fit: cover; opacity: 0.5; -webkit-mask-image: linear-gradient(#000 45%, transparent); mask-image: linear-gradient(#000 45%, transparent); animation: none; }
  .card { position: relative; display: flex; justify-content: center; padding-top: 72px; }
  .card :global(.meme) { transform: rotate(2deg); opacity: 0.85; box-shadow: 0 18px 50px rgba(0, 0, 0, 0.8); }
  section { position: relative; padding: 26px 4px 0; text-align: center; }
  h1 { margin-top: 6px; font-family: var(--serif); font-weight: 700; font-size: 38px; line-height: 1; }
  .t { margin-top: 10px; font-size: 15px; line-height: 1.45; color: var(--lilac); }
  .foot { position: relative; }
  .c { text-align: center; }
</style>
