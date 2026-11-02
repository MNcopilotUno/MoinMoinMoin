<script lang="ts">
  import harbour from '@moin/assets/art/harbour-night.jpg';
  import Icon from '../components/Icon.svelte';
  import Report from '../components/Report.svelte';
  import Meme from '../components/Meme.svelte';
  import { dayLabel } from '../lib/config.js';
  import type { Item } from '../lib/db.js';
  import { marked, touchNote } from '../lib/diff.js';
  import type { Node } from '../lib/flow.js';
  import { layout } from '../lib/layout.js';
  import { domi } from '@moin/ui/copy/domi';

  interface Props { item: Item; nodes: readonly Node[]; maxStops: number; expiresDay: number; stale?: number | undefined; onback: () => void; onlink: () => void; onfinale: (hopId: string) => void }
  let { item, nodes, maxStops, expiresDay, stale, onback, onlink, onfinale }: Props = $props();

  const t = domi.tree;
  const TILE = 56, COL = 72, ROW = 96, PAD = 44;
  const grid = $derived(layout(nodes));
  const width = $derived(Math.max(358, PAD * 2 + (grid.width - 1) * COL + TILE));
  const height = $derived(PAD + (maxStops - 1) * ROW + TILE + 28);
  const pos = (n: Node) => ({ left: PAD + (grid.x.get(n.hopId) ?? 0) * COL + (width - (PAD * 2 + (grid.width - 1) * COL + TILE)) / 2, top: 16 + (n.depth - 1) * ROW });
  const by = $derived(new Map(nodes.map((n) => [n.hopId, n])));
  const order = $derived(new Map([...nodes].sort((a, b) => a.seq - b.seq).map((n, i) => [n.hopId, i])));
  let selected = $state('');
  $effect(() => { if (!selected || !by.has(selected)) selected = by.has(item.hopId) ? item.hopId : (nodes[0]?.hopId ?? ''); });
  const sel = $derived(by.get(selected));
  const parent = $derived(sel?.parentId ? by.get(sel.parentId) : undefined);
  const finals = $derived(nodes.filter((n) => n.depth >= maxStops));
  let wave = $state(0);
  const STEP = 260;
  const lines = $derived(nodes.filter((n) => n.parentId && by.has(n.parentId)).map((n) => {
    const p = pos(by.get(n.parentId!)!), c = pos(n);
    const x0 = p.left + TILE / 2, y0 = p.top + TILE, x1 = c.left + TILE / 2, y1 = c.top, my = (y0 + y1) / 2;
    return { id: n.hopId, d: `M${x0} ${y0} C${x0} ${my} ${x1} ${my} ${x1} ${y1}`, delay: (order.get(n.hopId) ?? 0) * STEP - 150 };
  }));
  const label = $derived(t.label(nodes.length, Math.max(...nodes.map((n) => n.depth), 1), maxStops));
</script>

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label={domi.common.back} onclick={onback}><Icon name="back" /></button>
    <div class="head">
      <h1 tabindex="-1">{t.title}</h1>
      <p>{t.intro(item.mine, dayLabel(expiresDay))}</p>
      {#if stale}<p class="stale" role="status">{t.stale(new Date(stale).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }))}</p>{/if}
    </div>
  </div>

  <div class="frame">
    <img class="bg" src={harbour} alt="" />
    <div class="scroll">
      {#key wave}
        <div class="canvas" role="group" aria-label={label} style:width={`${width}px`} style:height={`${height}px`}>
          {#each Array.from({ length: maxStops }, (_, i) => i + 1) as s (s)}
            <span class="stop" style:top={`${16 + (s - 1) * ROW + TILE / 2 - 8}px`}>{s}</span>
          {/each}
          <svg width={width} height={height} aria-hidden="true">
            {#each lines as l (l.id)}<path class="line" d={l.d} style:animation-delay={`${l.delay}ms`} />{/each}
          </svg>
          {#each nodes as n (n.hopId)}
            {@const p = pos(n)}
            <button type="button" class="node" class:mine={n.hopId === item.hopId} aria-pressed={selected === n.hopId}
              aria-label={t.node(n.depth, n.hopId === item.hopId, n.meme)}
              style:left={`${p.left}px`} style:top={`${p.top}px`} style:animation-delay={`${(order.get(n.hopId) ?? 0) * STEP}ms`}
              onclick={() => (selected = n.hopId)}>
              {#if n.meme}<Meme meme={n.meme} size={TILE} decorative />{:else}<span class="lost">{t.unreadableTile}</span>{/if}
              {#if n.hopId === item.hopId}<span class="you">{t.you}</span>{/if}
            </button>
          {/each}
        </div>
      {/key}
    </div>
  </div>

  {#if sel}
    <section class="panel detail" aria-live="polite">
      {#if sel.meme}
        <Meme meme={sel.meme} size={96} />
        <div class="txt">
          <p class="label gold">{t.detail(sel.depth, sel.hopId === item.hopId, sel.meme.nick)}</p>
          <p class="cap">“{#each marked(parent?.meme ?? null, sel.meme) as piece, i (i)}{i ? ' ' : ''}{#if piece.changed}<strong>{piece.text}</strong>{:else}{piece.text}{/if}{/each}”</p>
          <p class="sub">{sel.depth === 1 ? t.started : touchNote(parent?.meme ?? null, sel.meme) || (marked(parent?.meme ?? null, sel.meme).some((p) => p.changed) ? '' : t.unchanged)}</p>
        </div>
      {:else}
        <p class="sub">{t.unreadable}</p>
      {/if}
    </section>
  {/if}

  <div class="foot">
    <div class="row">
      <button type="button" class="outline" onclick={() => (wave += 1)}><Icon name="wave" size={20} /> {t.replay}</button>
      {#if finals.length}<button type="button" class="primary" onclick={() => onfinale(finals.find((f) => f.hopId === selected)?.hopId ?? finals[0]!.hopId)}>{t.finale}</button>{/if}
    </div>
    <Report {item} />
    {#if item.mine && item.status === 'travelling' && item.depth < maxStops}<button type="button" class="ghost" onclick={onlink}>{t.yourLink}</button>{/if}
    {#if !finals.length}<p class="note c">{t.finaleLater(maxStops)}</p>{/if}
  </div>
</main>

<style>
  .head { flex: 1; }
  .head h1 { font-family: var(--serif); font-weight: 700; font-size: 28px; line-height: 1; }
  .head p { margin-top: 2px; font-size: 12.5px; color: var(--mist); }
  .frame { position: relative; margin: 10px -16px 0; min-height: 300px; max-height: 52dvh; overflow: hidden; }
  .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.22; }
  .scroll { position: relative; max-height: 52dvh; overflow: auto; overscroll-behavior: contain; }
  .canvas { position: relative; margin: 0 auto; }
  svg { position: absolute; inset: 0; }
  .stop { position: absolute; left: 10px; font-size: 11px; font-weight: 800; color: var(--quiet); }
  .line { fill: none; stroke: var(--mist); stroke-width: 1.5; stroke-linecap: round; stroke-dasharray: 140; animation: draw 500ms ease-out both; }
  .node { position: absolute; width: 56px; height: 56px; padding: 0; border: 0; border-radius: 12px; background: transparent; animation: arrive 600ms cubic-bezier(0.2, 0.8, 0.3, 1.2) both; }
  .node[aria-pressed='true'] { box-shadow: 0 0 0 3px var(--paper); }
  .node.mine { box-shadow: 0 0 0 2px var(--gold); }
  .node.mine[aria-pressed='true'] { box-shadow: 0 0 0 3px var(--gold); }
  .lost { display: grid; place-items: center; width: 56px; height: 56px; border-radius: 12px; background: var(--card); color: var(--quiet); font-weight: 800; box-shadow: inset 0 0 0 1px var(--hair); }
  .you { position: absolute; left: 50%; bottom: -20px; transform: translateX(-50%); padding: 1px 7px; border-radius: 999px; background: var(--gold); color: var(--black); font-size: 11px; font-weight: 800; }
  @keyframes arrive { 0% { opacity: 0; transform: scale(0.6); } 60% { opacity: 1; transform: scale(1.06); } 100% { opacity: 1; transform: scale(1); } }
  @keyframes draw { from { stroke-dashoffset: 140; } to { stroke-dashoffset: 0; } }
  :global(:root[data-calm]) .node, :global(:root[data-calm]) .line { animation: none; }
  .detail { margin-top: 10px; padding: 12px; display: flex; gap: 12px; align-items: center; }
  .txt { flex: 1; min-width: 0; }
  .gold { color: var(--gold); }
  .cap { margin-top: 4px; font-size: 15px; font-weight: 700; line-height: 1.3; }
  .cap strong { color: var(--gold); }
  .sub { margin-top: 4px; font-size: 12.5px; line-height: 1.35; color: var(--mist); }
  .row .outline { font-size: 16px; padding: 0 12px; white-space: nowrap; flex: 1.25; }
  .c { text-align: center; }
  .stale { margin-top: 4px; color: var(--gold) !important; }
</style>
