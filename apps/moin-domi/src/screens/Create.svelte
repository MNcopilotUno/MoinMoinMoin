<script lang="ts">
  import { CAPTION_MAX, tidy, WHERE, type Meme as MemeValue } from '@moin/meme';
  import { portrait } from '@moin/ui/portrait';
  import Icon from '../components/Icon.svelte';
  import Meme from '../components/Meme.svelte';
  import SeagullSprite from '@moin/ui/SeagullSprite.svelte';
  import { WEATHER } from '@moin/meme';
  import { domi } from '@moin/ui/copy/domi';
  import { newId, newSecret, secretToText } from '@moin/tessera';
  import { CAST, PAINTINGS, PLACE_NAMES, portraitOf, WEATHER_NAMES } from '../lib/look.js';
  import { pickPicture, PictureError } from '../lib/picture.js';
  import { pictureUrl, remember } from '../lib/pictures.svelte.js';
  import type { Where } from '@moin/meme';

  interface Props { draft: MemeValue; onchange: (m: MemeValue) => void; onback: () => void; onnext: () => void; postcard: boolean; consent: boolean }
  let { draft, onchange, onback, onnext, postcard, consent = $bindable() }: Props = $props();
  const set = (patch: Partial<MemeValue>) => onchange({ ...draft, ...patch });
  const faces = CAST.map((c) => ({ ...c, svg: c.who === 'gull' ? '' : portrait({ ...portraitOf(c.who, 'smiling'), id: `pick-${c.who}` }) }));
  const t = domi.create;
  const ready = $derived(tidy(draft.top) !== '' || tidy(draft.bottom) !== '');
  const needsConsent = $derived(draft.image !== undefined && !consent);
  let reading = $state(false);
  let pickError = $state('');

  /** Back to a painting: the picture leaves the meme (the kept bytes are pruned later). */
  function painting(where: Where) {
    const { image: _image, ...rest } = draft;
    onchange({ ...rest, where });
  }

  async function pick(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    pickError = '';
    reading = true;
    try {
      const p = await pickPicture(file);
      // The id and key are chosen now, on the phone; the picture is sealed and sent with the chain.
      const id = newId();
      await remember(id, p.bytes, p.type);
      consent = false;
      const { template: _template, ...rest } = draft;
      onchange({ ...rest, who: 'none', image: { id, key: secretToText(newSecret()), type: p.type, w: p.w, h: p.h } });
    } catch (error) {
      pickError = error instanceof PictureError && error.reason === 'too-big' ? t.pictureErrors.tooBig : t.pictureErrors.notPicture;
    } finally {
      reading = false;
    }
  }
</script>

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label={domi.common.back} onclick={onback}><Icon name="back" /></button>
    <h1 tabindex="-1">{t.title}</h1>
    <span class="step">{domi.common.step(1)}</span>
  </div>

  <div class="preview"><Meme meme={draft} size={250} /></div>

  <section aria-labelledby="who">
    <h2 id="who" class="label">{t.who}</h2>
    <div class="pick" role="radiogroup" aria-labelledby="who">
      {#each faces as f (f.who)}
        <button type="button" role="radio" aria-checked={draft.who === f.who} aria-label={f.name} class="face" class:bird={f.who === 'gull'} onclick={() => set({ who: f.who })}>
          {#if f.who === 'gull'}<SeagullSprite />{:else}{@html f.svg}{/if}
        </button>
      {/each}
      <button type="button" role="radio" aria-checked={draft.who === 'none'} class="face nobody" onclick={() => set({ who: 'none' })}>{domi.cast.none}</button>
    </div>
  </section>

  <section aria-labelledby="where">
    <h2 id="where" class="label">{t.where}</h2>
    <div class="pick" role="radiogroup" aria-labelledby="where">
      {#each WHERE as w (w)}
        <button type="button" role="radio" aria-checked={!draft.image && draft.where === w} class="place" onclick={() => painting(w)}>
          <img src={PAINTINGS[w]} alt="" /><span>{PLACE_NAMES[w]}</span>
        </button>
      {/each}
    </div>
    <!-- A8: their own photo or GIF, instead of a painting. Never public; sealed before it leaves. -->
    <div class="own" class:on={draft.image !== undefined}>
      <label class="picker">
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={reading} onchange={(e) => pick(e.currentTarget)} />
        {#if draft.image && pictureUrl(draft.image.id)}<img src={pictureUrl(draft.image.id)} alt="" />{/if}
        <span><strong>{reading ? t.readingPicture : t.picture}</strong><span class="hint">{t.pictureNote}</span></span>
      </label>
      {#if pickError}<p class="warn" role="alert">{pickError}</p>{/if}
      {#if draft.image}
        <label class="consent"><input type="checkbox" bind:checked={consent} /><span>{t.consent}</span></label>
        <button type="button" class="chip" onclick={() => painting(draft.where)}>{t.removePicture}</button>
      {/if}
    </div>
  </section>

  <section aria-label={t.captions} class="caps">
    <label class="field"><span class="what">{t.top}</span>
      <input value={draft.top} maxlength={CAPTION_MAX} placeholder={t.topPlaceholder} autocomplete="off" oninput={(e) => set({ top: e.currentTarget.value })} onblur={() => set({ top: tidy(draft.top) })} /></label>
    <label class="field"><span class="what">{t.bottom}</span>
      <input value={draft.bottom} maxlength={CAPTION_MAX} placeholder={t.bottomPlaceholder} autocomplete="off" oninput={(e) => set({ bottom: e.currentTarget.value })} onblur={() => set({ bottom: tidy(draft.bottom) })} /></label>
  </section>

  <section aria-labelledby="touch">
    <h2 id="touch" class="label">{t.touch}</h2>
    <div class="touches">
      <button type="button" class="chip" aria-pressed={draft.bubble === 'moin'} onclick={() => set({ bubble: draft.bubble === 'moin' ? 'none' : 'moin' })}>{t.moin}</button>
      <button type="button" class="chip" aria-pressed={draft.bubble === 'moinmoin'} onclick={() => set({ bubble: draft.bubble === 'moinmoin' ? 'none' : 'moinmoin' })}>{t.moinmoin}</button>
      <button type="button" class="chip" aria-pressed={draft.gull} onclick={() => set({ gull: !draft.gull })}>{t.gull}</button>
      {#if draft.who !== 'none'}<button type="button" class="chip" aria-pressed={draft.mood === 'smiling'} onclick={() => set({ mood: draft.mood === 'smiling' ? 'grumpy' : 'smiling' })}>{t.smile}</button>{/if}
    </div>
    <div class="touches weather" role="radiogroup" aria-label={t.weather}>
      {#each WEATHER as w (w)}
        <button type="button" class="chip" role="radio" aria-checked={draft.weather === w} onclick={() => set({ weather: w })}>{w === 'clear' ? t.clear : WEATHER_NAMES[w]}</button>
      {/each}
    </div>
  </section>

  <div class="foot">
    <button type="button" class="primary" disabled={!ready || needsConsent || reading} onclick={() => { set({ top: tidy(draft.top), bottom: tidy(draft.bottom) }); onnext(); }}>
      {!ready ? t.noCaption : needsConsent ? t.needConsent : postcard ? t.nextPostcard : t.nextChain}
    </button>
  </div>
</main>

<style>
  .preview { display: flex; justify-content: center; padding-top: 8px; }
  section { padding-top: 12px; }
  section .label { margin: 0 4px 6px; }
  .pick { display: flex; gap: 8px; }
  [aria-labelledby='who'].pick { display: grid; grid-template-columns: repeat(3, 1fr); }
  .face.nobody { font-size: 13px; font-weight: 800; color: var(--lilac); }
  .own { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .picker { position: relative; display: flex; align-items: center; gap: 12px; min-height: 64px; padding: 8px 14px; border-radius: 16px; background: var(--raised); box-shadow: inset 0 0 0 1px var(--line); cursor: pointer; }
  .picker:focus-within, .own.on .picker { box-shadow: 0 0 0 3px var(--paper); }
  .picker input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
  .picker img { width: 48px; height: 48px; flex: none; border-radius: 10px; object-fit: cover; }
  .picker > span { display: flex; flex-direction: column; gap: 2px; font-size: 15px; }
  .picker .hint { font-size: 12px; line-height: 1.35; color: var(--mist); }
  .consent { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 4px; font-weight: 700; }
  .consent input { width: 22px; height: 22px; accent-color: var(--paper); }
  .warn { margin: 0 4px; font-size: 13px; line-height: 1.4; color: var(--lilac); }
  .face.bird { display: grid; place-items: center; }
  .face.bird :global(svg) { width: 86%; height: 86%; transform: none; }
  .touches.weather { margin-top: 6px; }
  .face, .place { flex: 1; min-width: 0; height: 56px; padding: 0; border: 0; border-radius: 14px; overflow: hidden; background: var(--raised); box-shadow: inset 0 0 0 1px var(--line); }
  .face :global(svg) { width: 100%; height: 100%; object-fit: cover; transform: scale(1.5) translateY(14%); }
  .place { position: relative; height: 52px; display: flex; align-items: flex-end; justify-content: center; }
  .place img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .place span { position: relative; padding-bottom: 5px; font-size: 12px; font-weight: 800; text-shadow: 0 1px 4px #000; }
  .face[aria-checked='true'], .place[aria-checked='true'] { box-shadow: 0 0 0 3px var(--paper); }
  .caps { display: flex; flex-direction: column; gap: 8px; }
  .what { width: 56px; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--lilac); }
  .touches { display: flex; gap: 6px; }
  .touches .chip { flex: 1; padding: 0 6px; }
</style>
