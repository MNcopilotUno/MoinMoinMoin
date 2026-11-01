<script lang="ts">
  import keyart from '@moin/assets/art/harbour-night-wide.jpg';
  import { FIRST_MEME, memeTitle } from '@moin/meme';
  import Icon from '../components/Icon.svelte';
  import Meme from '../components/Meme.svelte';
  import { dayLabel } from '../lib/config.js';
  import type { Item } from '../lib/db.js';

  interface Props {
    waiting: readonly Item[];
    sendingOff: boolean;
    onchain: () => void;
    onsend: () => void;
    onopen: (item: Item) => void;
    onyours: () => void;
    onsettings: () => void;
  }
  let { waiting, sendingOff, onchain, onsend, onopen, onyours, onsettings }: Props = $props();
  const chainFaces = [{ ...FIRST_MEME, mood: 'grumpy' as const }, { ...FIRST_MEME, who: 'fisherman' as const, where: 'market' as const, bubble: 'none' as const }];
</script>

<main class="screen home">
  <div class="hero">
    <img src={keyart} alt="The harbour at night: lamp-lit warehouses, a moon and the lighthouse beam." />
    <button type="button" class="round dim gear" aria-label="Settings" onclick={onsettings}><Icon name="gear" size={20} /></button>
  </div>
  <header>
    <p class="label">A private Stille Post</p>
    <h1 tabindex="-1">Moin Domi</h1>
  </header>

  <nav aria-label="Start something" class="choices">
    <button type="button" class="choice chain" onclick={onchain}>
      <span class="stack" aria-hidden="true">
        <span class="a"><Meme meme={chainFaces[0]!} size={56} decorative /></span>
        <span class="b"><Meme meme={chainFaces[1]!} size={56} decorative /></span>
      </span>
      <span class="words">
        <strong>Start a chain</strong>
        <span>Make a meme. Each friend changes one word and one touch. At the last stop, see how far it drifted.</span>
      </span>
    </button>
    <button type="button" class="choice send" onclick={onsend}>
      <span class="icon" aria-hidden="true"><Icon name="mail" size={34} /></span>
      <span class="words">
        <strong>Just send</strong>
        <span>A private meme postcard for one person or a few. No game, no changes, gone in 30 days.</span>
      </span>
    </button>
  </nav>

  <section aria-labelledby="waiting" class="waiting">
    <h2 id="waiting" class="label">Waiting for you</h2>
    {#if waiting.length === 0}
      <p class="empty">Nothing yet. When someone sends you a Moin, it opens here.</p>
    {:else}
      <ul>
        {#each waiting.slice(0, 2) as item (item.chainId)}
          <li>
            <button type="button" class="wait" onclick={() => onopen(item)}>
              <Meme meme={item.meme} size={48} decorative />
              <span class="words">
                <strong>{item.kind === 'postcard' ? 'Sent just to you' : 'Your turn in a chain'}</strong>
                <span>{item.kind === 'postcard' ? `${memeTitle(item.meme)} · until ${dayLabel(item.expiresDay)}` : `Stop ${item.depth + 1} of ${item.maxStops} · ${memeTitle(item.meme)}`}</span>
              </span>
              {#if item.kind === 'chain'}<span class="dot" aria-hidden="true"></span>{/if}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
    <button type="button" class="all" onclick={onyours}>All your chains and postcards <Icon name="chevron" size={18} /></button>
  </section>

  <p class="note foot-note">
    {#if sendingOff}Sending isn’t switched on yet: the relay has no home. You can make memes and look around.
    {:else}No accounts, no feed. Memes are locked on your phone; the relay can’t read them.{/if}
  </p>
</main>

<style>
  .home { padding-top: 0; }
  .hero { position: relative; height: 236px; margin: 0 -16px; overflow: hidden; border-radius: 0 0 28px 28px; }
  .hero img { width: 100%; height: 100%; object-fit: cover; object-position: 30% 40%; }
  .gear { position: absolute; right: 14px; top: max(14px, env(safe-area-inset-top)); }
  header { padding: 14px 4px 0; }
  h1 { margin-top: 4px; font-family: var(--serif); font-weight: 700; font-size: 46px; line-height: 0.95; }
  .choices { display: flex; flex-direction: column; gap: 10px; padding-top: 16px; }
  .choice { display: flex; align-items: center; gap: 14px; padding: 14px; border: 0; border-radius: 22px; text-align: left; }
  .chain { background: var(--paper); color: var(--black); }
  .send { background: #0e0e12; box-shadow: inset 0 0 0 1.5px var(--paper); }
  .stack { position: relative; width: 70px; height: 70px; flex: none; }
  .stack .a { position: absolute; left: 12px; top: 0; transform: rotate(8deg); }
  .stack .b { position: absolute; left: 0; top: 12px; transform: rotate(-6deg); }
  .icon { width: 70px; height: 70px; flex: none; display: grid; place-items: center; border-radius: 16px; background: var(--black); box-shadow: inset 0 0 0 1px var(--line); }
  .words { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
  .choice strong { font-family: var(--serif); font-size: 26px; line-height: 1; }
  .choice .words span { font-size: 13.5px; line-height: 1.35; }
  .chain .words span { font-weight: 600; color: #2a2a33; }
  .send .words span { color: var(--lilac); }
  .waiting { padding-top: 18px; }
  .waiting h2 { margin: 0 4px 8px; }
  ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .wait { width: 100%; display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 8px 12px 8px 8px; border: 0; border-radius: 18px; background: #0e0e12; box-shadow: inset 0 0 0 1px var(--hair); text-align: left; }
  .wait strong { font-size: 15px; }
  .wait .words span { font-size: 13px; color: var(--lilac); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--gold); flex: none; }
  .empty { padding: 12px 4px; font-size: 14px; line-height: 1.4; color: var(--mist); }
  .all { margin-top: 6px; width: 100%; min-height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 6px; border: 0; background: transparent; font-size: 15px; font-weight: 700; }
  .foot-note { margin-top: auto; padding: 18px 4px 0; text-align: center; color: #a9a3c2; }
</style>
