<script lang="ts">
  import { CAPTION_MAX, tidy, WHERE, type Meme as MemeValue } from '@moin/meme';
  import { portrait } from '@moin/ui/portrait';
  import Icon from '../components/Icon.svelte';
  import Meme from '../components/Meme.svelte';
  import { CAST, PAINTINGS, PLACE_NAMES, portraitOf } from '../lib/look.js';

  interface Props { draft: MemeValue; onchange: (m: MemeValue) => void; onback: () => void; onnext: () => void; postcard: boolean }
  let { draft, onchange, onback, onnext, postcard }: Props = $props();
  const set = (patch: Partial<MemeValue>) => onchange({ ...draft, ...patch });
  const faces = CAST.map((c) => ({ ...c, svg: portrait({ ...portraitOf(c.who, 'smiling'), id: `pick-${c.who}` }) }));
  const ready = $derived(tidy(draft.top) !== '' || tidy(draft.bottom) !== '');
</script>

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label="Back" onclick={onback}><Icon name="back" /></button>
    <h1 tabindex="-1">Make the meme</h1>
    <span class="step">1 of 3</span>
  </div>

  <div class="preview"><Meme meme={draft} size={250} /></div>

  <section aria-labelledby="who">
    <h2 id="who" class="label">Who</h2>
    <div class="pick" role="radiogroup" aria-labelledby="who">
      {#each faces as f (f.who)}
        <button type="button" role="radio" aria-checked={draft.who === f.who} aria-label={f.name} class="face" onclick={() => set({ who: f.who })}>{@html f.svg}</button>
      {/each}
    </div>
  </section>

  <section aria-labelledby="where">
    <h2 id="where" class="label">Where</h2>
    <div class="pick" role="radiogroup" aria-labelledby="where">
      {#each WHERE as w (w)}
        <button type="button" role="radio" aria-checked={draft.where === w} class="place" onclick={() => set({ where: w })}>
          <img src={PAINTINGS[w]} alt="" /><span>{PLACE_NAMES[w]}</span>
        </button>
      {/each}
    </div>
  </section>

  <section aria-label="Captions" class="caps">
    <label class="field"><span class="what">Top</span>
      <input value={draft.top} maxlength={CAPTION_MAX} placeholder="Top caption" autocomplete="off" oninput={(e) => set({ top: e.currentTarget.value })} onblur={() => set({ top: tidy(draft.top) })} /></label>
    <label class="field"><span class="what">Bottom</span>
      <input value={draft.bottom} maxlength={CAPTION_MAX} placeholder="Bottom caption" autocomplete="off" oninput={(e) => set({ bottom: e.currentTarget.value })} onblur={() => set({ bottom: tidy(draft.bottom) })} /></label>
  </section>

  <section aria-labelledby="touch">
    <h2 id="touch" class="label">A touch</h2>
    <div class="touches">
      <button type="button" class="chip" aria-pressed={draft.bubble === 'moin'} onclick={() => set({ bubble: draft.bubble === 'moin' ? 'none' : 'moin' })}>Moin</button>
      <button type="button" class="chip" aria-pressed={draft.bubble === 'moinmoin'} onclick={() => set({ bubble: draft.bubble === 'moinmoin' ? 'none' : 'moinmoin' })}>Moin moin</button>
      <button type="button" class="chip" aria-pressed={draft.gull} onclick={() => set({ gull: !draft.gull })}>A gull</button>
      <button type="button" class="chip" aria-pressed={draft.mood === 'smiling'} onclick={() => set({ mood: draft.mood === 'smiling' ? 'grumpy' : 'smiling' })}>Smile</button>
    </div>
  </section>

  <div class="foot">
    <button type="button" class="primary" disabled={!ready} onclick={() => { set({ top: tidy(draft.top), bottom: tidy(draft.bottom) }); onnext(); }}>
      {ready ? (postcard ? 'Next: who can open it' : 'Next: how it travels') : 'Write a caption first'}
    </button>
  </div>
</main>

<style>
  .preview { display: flex; justify-content: center; padding-top: 8px; }
  section { padding-top: 12px; }
  section .label { margin: 0 4px 6px; }
  .pick { display: flex; gap: 8px; }
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
