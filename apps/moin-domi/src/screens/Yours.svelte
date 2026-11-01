<script lang="ts">
  import { memeTitle } from '@moin/meme';
  import Icon from '../components/Icon.svelte';
  import Meme from '../components/Meme.svelte';
  import { dayLabel, today } from '../lib/config.js';
  import type { Item } from '../lib/db.js';

  interface Props { items: readonly Item[]; onback: () => void; onopen: (item: Item) => void }
  let { items, onback, onopen }: Props = $props();
  let show = $state<'all' | 'chain' | 'postcard'>('all');
  const list = $derived(items.filter((i) => show === 'all' || i.kind === show));
  function tag(i: Item): { text: string; tone: 'gold' | 'paper' | 'lilac' | 'quiet' } {
    if (i.expiresDay - today() <= 3) return { text: 'Ending soon', tone: 'quiet' };
    switch (i.status) {
      case 'your-turn': return { text: 'Your turn', tone: 'gold' };
      case 'finale': return { text: 'Finale', tone: 'paper' };
      case 'postcard-in': return { text: 'Postcard', tone: 'lilac' };
      case 'postcard-out': return { text: 'Postcard', tone: 'quiet' };
      case 'last-stop': case 'full': return { text: 'Seen', tone: 'quiet' };
      default: return { text: 'Travelling', tone: 'quiet' };
    }
  }
  function meta(i: Item): string {
    const until = `gone after ${dayLabel(i.expiresDay)}`;
    if (i.kind === 'postcard') return `${i.mine ? 'You sent it' : i.meme.nick ? `From ${i.meme.nick}` : 'Sent to you'} · ${until}`;
    if (i.status === 'your-turn') return `Stop ${i.depth + 1} of ${i.maxStops} · ${until}`;
    return `${i.mine && i.depth === 1 ? `You started it · ${i.maxStops} stops` : `You were stop ${i.depth} of ${i.maxStops}`} · ${until}`;
  }
</script>

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label="Home" onclick={onback}><Icon name="back" /></button>
    <h1 tabindex="-1">Yours</h1>
  </div>
  <div class="tabs" role="tablist" aria-label="Show">
    {#each [['all', 'All'], ['chain', 'Chains'], ['postcard', 'Postcards']] as [id, label] (id)}
      <button type="button" role="tab" aria-selected={show === id} onclick={() => (show = id as typeof show)}>{label}</button>
    {/each}
  </div>
  {#if list.length === 0}
    <p class="empty">{items.length ? 'Nothing here.' : 'Nothing yet. Chains you start or receive, and postcards, are kept here — on this phone only.'}</p>
  {:else}
    <ul>
      {#each list as i (i.chainId)}
        {@const t = tag(i)}
        <li>
          <button type="button" class="it" onclick={() => onopen(i)}>
            <Meme meme={i.meme} size={60} decorative />
            <span class="txt">
              <span class={`tag ${t.tone}`}>{t.text}</span>
              <strong>{memeTitle(i.meme)}</strong>
              <span class="meta">{meta(i)}</span>
            </span>
            <Icon name="chevron" size={18} color="#7D7894" />
          </button>
        </li>
      {/each}
    </ul>
  {/if}
  <p class="note foot c">This list lives only on this phone. Everything goes 30 days after its last stop.</p>
</main>

<style>
  .bar h1 { font-size: 30px; }
  .tabs { margin-top: 8px; padding: 4px; display: flex; gap: 4px; border-radius: 999px; background: #0e0e12; box-shadow: inset 0 0 0 1px var(--hair); }
  .tabs button { flex: 1; min-height: 44px; border: 0; border-radius: 999px; background: transparent; font-size: 14px; font-weight: 800; }
  .tabs button[aria-selected='true'] { background: var(--paper); color: var(--black); }
  ul { margin: 12px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .it { width: 100%; display: flex; align-items: center; gap: 12px; min-height: 76px; padding: 8px 12px 8px 8px; border: 0; border-radius: 18px; background: var(--card); box-shadow: inset 0 0 0 1px var(--hair); text-align: left; }
  .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .txt strong { font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .meta { font-size: 12.5px; color: var(--mist); }
  .tag { align-self: flex-start; padding: 1px 8px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; }
  .gold { background: var(--gold); color: var(--black); }
  .paper { background: var(--paper); color: var(--black); }
  .lilac { background: var(--lilac); color: var(--black); }
  .quiet { background: #24242b; color: var(--lilac); }
  .empty { padding: 24px 6px; font-size: 15px; line-height: 1.45; color: var(--mist); }
  .c { text-align: center; }
</style>
