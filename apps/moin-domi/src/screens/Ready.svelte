<script lang="ts">
  import lighthouse from '@moin/assets/art/lighthouse-night.jpg';
  import Icon from '../components/Icon.svelte';
  import Meme from '../components/Meme.svelte';
  import type { Item } from '../lib/db.js';
  import { passwordProblem, slugify } from '@moin/tessera';
  import { sendLinkFor } from '../lib/flow.js';
  import { suggestPassphrase } from '../lib/passphrase.js';
  import { domi } from '@moin/ui/copy/domi';

  interface Props { item: Item; started: boolean; password?: string | null; canLock?: boolean; onlock?: (password: string, name: string) => Promise<string | null>; onback: () => void; ondone: () => void; ontree: () => void }
  let { item, started, password = null, canLock = false, onlock, onback, ondone, ontree }: Props = $props();
  const t = domi.ready;
  let locking = $state(false);
  let lockPw = $state('');
  let lockName = $state('');
  let lockBusy = $state(false);
  let lockError = $state<string | null>(null);
  const lockProblem = $derived(passwordProblem(lockPw));
  async function addLock() {
    if (!onlock || lockBusy || lockProblem) return;
    lockBusy = true;
    lockError = await onlock(lockPw, lockName);
    lockBusy = false;
    if (!lockError) locking = false;
  }
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
    <button type="button" class="round dim" aria-label={domi.common.back} onclick={onback}><Icon name="back" /></button>
    <span class="grow"></span>
    {#if started}<span class="step">{domi.common.step(3)}</span>{/if}
  </div>

  <div class="card"><Meme meme={item.meme} size={210} /></div>

  <section class="say">
    <h1 tabindex="-1">{postcard ? t.postcardTitle : started ? t.chainTitle : t.passedTitle}</h1>
    <p>{postcard ? t.postcardBody : t.chainBody(item.depth + 1, item.maxStops)}</p>
  </section>

  <figure class="panel link" data-link={link}>
    <p class="url" aria-label={t.link}><span class="d">{domi.lock.prefix}</span>{parts.id}<span class="k">{parts.key}</span></p>
    {#if locked}
      <figcaption><Icon name="lock" size={16} color="#F2C46B" /><span>{t.locked}</span></figcaption>
    {:else}
      <figcaption><Icon name="lock" size={16} color="#F2C46B" /><span>{t.key}</span></figcaption>
    {/if}
  </figure>

  {#if locked && password}
    <section class="panel pwbox" aria-label={t.password}>
      <p class="label">{t.passwordOnce}</p>
      <p class="pw">{password}</p>
      <button type="button" class="chip" onclick={copyPassword} aria-live="polite">{pwCopied ? domi.common.copied : t.copyPassword}</button>
    </section>
  {/if}

  {#if canLock && !locked}
    {#if locking}
      <section class="panel lockbox" aria-label={t.lockBox}>
        <div class="field"><label for="ready-pw" class="soft">{domi.common.password}</label>
          <input id="ready-pw" bind:value={lockPw} autocomplete="new-password" autocapitalize="none" spellcheck="false" aria-describedby="ready-pw-hint" />
          <button type="button" class="chip mini" onclick={() => (lockPw = suggestPassphrase())}>{domi.common.suggest}</button></div>
        <div class="field"><label for="ready-name" class="soft">{domi.common.name}</label>
          <input id="ready-name" bind:value={lockName} placeholder={t.namePlaceholder} autocapitalize="none" spellcheck="false" /></div>
        <p id="ready-pw-hint" class="hint" role={lockError ? 'alert' : undefined}>{lockError ?? (lockProblem === 'common' ? domi.lock.tooCommon : lockProblem === 'too-short' ? domi.lock.tooShort : lockName ? domi.lock.path(slugify(lockName)) : t.noKey)}</p>
        <button type="button" class="primary" disabled={lockBusy || lockProblem !== null} onclick={addLock}>{lockBusy ? domi.common.locking : t.lockIt}</button>
      </section>
    {:else}
      <button type="button" class="ghost" onclick={() => { locking = true; lockPw = suggestPassphrase(); }}>{t.withPassword}</button>
    {/if}
  {/if}

  <div class="foot">
    <div class="row">
      {#if canShare}<button type="button" class="primary" onclick={share}><Icon name="share" size={20} /> {t.share}</button>{/if}
      <button type="button" class={canShare ? 'outline' : 'primary'} onclick={copy} aria-live="polite">{copied ? domi.common.copied : t.copyLink}</button>
    </div>
    {#if !postcard && !started}<button type="button" class="ghost" onclick={ontree}>{t.tree}</button>{/if}
    <button type="button" class="ghost" onclick={ondone}>{t.done}</button>
    <p class="note c">{t.note}</p>
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
  .lockbox { position: relative; margin-top: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
  .lockbox input { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 14px; }
  .mini { min-height: 36px; padding: 0 12px; font-size: 13px; }
  .hint { margin: 0 4px; font-size: 12.5px; line-height: 1.35; color: var(--mist); overflow-wrap: anywhere; }
  .pwbox { position: relative; margin-top: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
  .pw { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 15px; color: var(--gold); word-break: break-all; }
  .c { text-align: center; }
</style>
