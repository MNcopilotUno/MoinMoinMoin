<script lang="ts">
  import keyart from '@moin/assets/art/harbour-night-wide.jpg';
  import { memeTitle } from '@moin/meme';
  import { onMount } from 'svelte';
  import Icon from '../components/Icon.svelte';
  import Meme from '../components/Meme.svelte';
  import { marked, touchNote } from '../lib/diff.js';
  import { pathTo, type Node } from '../lib/flow.js';
  import { saveImage } from '../lib/save.js';
  import { localVoice, onVoices, say } from '../lib/speech.js';

  interface Props { nodes: readonly Node[]; finalId: string; maxStops: number; onback: () => void; onnew: () => void }
  let { nodes, finalId, maxStops, onback, onnew }: Props = $props();
  const path = $derived(pathTo(nodes, finalId));
  const first = $derived(path[0]?.meme ?? null);
  const last = $derived(path[path.length - 1]?.meme ?? null);
  let voice = $state(false);
  let lastEl = $state<HTMLElement | undefined>();
  let firstEl = $state<HTMLElement | undefined>();
  onMount(() => {
    voice = localVoice() !== null;
    return onVoices(() => (voice = localVoice() !== null));
  });
  async function saveBoth() {
    if (first && firstEl) await saveImage(firstEl, first);
    if (last && lastEl) await saveImage(lastEl, last);
  }
</script>

<main class="screen finale">
  <img class="sky" src={keyart} alt="" />
  <div class="bar"><button type="button" class="round dim" aria-label="Back to the tree" onclick={onback}><Icon name="back" /></button></div>

  <section class="say">
    <p class="label gold">Stop {maxStops} of {maxStops} · the last stop</p>
    <h1 tabindex="-1">Look how far it drifted</h1>
  </section>

  <div class="pair">
    {#if first}<figure><Meme meme={first} size={166} bind:element={firstEl} /><figcaption>The first</figcaption></figure>{/if}
    {#if last}<figure><Meme meme={last} size={166} bind:element={lastEl} /><figcaption class="gold">The last</figcaption></figure>{/if}
  </div>

  <ol class="panel drift" aria-label="How the words changed">
    {#each path as n, i (n.hopId)}
      <li>
        <span class="n">{n.depth}</span>
        {#if n.meme}
          <span>{#each marked(i ? (path[i - 1]?.meme ?? null) : null, n.meme) as p, j (j)}{j ? ' ' : ''}{#if p.changed}<strong>{p.text}</strong>{:else}{p.text}{/if}{/each}{#if i && touchNote(path[i - 1]?.meme ?? null, n.meme)}<em>{` · ${touchNote(path[i - 1]?.meme ?? null, n.meme)}`}</em>{/if}</span>
        {:else}<span class="lost">unreadable</span>{/if}
      </li>
    {/each}
  </ol>

  <div class="foot">
    <button type="button" class="outline" disabled={!voice || !last} onclick={() => last && say(memeTitle(last))}><Icon name="speaker" size={20} /> Say it out loud</button>
    <div class="row">
      <button type="button" class="outline quiet" onclick={saveBoth}>Save both</button>
      <button type="button" class="primary" onclick={onnew}>Start a new chain</button>
    </div>
    <p class="note c">{voice ? 'The voice is your phone’s own; nothing is sent to read it.' : 'This phone has no voice of its own, and we won’t use one from the internet.'}</p>
  </div>
</main>

<style>
  .finale { padding-top: 0; }
  .sky { position: absolute; left: 0; top: 0; width: 100%; height: 300px; object-fit: cover; object-position: 70% 40%; opacity: 0.5; -webkit-mask-image: linear-gradient(#000 40%, transparent); mask-image: linear-gradient(#000 40%, transparent); pointer-events: none; animation: none; }
  .bar, .say, .pair, .drift, .foot { position: relative; }
  .say { padding-top: 12px; text-align: center; }
  h1 { margin-top: 6px; font-family: var(--serif); font-weight: 700; font-size: 40px; line-height: 0.98; }
  .gold { color: var(--gold); }
  .pair { margin-top: 22px; display: flex; gap: 10px; justify-content: center; }
  figure { margin: 0; text-align: center; }
  figcaption { margin-top: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--mist); }
  figcaption.gold { color: var(--gold); }
  .drift { margin: 18px 0 0; padding: 12px 14px; list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 14px; line-height: 1.3; }
  .drift li { display: flex; gap: 10px; }
  .n { width: 18px; flex: none; font-weight: 800; color: var(--quiet); text-align: right; }
  .drift span { color: #d9d3e9; }
  .drift strong { color: var(--gold); }
  .drift em { font-style: normal; color: var(--mist); }
  .lost { color: var(--quiet); }
  .outline:disabled { box-shadow: inset 0 0 0 1.5px var(--line); color: var(--quiet); }
  .quiet { background: #0e0e12; box-shadow: inset 0 0 0 1px var(--line); font-size: 15px; }
  .c { text-align: center; }
</style>
