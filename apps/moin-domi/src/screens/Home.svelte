<script lang="ts">
  import keyart from '@moin/assets/art/harbour-night.jpg';
  import { FIRST_MEME, memeTitle } from '@moin/meme';
  import { domi } from '@moin/ui/copy/domi';
  import { GAME_NAME } from '@moin/core';
  import puzzleIcon from '@moin/assets/icons/icon-192.png';
  import Icon from '../components/Icon.svelte';
  import Meme from '../components/Meme.svelte';
  import { dayLabel } from '../lib/config.js';
  import type { Item, Outgoing } from '../lib/db.js';

  interface Props {
    waiting: readonly Item[];
    outbox: readonly Outgoing[];
    sentNote: string | null;
    sendingOff: boolean;
    ondiscard: (o: Outgoing) => void;
    ondismiss: () => void;
    onchain: () => void;
    onsend: () => void;
    onopen: (item: Item) => void;
    onyours: () => void;
    onsettings: () => void;
  }
  let { waiting, outbox, sentNote, sendingOff, onchain, onsend, onopen, onyours, onsettings, ondiscard, ondismiss }: Props = $props();
  const t = domi.home;
  const kindOf = (o: Outgoing) => (o.kind === 'start' ? (o.rules?.kind === 'postcard' ? domi.common.outgoing.postcard : domi.common.outgoing.chain) : domi.common.outgoing.turn);
  const chainFaces = [{ ...FIRST_MEME, mood: 'grumpy' as const }, { ...FIRST_MEME, who: 'fisherman' as const, where: 'market' as const, bubble: 'none' as const }];
</script>

<main class="screen home">
  <div class="hero">
    <img src={keyart} alt={t.art} />
    <button type="button" class="round dim gear" aria-label={t.settings} onclick={onsettings}><Icon name="gear" size={20} /></button>
  </div>
  <header>
    <p class="label">{t.kicker}</p>
    <h1 tabindex="-1">{domi.name}</h1>
  </header>

  <nav aria-label={t.start} class="choices">
    <button type="button" class="choice chain" onclick={onchain}>
      <span class="stack" aria-hidden="true">
        <span class="a"><Meme meme={chainFaces[0]!} size={56} decorative /></span>
        <span class="b"><Meme meme={chainFaces[1]!} size={56} decorative /></span>
      </span>
      <span class="words">
        <strong>{t.chainTitle}</strong>
        <span>{t.chainBody}</span>
      </span>
    </button>
    <button type="button" class="choice send" onclick={onsend}>
      <span class="icon" aria-hidden="true"><Icon name="mail" size={34} /></span>
      <span class="words">
        <strong>{t.sendTitle}</strong>
        <span>{t.sendBody}</span>
      </span>
    </button>
  </nav>

  {#if sentNote}
    <p class="sent" role="status"><span>{sentNote}</span><button type="button" class="round" aria-label={domi.common.dismiss} onclick={ondismiss}>✕</button></p>
  {/if}

  {#if outbox.length}
    <section aria-labelledby="outbox" class="waiting">
      <h2 id="outbox" class="label">{t.outbox}</h2>
      <ul>
        {#each outbox as o (o.id)}
          <li class="out">
            <Meme meme={o.meme} size={48} decorative />
            <span class="words">
              <strong>{t.outLine(kindOf(o), memeTitle(o.meme))}</strong>
              <span class:problem={o.problem}>{o.problem ?? t.outPending}</span>
            </span>
            {#if o.problem}<button type="button" class="chip" onclick={() => ondiscard(o)}>{t.discard}</button>{/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <section aria-labelledby="waiting" class="waiting">
    <h2 id="waiting" class="label">{t.waiting}</h2>
    {#if waiting.length === 0}
      <p class="empty">{t.empty}</p>
    {:else}
      <ul>
        {#each waiting.slice(0, 2) as item (item.chainId)}
          <li>
            <button type="button" class="wait" onclick={() => onopen(item)}>
              <Meme meme={item.meme} size={48} decorative />
              <span class="words">
                <strong>{item.kind === 'postcard' ? t.postcardFor : t.chainTurn}</strong>
                <span>{item.kind === 'postcard' ? t.postcardLine(memeTitle(item.meme), dayLabel(item.expiresDay)) : t.chainLine(item.depth + 1, item.maxStops, memeTitle(item.meme))}</span>
              </span>
              {#if item.kind === 'chain'}<span class="dot" aria-hidden="true"></span>{/if}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
    <button type="button" class="all" onclick={onyours}>{t.all} <Icon name="chevron" size={18} /></button>
    <a class="puzzle" href="../">
      <img src={puzzleIcon} alt="" width="40" height="40" />
      <span class="words"><strong>{GAME_NAME}</strong><span>{t.puzzleBody}</span></span>
      <Icon name="chevron" size={18} />
    </a>
  </section>

  <p class="note foot-note">
    {sendingOff ? t.footOff : t.foot}
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
  .sent { margin-top: 14px; display: flex; align-items: center; gap: 6px; padding: 4px 4px 4px 14px; border-radius: 16px; background: var(--raised); box-shadow: inset 0 0 0 1px var(--gold); font-size: 14px; line-height: 1.35; }
  .sent span { flex: 1; }
  .out { display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 8px 8px 8px 8px; border-radius: 18px; background: #0e0e12; box-shadow: inset 0 0 0 1px var(--hair); }
  .out strong { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .out .words span { font-size: 13px; color: var(--lilac); }
  .out .problem { color: var(--gold); }
  .foot-note { margin-top: auto; padding: 18px 4px 0; text-align: center; color: #a9a3c2; }
  /* The sister app: Moin Moin Moin, the puzzle, at the site's root. */
  .puzzle { margin-top: 10px; display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px 12px 8px 8px; border-radius: 18px; background: #0e0e12; box-shadow: inset 0 0 0 1px var(--hair); text-decoration: none; }
  .puzzle img { flex: none; border-radius: 10px; }
  .puzzle strong { font-family: var(--serif); font-size: 20px; }
  .puzzle .words span { font-size: 13px; color: var(--lilac); }
</style>
