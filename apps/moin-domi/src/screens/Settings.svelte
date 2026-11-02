<script lang="ts">
  import Icon from '../components/Icon.svelte';
  import type { Settings } from '../lib/db.js';
  import { domi } from '@moin/ui/copy/domi';

  interface Props { settings: Settings; onchange: (s: Settings) => void; onforget: () => void; onback: () => void; onabout: () => void }
  let { settings, onchange, onforget, onback, onabout }: Props = $props();
  const t = domi.settings;
  let confirming = $state(false);
  const calm = $derived(settings.calm ?? (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches));
  const rows = $derived([
    { key: 'rememberNick', label: t.rememberNick, hint: t.rememberNickHint(settings.nick), on: settings.rememberNick },
    { key: 'sound', label: t.sound, hint: t.soundHint, on: settings.sound },
    { key: 'calm', label: t.calm, hint: t.calmHint, on: calm },
  ] as const);
  function flip(key: 'rememberNick' | 'sound' | 'calm', on: boolean) {
    onchange(key === 'rememberNick' ? { ...settings, rememberNick: !on, nick: on ? '' : settings.nick } : { ...settings, [key]: !on });
  }
</script>

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label={domi.common.home} onclick={onback}><Icon name="back" /></button>
    <h1 tabindex="-1">{t.title}</h1>
  </div>

  <section class="panel prefs" aria-label={t.prefs}>
    {#each rows as r (r.key)}
      <button type="button" role="switch" aria-checked={r.on} onclick={() => flip(r.key, r.on)}>
        <span class="txt"><strong>{r.label}</strong><span>{r.hint}</span></span>
        <span class="track" class:on={r.on} aria-hidden="true"><span></span></span>
      </button>
    {/each}
  </section>

  <section aria-labelledby="pv" class="pv">
    <h2 id="pv" class="label">{t.relay}</h2>
    <div class="cols">
      <div class="panel"><p class="gold">{t.never}</p><ul>{#each t.neverList as line (line)}<li>{line}</li>{/each}</ul></div>
      <div class="panel"><p class="soft">{t.only}</p><ul>{#each t.onlyList as line (line)}<li>{line}</li>{/each}</ul></div>
    </div>
    <p class="note">{t.relayNote}</p>
  </section>

  <section class="data" aria-label={t.data}>
    {#if confirming}
      <div class="panel ask" role="alertdialog" aria-labelledby="forget-q">
        <p id="forget-q"><strong>{t.forgetAsk}</strong> {t.forgetBody}</p>
        <div class="row">
          <button type="button" class="primary" onclick={() => (confirming = false)}>{t.keep}</button>
          <button type="button" class="outline" onclick={() => { confirming = false; onforget(); }}>{t.forget}</button>
        </div>
      </div>
    {:else}
      <button type="button" class="forget" onclick={() => (confirming = true)}><Icon name="trash" size={18} color="#F2C46B" /> {t.forgetAll}</button>
      <p class="note">{t.forgetNote}</p>
    {/if}
  </section>

  <button type="button" class="about" onclick={onabout}>{t.about} <Icon name="chevron" size={18} /></button>

  <footer class="note foot"><span>{t.tagline}</span><span>{t.version}</span></footer>
</main>

<style>
  .bar h1 { font-size: 30px; }
  .prefs { margin-top: 10px; }
  .prefs button { width: 100%; min-height: 72px; display: flex; align-items: center; gap: 12px; padding: 12px 14px 12px 16px; border: 0; background: transparent; text-align: left; }
  .prefs button + button { border-top: 1px solid var(--hair); }
  .txt { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .txt strong { font-size: 16px; }
  .txt span { font-size: 13px; line-height: 1.3; color: var(--mist); }
  .track { flex: none; width: 52px; height: 32px; border-radius: 16px; position: relative; background: #24242b; box-shadow: inset 0 0 0 1px var(--line); }
  .track span { position: absolute; top: 4px; left: 4px; width: 24px; height: 24px; border-radius: 50%; background: var(--mist); transition: left 160ms; }
  .track.on { background: var(--paper); box-shadow: none; }
  .track.on span { left: 24px; background: var(--black); }
  .pv { margin-top: 16px; }
  .pv h2 { margin: 0 4px 8px; }
  .cols { display: flex; gap: 8px; }
  .cols .panel { flex: 1; padding: 12px; }
  .cols p { margin-bottom: 6px; font-size: 13px; font-weight: 800; }
  .gold { color: var(--gold); }
  .cols ul { margin: 0; padding-left: 16px; font-size: 13px; line-height: 1.5; color: #d9d3e9; }
  .pv .note { margin: 8px 4px 0; }
  .data { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
  .forget { min-height: 52px; display: flex; align-items: center; justify-content: center; gap: 8px; border: 0; border-radius: 16px; background: var(--card); box-shadow: inset 0 0 0 1.5px var(--gold); font-size: 15px; font-weight: 800; }
  .data > .note { margin: 0 4px; }
  .ask { padding: 14px; display: flex; flex-direction: column; gap: 12px; font-size: 14px; line-height: 1.4; color: #d9d3e9; box-shadow: inset 0 0 0 1.5px var(--gold); }
  .ask strong { color: var(--paper); }
  .about { margin-top: 12px; min-height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px 0 16px; border: 0; border-radius: 16px; background: var(--card); box-shadow: inset 0 0 0 1px var(--hair); font-size: 15px; font-weight: 800; }
  footer { flex-direction: row; justify-content: space-between; color: var(--quiet); }
</style>
