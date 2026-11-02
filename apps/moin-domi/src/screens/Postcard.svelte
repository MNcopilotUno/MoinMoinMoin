<script lang="ts">
  import Icon from '../components/Icon.svelte';
  import Report from '../components/Report.svelte';
  import Meme from '../components/Meme.svelte';
  import { dayLabel } from '../lib/config.js';
  import type { Item } from '../lib/db.js';
  import { saveImage } from '../lib/save.js';
  import { domi } from '@moin/ui/copy/domi';

  interface Props { item: Item; onback: () => void; onreply: () => void; onlink: () => void }
  let { item, onback, onreply, onlink }: Props = $props();
  const t = domi.postcard;
  let el = $state<HTMLElement | undefined>();
  const kicker = $derived(item.kind === 'postcard' ? t.kicker.postcard : item.status === 'last-stop' ? t.kicker.lastStop : t.kicker.chain);
</script>

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label={domi.common.home} onclick={onback}><Icon name="back" /></button>
    <p class="label grow">{kicker}</p>
  </div>
  <section class="say">
    <h1 tabindex="-1">{#if item.mine}{t.yours}{:else if item.meme.nick}{@const from = t.from(item.meme.nick)}{from[0]}<em>{from[1]}</em>{:else}{t.anonymous}{/if}</h1>
    <p>{item.status === 'last-stop' ? t.lastStop : item.status === 'full' ? t.full : item.mine ? t.mine : t.received}</p>
  </section>
  <div class="card"><Meme meme={item.meme} size={330} bind:element={el} /></div>
  <dl>
    <div class="panel"><dt>{t.until}</dt><dd>{dayLabel(item.expiresDay)}</dd></div>
    <div class="panel"><dt>{t.who}</dt><dd>{t.onlyLink}</dd></div>
  </dl>
  <div class="foot">
    <div class="row">
      {#if item.mine}<button type="button" class="primary" onclick={onlink}>{t.showLink}</button>
      {:else}<button type="button" class="primary" onclick={onreply}>{t.reply}</button>{/if}
      <button type="button" class="outline" onclick={() => el && saveImage(el, item.meme)}>{t.save}</button>
    </div>
    {#if !item.mine}<Report {item} />{/if}
    <p class="note c">{t.note}</p>
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
