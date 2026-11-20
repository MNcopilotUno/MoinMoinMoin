<script lang="ts">
  import type { Relay } from '@moin/tessera';
  import { untrack } from 'svelte';
  import { domi } from '@moin/ui/copy/domi';
  import Icon from '../components/Icon.svelte';
  import Meme from '../components/Meme.svelte';
  import { today } from '../lib/config.js';
  import { one, page, postLink, postReportHref, type Post } from '../lib/feed.js';

  interface Props {
    relay: Relay | null;
    offline: boolean;
    /** A post a shared link named (`…/domi/p/<id>`), shown first. */
    focusId: string | null;
    /** The post just made here. */
    postedId: string | null;
    onback: () => void;
    onpost: () => void;
  }
  let { relay, offline, focusId, postedId, onback, onpost }: Props = $props();
  const t = domi.feed;

  let posts = $state<Post[]>([]);
  let focus = $state<Post | null>(null);
  let focusGone = $state(false);
  let more = $state(false);
  let last = $state<number | null>(null);
  let loading = $state(false);
  let failed = $state<string | null>(null);
  let copied = $state<string | null>(null);
  let reported = $state<string | null>(null);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function load(before?: number) {
    if (!relay || loading) return;
    loading = true;
    failed = null;
    try {
      const p = await page(relay, before);
      posts = before === undefined ? p.posts : [...posts, ...p.posts.filter((x) => !posts.some((y) => y.id === x.id))];
      more = p.more;
      last = p.last;
    } catch (e) {
      failed = (e as { reason?: string }).reason === 'offline' ? t.offline : domi.errors.noAnswer;
    } finally {
      loading = false;
    }
  }

  // Runs when the relay, the network or the named post change — and only then: `load` reads and
  // writes `loading` and `posts`, which must not make this effect run again (it would never stop).
  $effect(() => {
    const r = relay, off = offline, id = focusId;
    untrack(() => {
      if (!r || off) return;
      void load();
      if (id) one(r, id).then((p) => { focus = p; focusGone = p === null; }, () => { focusGone = true; });
    });
  });

  async function share(id: string) {
    const link = postLink(id);
    if (canShare) {
      try {
        await navigator.share({ url: link });
      } catch {
        // cancelled
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      copied = id;
      setTimeout(() => (copied = null), 2400);
    } catch {
      copied = null;
    }
  }
</script>

{#snippet card(p: Post)}
  <li class="post" class:mine={p.id === postedId}>
    <Meme meme={p.meme} size={300} />
    <p class="meta">{t.by(p.meme.nick)} · {t.ago(today() - p.day)}</p>
    <div class="acts">
      <button type="button" class="chip" onclick={() => share(p.id)} aria-live="polite">
        <Icon name="share" size={18} />{copied === p.id ? domi.common.copied : canShare ? t.share : t.copyLink}
      </button>
      {#if postReportHref(p.id)}
        <a class="chip" href={postReportHref(p.id)} onclick={() => (reported = p.id)}><Icon name="alert" size={18} />{t.report}</a>
      {/if}
    </div>
    {#if reported === p.id}<p class="note" role="status">{t.reportSent}</p>{/if}
  </li>
{/snippet}

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label={domi.common.home} onclick={onback}><Icon name="back" /></button>
    <h1 tabindex="-1">{t.title}</h1>
  </div>
  <p class="intro">{t.intro}</p>

  {#if postedId}<p class="posted" role="status">{t.posted}</p>{/if}

  {#if !relay}
    <p class="empty">{t.off}</p>
  {:else if offline}
    <p class="empty">{t.offline}</p>
  {:else}
    {#if focusId}
      <section aria-labelledby="one">
        <h2 id="one" class="label">{t.one}</h2>
        {#if focus}<ul>{@render card(focus)}</ul>{:else if focusGone}<p class="empty">{t.gone}</p>{:else}<p class="empty">{t.loading}</p>{/if}
      </section>
    {/if}
    <section aria-labelledby="all">
      <h2 id="all" class="label">{focusId ? t.all : t.newest}</h2>
      {#if failed}
        <p class="empty" role="alert">{failed}</p>
      {:else if posts.length === 0}
        <p class="empty">{loading ? t.loading : t.empty}</p>
      {:else}
        <ul>
          {#each posts.filter((p) => p.id !== focus?.id) as p (p.id)}{@render card(p)}{/each}
        </ul>
        {#if more}
          <button type="button" class="outline more" disabled={loading} onclick={() => load(last ?? undefined)}>{loading ? t.loading : t.more}</button>
        {:else}
          <p class="note end">{t.noMore}</p>
        {/if}
      {/if}
    </section>
  {/if}

  <div class="foot">
    <button type="button" class="primary" onclick={onpost}>{t.post}</button>
  </div>
</main>

<style>
  .intro { margin: 4px 4px 0; font-size: 13.5px; line-height: 1.4; color: var(--lilac); }
  .posted { margin: 12px 0 0; padding: 12px 14px; border-radius: 16px; background: var(--raised); box-shadow: inset 0 0 0 1px var(--gold); color: var(--gold); font-weight: 700; }
  section { padding-top: 14px; }
  section .label { margin: 0 4px 8px; }
  ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 22px; }
  .post { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .post.mine :global(.meme) { box-shadow: 0 0 0 3px var(--gold); }
  .meta { margin: 0; font-size: 13px; color: var(--mist); }
  .acts { display: flex; gap: 8px; }
  .acts .chip { display: inline-flex; align-items: center; gap: 6px; padding: 0 14px; text-decoration: none; color: inherit; }
  .empty { margin: 8px 4px; font-size: 14px; line-height: 1.4; color: var(--mist); }
  .more { width: 100%; margin-top: 18px; }
  .end { margin: 16px 4px 0; text-align: center; }
  .post .note { margin: 0 8px; text-align: center; }
</style>
