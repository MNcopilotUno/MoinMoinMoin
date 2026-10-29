<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { copy, portrait } from '@moin/ui';
  import type { ThemeSetting } from '../lib/progress';
  import Icons from './Icons.svelte';

  /** The settings sheet and its dialogs (.agents/features/settings.md). */
  interface Props {
    sound: boolean;
    volume: number;
    haptics: boolean;
    theme: ThemeSetting;
    narrator: boolean;
    /** Calm motion as shown: the setting, or the phone's reduce-motion. */
    calm: boolean;
    stars: number;
    maxStars: number;
    solved: number;
    onsound: (on: boolean) => void;
    onvolume: (percent: number) => void;
    onhaptics: (on: boolean) => void;
    ontheme: (theme: ThemeSetting) => void;
    onnarrator: (on: boolean) => void;
    oncalm: (on: boolean) => void;
    onreset: () => void;
    onclose: () => void;
  }
  let { sound, volume, haptics, theme, narrator, calm, stars, maxStars, solved,
    onsound, onvolume, onhaptics, ontheme, onnarrator, oncalm, onreset, onclose }: Props = $props();

  const t = copy.settings;
  const themes: ThemeSetting[] = ['light', 'auto', 'dark'];
  const face = portrait({ role: 'fisherman', mood: 'smiling', facing: 'S', id: 'about-face', pips: false });
  let view = $state<'main' | 'about'>('main');
  let confirming = $state(false);
  let sheet: HTMLElement;
  let startOverButton = $state<HTMLButtonElement | null>(null);
  let keepButton = $state<HTMLButtonElement | null>(null);

  const switches = $derived([
    { id: 'sound', label: t.sound, hint: t.soundHint, on: sound, flip: () => onsound(!sound) },
    { id: 'haptics', label: t.haptics, hint: t.hapticsHint, on: haptics, flip: () => onhaptics(!haptics) },
  ]);
  const playSwitches = $derived([
    { id: 'narrator', label: t.narrator, hint: t.narratorHint, on: narrator, flip: () => onnarrator(!narrator) },
    { id: 'calm', label: t.calm, hint: t.calmHint, on: calm, flip: () => oncalm(!calm) },
  ]);

  onMount(() => sheet.querySelector<HTMLElement>('.close')?.focus());

  async function show(next: 'main' | 'about') {
    view = next;
    await tick();
    sheet.querySelector<HTMLElement>(next === 'about' ? '.back' : '.about-link')?.focus();
  }

  async function askReset() {
    confirming = true;
    await tick();
    keepButton?.focus();
  }

  async function keep() {
    confirming = false;
    await tick();
    startOverButton?.focus();
  }

  /** Escape closes the innermost layer; Tab cycles inside it (the page behind is inert). */
  function keydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (confirming) void keep();
      else if (view === 'about') void show('main');
      else onclose();
      return;
    }
    if (event.key !== 'Tab') return;
    const scope = confirming ? sheet.querySelector<HTMLElement>('.confirm') ?? sheet : sheet;
    const items = [...scope.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled):not([type=radio]), input[type=radio]:checked')];
    const first = items[0];
    const last = items[items.length - 1];
    if (!scope.contains(document.activeElement)) { event.preventDefault(); first?.focus(); }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
</script>

<svelte:window onkeydown={keydown} />

<div class="backdrop" role="presentation" onclick={onclose}></div>
<div class="sheet" role="dialog" aria-modal="true" aria-label={t.title} bind:this={sheet}>
  <span class="grip" aria-hidden="true"></span>
  {#if view === 'main'}
    <header>
      <h2>{t.title}</h2>
      <button type="button" class="round close" onclick={onclose} aria-label={copy.close}><Icons name="close" /></button>
    </header>

    <div class="group" inert={confirming}>
      <h3>{t.soundGroup}</h3>
      {#each switches as s (s.id)}
        <button type="button" class="switch-row" role="switch" aria-checked={s.on} aria-labelledby={`${s.id}-label`} aria-describedby={`${s.id}-hint`} onclick={s.flip}>
          <span class="text"><strong id={`${s.id}-label`}>{s.label}</strong><span id={`${s.id}-hint`}>{s.hint}</span></span>
          <span class="track" class:on={s.on} aria-hidden="true"><span class="knob"></span></span>
        </button>
      {/each}
      <label class="volume" class:off={!sound}>
        <span>{t.volume}</span>
        <input type="range" min="0" max="100" step="5" value={volume} disabled={!sound}
          oninput={(e) => onvolume(Number((e.currentTarget as HTMLInputElement).value))} />
        <output>{volume} %</output>
      </label>

      <fieldset class="look">
        <legend>{copy.theme}</legend>
        <div class="pills">
          {#each themes as th (th)}
            <label class:on={theme === th}>
              <input type="radio" name="look" value={th} checked={theme === th} onchange={() => ontheme(th)} />
              {copy.themes[th]}
            </label>
          {/each}
        </div>
      </fieldset>

      <h3>{t.play}</h3>
      {#each playSwitches as s (s.id)}
        <button type="button" class="switch-row" role="switch" aria-checked={s.on} aria-labelledby={`${s.id}-label`} aria-describedby={`${s.id}-hint`} onclick={s.flip}>
          <span class="text"><strong id={`${s.id}-label`}>{s.label}</strong><span id={`${s.id}-hint`}>{s.hint}</span></span>
          <span class="track" class:on={s.on} aria-hidden="true"><span class="knob"></span></span>
        </button>
      {/each}

      <h3>{t.progress}</h3>
      <div class="progress">
        <span data-testid="progress">{t.progressLine(stars, maxStars, solved)}</span>
        <button type="button" class="pill" onclick={askReset} disabled={stars + solved === 0} bind:this={startOverButton}>{t.startOver}</button>
      </div>

      <button type="button" class="about-link" onclick={() => show('about')}>
        {t.about}<Icons name="back" />
      </button>
    </div>

    {#if confirming}
      <div class="dim" aria-hidden="true"></div>
      <div class="confirm" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-body">
        <h2 id="reset-title">{t.resetTitle}</h2>
        <p id="reset-body">{t.resetBody(stars)}</p>
        <button type="button" class="primary" onclick={keep} bind:this={keepButton}>{t.keepStars}</button>
        <button type="button" class="secondary" onclick={() => { confirming = false; onreset(); }}>{t.resetConfirm}</button>
      </div>
    {/if}
  {:else}
    <header>
      <button type="button" class="round back" onclick={() => show('main')} aria-label={t.back}><Icons name="back" /></button>
      <h2>{t.about}</h2>
    </header>
    <div class="who">
      <span class="face" aria-hidden="true">{@html face}</span>
      <div><p class="name">Moin Moin Moin</p><p class="tag">{t.aboutTagline}</p></div>
    </div>
    <dl>
      {#each t.aboutItems as [term, text] (term)}
        <div><dt>{term}</dt><dd>{text}</dd></div>
      {/each}
    </dl>
    <a class="source" href="https://github.com/MNcopilotUno/MoinMoinMoin" rel="noreferrer">{t.source}</a>
  {/if}
</div>

<style>
  .backdrop { position: fixed; inset: 0; background: rgba(30, 43, 76, 0.34); z-index: 30; }
  .sheet {
    position: fixed; z-index: 31; left: 0; right: 0; margin-inline: auto;
    top: max(48px, env(safe-area-inset-top)); bottom: 0; width: min(100vw, 30rem);
    overflow-y: auto; overscroll-behavior: contain;
    background: var(--paper); color: var(--ink); border-radius: 28px 28px 0 0;
    box-shadow: 0 -12px 40px var(--shadow);
    padding: 8px 18px max(20px, env(safe-area-inset-bottom));
    display: flex; flex-direction: column; gap: 6px;
    animation: up 0.32s cubic-bezier(0.2, 0.9, 0.3, 1.05);
  }
  @keyframes up { from { transform: translateY(40%); opacity: 0; } }
  :global(:root[data-calm]) .sheet { animation: none; }
  .grip { align-self: center; width: 44px; height: 5px; border-radius: 3px; background: var(--line); opacity: 0.45; }
  header { display: flex; align-items: center; gap: 10px; margin: 4px 0 6px; }
  h2 { margin: 0; flex: 1; font-family: var(--serif); font-weight: 700; font-size: 2.1rem; line-height: 1; }
  .group { display: flex; flex-direction: column; }
  h3, legend {
    margin: 14px 0 2px; padding: 0; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-soft);
  }
  .round {
    width: 44px; height: 44px; flex: none; border-radius: 50%; border: 1.5px solid var(--line); background: transparent;
    color: var(--ink); display: grid; place-items: center; cursor: pointer; padding: 0;
  }
  .round :global(svg), .about-link :global(svg) { width: 18px; height: 18px; }
  .switch-row {
    min-height: 58px; display: flex; align-items: center; gap: 12px; padding: 6px 0; width: 100%;
    border: 0; border-bottom: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
    background: transparent; color: var(--ink); font: inherit; text-align: left; cursor: pointer;
  }
  .text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .text strong { font-size: 1rem; }
  .text span { font-size: 0.82rem; color: var(--ink-soft); }
  .track {
    flex: none; width: 50px; height: 30px; border-radius: 15px; position: relative; box-sizing: border-box;
    border: 2px solid var(--ink-soft); background: transparent; transition: background 0.2s, border-color 0.2s;
  }
  .track.on { background: var(--ink); border-color: var(--ink); }
  .knob { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: var(--ink-soft); transition: left 0.2s; }
  .track.on .knob { left: 23px; background: var(--paper); }
  :global(:root[data-calm]) .track, :global(:root[data-calm]) .knob { transition: none; }
  .volume {
    min-height: 52px; display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--ink) 12%, transparent); font-weight: 700;
  }
  .volume.off { opacity: 0.5; }
  .volume span { width: 4.4rem; }
  .volume input { flex: 1; min-height: 44px; accent-color: var(--ink); }
  .volume output { width: 3rem; text-align: right; font-size: 0.85rem; color: var(--ink-soft); }
  .look { margin: 0; padding: 0; border: 0; min-width: 0; }
  .pills { display: flex; gap: 6px; margin-top: 6px; }
  .pills label {
    flex: 1; min-height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 999px;
    border: 1.5px solid var(--line); cursor: pointer; font-weight: 700; font-size: 0.9rem;
  }
  .pills label.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .pills input { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .pills label:focus-within { outline: 3px solid var(--ink); outline-offset: 2px; }
  .progress { display: flex; align-items: center; gap: 12px; margin-top: 6px; }
  .progress span { flex: 1; font-weight: 700; font-size: 0.95rem; }
  .pill {
    min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid var(--ink); background: transparent;
    color: var(--ink); font: inherit; font-weight: 800; font-size: 0.9rem; cursor: pointer;
  }
  .pill:disabled { opacity: 0.45; cursor: default; }
  .about-link {
    margin-top: 18px; min-height: 48px; display: flex; align-items: center; justify-content: space-between; width: 100%;
    border: 0; border-top: 1px solid color-mix(in srgb, var(--ink) 12%, transparent); background: transparent;
    color: var(--ink); font: inherit; font-weight: 700; font-size: 1rem; cursor: pointer; padding: 0;
  }
  .about-link :global(svg) { transform: rotate(180deg); }
  .dim { position: fixed; inset: 0; background: rgba(20, 26, 51, 0.45); z-index: 1; }
  .confirm {
    position: fixed; z-index: 2; left: 50%; top: 22dvh; transform: translateX(-50%); width: min(calc(100vw - 48px), 24rem);
    padding: 22px 22px 20px; border-radius: 26px; background: var(--paper); box-shadow: 0 20px 50px rgba(20, 26, 51, 0.45);
    display: flex; flex-direction: column; gap: 10px; text-align: center;
  }
  .confirm h2 { font-size: 1.75rem; line-height: 1.05; flex: none; }
  .confirm p { margin: 0 0 6px; font-size: 0.95rem; line-height: 1.45; color: var(--ink-soft); }
  .primary, .secondary {
    min-height: 48px; border-radius: 999px; font: inherit; font-weight: 800; font-size: 0.95rem; cursor: pointer;
    border: 1.5px solid var(--ink);
  }
  .primary { background: var(--ink); color: var(--paper); }
  .secondary { background: transparent; color: var(--ink); }
  .who { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 20px; background: color-mix(in srgb, var(--ink) 7%, var(--paper)); }
  .face { width: 64px; height: 70px; flex: none; border-radius: 16px; overflow: hidden; background: var(--tile-solved); }
  .face :global(svg) { width: 100%; height: 100%; display: block; }
  .name { margin: 0; font-family: var(--serif); font-weight: 700; font-size: 1.55rem; line-height: 1; }
  .tag { margin: 4px 0 0; font-size: 0.82rem; color: var(--ink-soft); }
  dl { margin: 14px 0 0; display: flex; flex-direction: column; gap: 14px; }
  dt { font-weight: 800; }
  dd { margin: 2px 0 0; font-size: 0.9rem; line-height: 1.45; color: var(--ink-soft); }
  .source {
    margin-top: auto; min-height: 48px; display: grid; place-items: center; border-radius: 999px; border: 1.5px solid var(--ink);
    color: var(--ink); font-weight: 800; text-decoration: none;
  }
  button:focus-visible, a:focus-visible, input:focus-visible { outline: 3px solid var(--ink); outline-offset: 2px; }
</style>
