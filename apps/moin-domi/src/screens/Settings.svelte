<script lang="ts">
  import Icon from '../components/Icon.svelte';
  import type { Settings } from '../lib/db.js';

  interface Props { settings: Settings; onchange: (s: Settings) => void; onforget: () => void; onback: () => void; onabout: () => void }
  let { settings, onchange, onforget, onback, onabout }: Props = $props();
  let confirming = $state(false);
  const calm = $derived(settings.calm ?? (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches));
  const rows = $derived([
    { key: 'rememberNick', label: 'Remember my nickname', hint: settings.nick ? `Keeps “${settings.nick}” here, so you needn’t type it each time` : 'Keeps the name you sign with here, on this phone', on: settings.rememberNick },
    { key: 'sound', label: 'The Moin sound', hint: 'Plays when you pass a Moin on', on: settings.sound },
    { key: 'calm', label: 'Calm motion', hint: 'No wave, no drifting; the tree simply appears', on: calm },
  ] as const);
  function flip(key: 'rememberNick' | 'sound' | 'calm', on: boolean) {
    onchange(key === 'rememberNick' ? { ...settings, rememberNick: !on, nick: on ? '' : settings.nick } : { ...settings, [key]: !on });
  }
</script>

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label="Home" onclick={onback}><Icon name="back" /></button>
    <h1 tabindex="-1">Settings</h1>
  </div>

  <section class="panel prefs" aria-label="Preferences">
    {#each rows as r (r.key)}
      <button type="button" role="switch" aria-checked={r.on} onclick={() => flip(r.key, r.on)}>
        <span class="txt"><strong>{r.label}</strong><span>{r.hint}</span></span>
        <span class="track" class:on={r.on} aria-hidden="true"><span></span></span>
      </button>
    {/each}
  </section>

  <section aria-labelledby="pv" class="pv">
    <h2 id="pv" class="label">What the relay sees</h2>
    <div class="cols">
      <div class="panel"><p class="gold">Never</p><ul><li>your memes</li><li>the captions</li><li>nicknames</li><li>the keys in links</li></ul></div>
      <div class="panel"><p class="soft">Only this</p><ul><li>how the tree branches</li><li>how big each stop is</li><li>the day of each stop</li><li>when a phone asks for a stop</li></ul></div>
    </div>
    <p class="note">Like any website it sees your connection while you use it, and keeps no record of it. No accounts, no cookies, no tracking.</p>
  </section>

  <section class="data" aria-label="Your data">
    {#if confirming}
      <div class="panel ask" role="alertdialog" aria-labelledby="forget-q">
        <p id="forget-q"><strong>Forget everything?</strong> Your list and every saved key leave this phone. Chains you’re in carry on without you.</p>
        <div class="row">
          <button type="button" class="primary" onclick={() => (confirming = false)}>Keep it</button>
          <button type="button" class="outline" onclick={() => { confirming = false; onforget(); }}>Forget</button>
        </div>
      </div>
    {:else}
      <button type="button" class="forget" onclick={() => (confirming = true)}><Icon name="trash" size={18} color="#F2C46B" /> Forget everything on this phone</button>
      <p class="note">Removes your list and saved keys from this phone. Chains you’re in carry on without you.</p>
    {/if}
  </section>

  <button type="button" class="about" onclick={onabout}>About and the rules <Icon name="chevron" size={18} /></button>

  <footer class="note foot"><span>Always after dark</span><span>Moin Domi 0.1 · relay v1</span></footer>
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
