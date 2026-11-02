<script lang="ts">
  import ferry from '@moin/assets/art/ferry-night.jpg';
  import Icon from '../components/Icon.svelte';
  import { domi } from '@moin/ui/copy/domi';

  interface Props { name: string; busy: boolean; error: string | null; waitUntil: number | null; onopen: (password: string) => void; onhome: () => void }
  let { name, busy, error, waitUntil, onopen, onhome }: Props = $props();
  const t = domi.unlock;
  let password = $state('');
  let shown = $state(false);
  let now = $state(Date.now());
  $effect(() => {
    if (!waitUntil) return;
    const t = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(t);
  });
  const waiting = $derived(waitUntil !== null && now < waitUntil);
  const at = $derived(waitUntil ? new Date(waitUntil).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '');
</script>

<main class="screen unlock">
  <img class="sky" src={ferry} alt="" />
  <div class="bar"><button type="button" class="round dim" aria-label={domi.common.home} onclick={onhome}><Icon name="back" /></button></div>
  <section class="say">
    <div class="seal" aria-hidden="true"><Icon name="lock" size={40} color="#F2C46B" /></div>
    <p class="url">{domi.lock.path(name)}</p>
    <h1 tabindex="-1">{t.title}</h1>
    <p class="t">{t.body}</p>
  </section>
  <form class="form" onsubmit={(e) => { e.preventDefault(); if (!busy && !waiting && password) onopen(password); }}>
    <label for="pw" class="soft">{domi.common.password}</label>
    <div class="field pw">
      <input id="pw" type={shown ? 'text' : 'password'} bind:value={password} autocomplete="off" autocapitalize="none" spellcheck="false" />
      <button type="button" class="round" aria-label={shown ? t.hide : t.show} aria-pressed={shown} onclick={() => (shown = !shown)}>
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle>{#if shown}<path d="M3 3l18 18"></path>{/if}</svg>
      </button>
    </div>
    {#if waiting}
      <p class="msg" role="alert"><Icon name="alert" size={16} color="#F2C46B" /> {t.wait(at)}</p>
    {:else if error}
      <p class="msg" role="alert"><Icon name="alert" size={16} color="#F2C46B" /> {error}</p>
    {/if}
    <div class="foot">
      <button type="submit" class="primary" disabled={busy || waiting || !password}>{busy ? t.opening : t.open}</button>
      <p class="note c">{t.note}</p>
    </div>
  </form>
</main>

<style>
  .unlock { padding-top: 0; }
  .sky { position: absolute; left: 0; top: 0; width: 100%; height: 420px; object-fit: cover; object-position: center 35%; opacity: 0.5; -webkit-mask-image: linear-gradient(#000 45%, transparent); mask-image: linear-gradient(#000 45%, transparent); animation: none; }
  .bar, .say, .form { position: relative; }
  .say { padding-top: 60px; text-align: center; }
  .seal { margin: 0 auto; width: 92px; height: 92px; border-radius: 50%; display: grid; place-items: center; background: #000; box-shadow: inset 0 0 0 1.5px var(--gold), 0 0 60px rgba(242, 196, 107, 0.25); }
  .url { margin-top: 22px; font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 14px; color: var(--mist); word-break: break-all; }
  h1 { margin-top: 6px; font-family: var(--serif); font-weight: 700; font-size: 38px; line-height: 1; }
  .t { margin-top: 10px; font-size: 15px; line-height: 1.45; color: var(--lilac); }
  .form { flex: 1; display: flex; flex-direction: column; gap: 10px; margin-top: 28px; }
  .form label { margin: 0 4px; font-size: 13px; font-weight: 700; }
  .pw { min-height: 56px; padding-right: 6px; box-shadow: inset 0 0 0 1.5px var(--paper); }
  .pw input { font-size: 18px; letter-spacing: 0.04em; }
  .msg { margin: 0 4px; display: flex; gap: 8px; align-items: center; font-size: 14px; font-weight: 600; }
  .c { text-align: center; }
</style>
