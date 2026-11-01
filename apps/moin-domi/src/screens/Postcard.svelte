<script lang="ts">
  import Icon from '../components/Icon.svelte';
  import Meme from '../components/Meme.svelte';
  import { dayLabel } from '../lib/config.js';
  import type { Item } from '../lib/db.js';
  import { saveImage } from '../lib/save.js';

  interface Props { item: Item; onback: () => void; onreply: () => void; onlink: () => void }
  let { item, onback, onreply, onlink }: Props = $props();
  let el = $state<HTMLElement | undefined>();
  const kicker = $derived(item.kind === 'postcard' ? 'A meme postcard' : item.status === 'last-stop' ? 'The last stop' : 'A chain');
</script>

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label="Home" onclick={onback}><Icon name="back" /></button>
    <p class="label grow">{kicker}</p>
  </div>
  <section class="say">
    <h1 tabindex="-1">{#if item.mine}Your postcard{:else if item.meme.nick}Moin from <em>{item.meme.nick}</em>{:else}A Moin for you{/if}</h1>
    <p>
      {#if item.status === 'last-stop'}This chain has reached its last stop; only the people in it see the finale.
      {:else if item.status === 'full'}Someone already passed this one on, so it can’t take another turn.
      {:else if item.mine}Only people who have the link can open it.
      {:else}Sent to you as a private link. Only people who have the link can open it.{/if}
    </p>
  </section>
  <div class="card"><Meme meme={item.meme} size={330} bind:element={el} /></div>
  <dl>
    <div class="panel"><dt>Opens until</dt><dd>{dayLabel(item.expiresDay)}</dd></div>
    <div class="panel"><dt>Who can see it</dt><dd>Only this link</dd></div>
  </dl>
  <div class="foot">
    <div class="row">
      {#if item.mine}<button type="button" class="primary" onclick={onlink}>Show the link</button>
      {:else}<button type="button" class="primary" onclick={onreply}>Send one back</button>{/if}
      <button type="button" class="outline" onclick={() => el && saveImage(el, item.meme)}>Save image</button>
    </div>
    <p class="note c">A saved image leaves the private link: it is yours to share, and it won’t expire.</p>
  </div>
</main>

<style>
  .grow { flex: 1; }
  .say { padding: 14px 4px 0; }
  h1 { font-family: var(--serif); font-weight: 700; font-size: 40px; line-height: 0.98; }
  h1 em { font-style: italic; }
  .say p { margin-top: 8px; font-size: 15px; line-height: 1.4; color: var(--lilac); }
  .card { display: flex; justify-content: center; padding-top: 20px; }
  .card :global(.meme) { box-shadow: 0 24px 60px rgba(201, 195, 226, 0.12), 0 0 0 1px rgba(246, 239, 223, 0.18); }
  dl { margin: 18px 0 0; display: flex; gap: 10px; font-size: 13px; }
  dl div { flex: 1; padding: 10px 12px; border-radius: 14px; }
  dt { color: var(--dusk); font-weight: 700; }
  dd { margin: 2px 0 0; font-weight: 800; }
  .c { text-align: center; }
</style>
