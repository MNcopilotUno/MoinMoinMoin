<script lang="ts">
  import lighthouse from '@moin/assets/art/lighthouse-night.jpg';
  import Icon from '../components/Icon.svelte';
  import Meme from '../components/Meme.svelte';
  import type { Item } from '../lib/db.js';
  import { sendLinkFor } from '../lib/flow.js';

  interface Props { item: Item; started: boolean; password?: string | null; onback: () => void; ondone: () => void; ontree: () => void }
  let { item, started, password = null, onback, ondone, ontree }: Props = $props();
  let pwCopied = $state(false);
  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(password ?? '');
      pwCopied = true;
      setTimeout(() => (pwCopied = false), 2400);
    } catch {
      pwCopied = false;
    }
  }
  const link = $derived(sendLinkFor(item));
  const locked = $derived(Boolean(item.lockName));
  const parts = $derived.by(() => {
    const [head = '', key = ''] = link.split('#');
    const at = head.lastIndexOf('/m/');
    return { id: head.slice(at + 3), key: key ? `#${key}` : '' };
  });
  const postcard = $derived(item.kind === 'postcard');
  let copied = $state(false);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      copied = true;
      setTimeout(() => (copied = false), 2400);
    } catch {
      copied = false;
    }
  }
  async function share() {
    try {
      await navigator.share({ url: link });
    } catch {
      // cancelled: nothing to do
    }
  }
</script>

<main class="screen ready">
  <img class="sky" src={lighthouse} alt="" />
  <div class="bar">
    <button type="button" class="round dim" aria-label="Back" onclick={onback}><Icon name="back" /></button>
    <span class="grow"></span>
    {#if started}<span class="step">3 of 3</span>{/if}
  </div>

  <div class="card"><Meme meme={item.meme} size={210} /></div>

  <section class="say">
    <h1 tabindex="-1">{postcard ? 'Your postcard is ready' : started ? 'Your chain is ready' : 'Passed on'}</h1>
    <p>{postcard ? 'Send the link to whoever should see it.' : `Send it to one person. They are stop ${item.depth + 1} of ${item.maxStops}.`}</p>
  </section>

  <figure class="panel link" data-link={link}>
    <p class="url" aria-label="The link"><span class="d">…/m/</span>{parts.id}<span class="k">{parts.key}</span></p>
    {#if locked}
      <figcaption><Icon name="lock" size={16} color="#F2C46B" /><span>Locked with your password. Send the password another way — say it, or use a different app — never in the same message.</span></figcaption>
    {:else}
      <figcaption><Icon name="lock" size={16} color="#F2C46B" /><span>The gold part is the key. It stays in the link and never reaches the relay.</span></figcaption>
    {/if}
  </figure>

  {#if locked && password}
    <section class="panel pwbox" aria-label="The password">
      <p class="label">The password — shown only now</p>
      <p class="pw">{password}</p>
      <button type="button" class="chip" onclick={copyPassword} aria-live="polite">{pwCopied ? 'Copied' : 'Copy password'}</button>
    </section>
  {/if}

  <div class="foot">
    <div class="row">
      {#if canShare}<button type="button" class="primary" onclick={share}><Icon name="share" size={20} /> Send it</button>{/if}
      <button type="button" class={canShare ? 'outline' : 'primary'} onclick={copy} aria-live="polite">{copied ? 'Copied' : 'Copy link'}</button>
    </div>
    {#if !postcard && !started}<button type="button" class="ghost" onclick={ontree}>See the tree</button>{/if}
    <button type="button" class="ghost" onclick={ondone}>Done</button>
    <p class="note c">Gone 30 days after its last stop. You’ll find it under Yours.</p>
  </div>
</main>

<style>
  .ready { padding-top: 0; }
  .sky { position: absolute; left: 0; top: 0; width: 100%; height: 330px; object-fit: cover; object-position: center 30%; opacity: 0.55; -webkit-mask-image: linear-gradient(#000 45%, transparent); mask-image: linear-gradient(#000 45%, transparent); pointer-events: none; animation: none; }
  .bar, .card, .say, .link, .foot { position: relative; }
  .grow { flex: 1; }
  .card { display: flex; justify-content: center; padding-top: 30px; }
  .card :global(.meme) { transform: rotate(-3deg); box-shadow: 0 18px 50px rgba(0, 0, 0, 0.8); }
  .say { padding-top: 22px; text-align: center; }
  h1 { font-family: var(--serif); font-weight: 700; font-size: 36px; line-height: 1; }
  .say p { margin-top: 8px; font-size: 15px; line-height: 1.4; color: var(--lilac); }
  .link { margin: 18px 0 0; padding: 14px 16px; box-shadow: inset 0 0 0 1px var(--line); }
  .url { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 15px; line-height: 1.45; word-break: break-all; }
  .d { color: var(--dusk); }
  .k { color: var(--gold); }
  figcaption { margin-top: 8px; display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; line-height: 1.4; color: var(--mist); }
  figcaption :global(svg) { flex: none; margin-top: 1px; }
  .pwbox { position: relative; margin-top: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
  .pw { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 15px; color: var(--gold); word-break: break-all; }
  .c { text-align: center; }
</style>
