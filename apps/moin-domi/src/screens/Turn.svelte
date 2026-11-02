<script lang="ts">
  import { checkTurn, swapWord, tidy, WORD_MAX, words as wordsOf, type Meme as MemeValue } from '@moin/meme';
  import Icon from '../components/Icon.svelte';
  import Report from '../components/Report.svelte';
  import Meme from '../components/Meme.svelte';
  import { bubbleText, WEATHER_NAMES } from '../lib/look.js';
  import type { Item } from '../lib/db.js';
  import { domi } from '@moin/ui/copy/domi';

  interface Props { item: Item; nick: string; busy: boolean; error: string | null; blocked: string | null; offline: boolean; onback: () => void; onpass: (m: MemeValue) => void }
  let { item, nick, busy, error, blocked, offline, onback, onpass }: Props = $props();

  const c = domi.turn;
  const IDEAS = c.ideas;
  const received = $derived(item.meme);
  let swaps = $state<Record<number, string>>({});
  let touch = $state<'none' | 'bubble' | 'gull' | 'mood' | 'weather'>('none');
  const nextWeather = (w: MemeValue['weather']): MemeValue['weather'] => (w === 'clear' ? 'rain' : w === 'rain' ? 'fog' : w === 'fog' ? 'beam' : 'clear');
  let picked = $state(-1);
  let typing = $state('');
  let typed = $state(false);
  let sign = $state('');
  $effect(() => { sign = nick; });

  const base = $derived(wordsOf(received));
  const used = $derived(Object.keys(swaps).length);
  const nextBubble = (b: MemeValue['bubble']) => (b === 'none' ? 'moin' : b === 'moin' ? 'moinmoin' : 'none');
  const version = $derived.by(() => {
    let m: MemeValue = { ...received, nick: tidy(sign) };
    for (const [i, w] of Object.entries(swaps)) m = swapWord(m, Number(i), w);
    if (touch === 'bubble') m = { ...m, bubble: nextBubble(received.bubble) };
    if (touch === 'gull') m = { ...m, gull: !received.gull };
    if (touch === 'mood') m = { ...m, mood: received.mood === 'smiling' ? 'grumpy' : 'smiling' };
    if (touch === 'weather') m = { ...m, weather: nextWeather(received.weather) };
    return m;
  });
  const problem = $derived(checkTurn(received, version));
  const changed = $derived(used > 0 || touch !== 'none');
  const ideas = $derived(IDEAS.filter((w) => w.toLowerCase() !== (base[picked] ?? '').toLowerCase()).slice(0, 4));
  const touches = $derived([
    { id: 'none', label: c.touches.none },
    { id: 'bubble', label: received.bubble === 'none' ? c.touches.bubbleOn : received.bubble === 'moin' ? c.touches.bubbleMore : c.touches.bubbleOff },
    { id: 'gull', label: received.gull ? c.touches.gullOff : c.touches.gullOn },
    { id: 'mood', label: received.mood === 'smiling' ? c.touches.frown : c.touches.smile },
    { id: 'weather', label: WEATHER_NAMES[nextWeather(received.weather)] },
  ] as const);

  function tap(i: number) {
    if (swaps[i] !== undefined) {
      const next = { ...swaps };
      delete next[i];
      swaps = next;
      picked = -1;
    } else picked = picked === i ? -1 : i;
    typed = false;
    typing = '';
  }
  function use(word: string) {
    const w = tidy(word).replace(/ /g, '');
    if (!w || picked < 0 || w === base[picked]) return;
    swaps = { ...swaps, [picked]: w.slice(0, WORD_MAX) };
    picked = -1;
    typed = false;
    typing = '';
  }
</script>

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label={domi.common.back} onclick={onback}><Icon name="back" /></button>
    <div class="head">
      <h1 tabindex="-1">{c.title}</h1>
      <p>{c.intro}</p>
    </div>
  </div>

  <div class="stops" role="img" aria-label={c.youAre(item.depth + 1, item.maxStops)}>
    {#each Array.from({ length: item.maxStops }, (_, i) => i + 1) as n (n)}
      <span class:done={n <= item.depth} class:you={n === item.depth + 1}></span>
    {/each}
  </div>

  <div class="preview"><Meme meme={version} size={250} /></div>

  <section aria-labelledby="w">
    <div class="h">
      <h2 id="w" class="label">{c.tapWord}</h2>
      <span class="left" aria-live="polite">{c.left(received.budget - used, received.budget)}</span>
    </div>
    <div class="words">
      {#each base as w, i (i)}
        {@const swapped = swaps[i] !== undefined}
        {@const locked = !swapped && used >= received.budget}
        <button type="button" class="word" class:swapped aria-pressed={picked === i} disabled={locked}
          aria-label={swapped ? c.swapped(swaps[i] ?? '', w) : locked ? c.noSwaps(w) : w} onclick={() => tap(i)}>{swapped ? swaps[i] : w}</button>
      {/each}
    </div>
    {#if picked >= 0}
      <div class="panel alts">
        <p>{c.swapFor(base[picked] ?? '')}</p>
        <div class="row-wrap">
          {#each ideas as idea (idea)}<button type="button" class="alt" onclick={() => use(idea)}>{idea}</button>{/each}
          {#if !typed}<button type="button" class="chip" onclick={() => (typed = true)}>{c.typeOwn}</button>{/if}
        </div>
        {#if typed}
          <form class="field own" onsubmit={(e) => { e.preventDefault(); use(typing); }}>
            <!-- svelte-ignore a11y_autofocus -->
            <input bind:value={typing} maxlength={WORD_MAX} placeholder={c.oneWord} aria-label={c.newWordFor(base[picked] ?? '')} autocomplete="off" autofocus />
            <button type="submit" class="chip">{c.useIt}</button>
          </form>
        {/if}
      </div>
    {/if}
  </section>

  <section aria-labelledby="t">
    <h2 id="t" class="label">{c.oneTouch}</h2>
    <div class="touches" role="radiogroup" aria-labelledby="t">
      {#each touches as t (t.id)}
        <button type="button" class="chip" role="radio" aria-checked={touch === t.id} onclick={() => (touch = t.id)}>{t.label}</button>
      {/each}
    </div>
  </section>

  <label class="field sign"><span class="soft">{domi.common.signIt}</span><input bind:value={sign} maxlength={24} placeholder={c.nickPlaceholder} autocomplete="nickname" /></label>

  <div class="foot">
    <Report {item} />
    <p class="warn" role={error || blocked ? 'alert' : undefined}>{error ?? blocked ?? (offline ? c.offline : c.warn)}</p>
    <button type="button" class="primary" disabled={busy || problem !== null || blocked !== null} onclick={() => onpass(version)}>
      {busy ? c.passing : offline ? c.passLater : item.depth + 1 >= item.maxStops ? (changed ? c.lastChanged : c.lastUnchanged) : changed ? c.pass : c.passUnchanged}
    </button>
  </div>
  <p class="sr" aria-live="polite">{touch === 'bubble' ? c.bubbleSays(bubbleText(version.bubble)) : ''}</p>
</main>

<style>
  .head { flex: 1; }
  .head h1 { font-family: var(--serif); font-weight: 700; font-size: 28px; line-height: 1; }
  .head p { margin-top: 2px; font-size: 12.5px; color: var(--mist); }
  .stops { margin: 10px 4px 0; display: flex; gap: 5px; }
  .stops span { flex: 1; height: 6px; border-radius: 3px; background: #24242b; }
  .stops .done { background: var(--quiet); }
  .stops .you { background: var(--gold); }
  .preview { display: flex; justify-content: center; padding-top: 12px; }
  section { padding-top: 12px; }
  .h { display: flex; align-items: baseline; justify-content: space-between; margin: 0 4px 6px; }
  section > .label { margin: 0 4px 6px; }
  .left { font-size: 13px; font-weight: 800; color: var(--gold); }
  .words, .row-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
  .word { min-height: 44px; min-width: 44px; padding: 0 14px; border: 0; border-radius: 12px; font-size: 16px; font-weight: 800; background: #0e0e12; box-shadow: inset 0 0 0 1.5px var(--line); }
  .word[aria-pressed='true'] { background: var(--paper); color: var(--black); box-shadow: none; }
  .word.swapped { background: var(--gold); color: var(--black); box-shadow: none; }
  .word:disabled { background: var(--card); color: #5e5a72; box-shadow: inset 0 0 0 1px #24242b; }
  .alts { margin-top: 8px; padding: 8px; box-shadow: inset 0 0 0 1px var(--line); }
  .alts p { margin: 2px 6px 6px; font-size: 12.5px; color: var(--mist); }
  .alt { min-height: 44px; padding: 0 14px; border: 0; border-radius: 999px; background: var(--paper); color: var(--black); font-size: 15px; font-weight: 800; }
  .own { margin-top: 8px; padding-right: 4px; }
  .touches { display: flex; flex-wrap: wrap; gap: 6px; }
  .touches .chip { flex: 1 1 28%; padding: 0 4px; font-size: 13.5px; }
  .sign { margin-top: 12px; }
  .sign .soft { font-size: 14px; font-weight: 700; }
  .warn { margin: 0 4px; font-size: 13px; line-height: 1.4; color: var(--lilac); text-align: center; }
</style>
