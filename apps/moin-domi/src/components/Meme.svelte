<script lang="ts">
  import type { Meme } from '@moin/meme';
  import SeagullSprite from '@moin/ui/SeagullSprite.svelte';
  import { portrait } from '@moin/ui/portrait';
  import { bubbleText, describe, PAINTINGS, portraitOf } from '../lib/look.js';

  interface Props {
    meme: Meme;
    size?: number;
    /** Inside a button or link that already names it. */
    decorative?: boolean;
    element?: HTMLElement | undefined;
  }
  let { meme, size = 300, decorative = false, element = $bindable() }: Props = $props();
  const uid = $props.id();
  const face = $derived(portrait({ ...portraitOf(meme.who, meme.mood), id: `face-${uid}` }));
  const words = $derived(size >= 90);
  const fs = $derived(Math.round(size * 0.088));
</script>

<div
  class="meme"
  bind:this={element}
  role={decorative ? undefined : 'img'}
  aria-label={decorative ? undefined : describe(meme)}
  aria-hidden={decorative ? 'true' : undefined}
  style:--size={`${size}px`}
  style:--fs={`${fs}px`}
  style:--stroke={`${Math.max(2, Math.round(fs * 0.16))}px`}
>
  <img class="bg" src={PAINTINGS[meme.where]} alt="" draggable="false" />
  <div class="face">{@html face}</div>
  {#if meme.gull}<div class="gull"><SeagullSprite /></div>{/if}
  <!-- Below 90 px the words would be ~4 px: the red bubble stays, its words go (a11y review). -->
  {#if meme.bubble !== 'none'}<span class="bubble" class:mute={!words}>{words ? bubbleText(meme.bubble) : ''}</span>{/if}
  {#if words}
    <p class="cap top">{meme.top}</p>
    <p class="cap bottom">{meme.bottom}</p>
  {/if}
</div>

<style>
  .meme {
    position: relative; flex: none; width: var(--size); height: var(--size); overflow: hidden;
    border-radius: calc(var(--size) * 0.06); background: #000; box-shadow: 0 0 0 1px rgba(246, 239, 223, 0.18);
    user-select: none;
  }
  .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 22%; }
  .face { position: absolute; left: 50%; bottom: -2%; width: 64%; transform: translateX(-50%); filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.55)); }
  .face :global(svg) { display: block; width: 100%; height: auto; }
  .gull { position: absolute; right: 1%; bottom: 3%; width: 32%; transform: scaleX(-1); }
  .gull :global(svg) { display: block; width: 100%; height: auto; }
  .bubble {
    position: absolute; right: 9%; top: 30%; padding: calc(var(--size) * 0.012) calc(var(--size) * 0.035) calc(var(--size) * 0.018);
    border-radius: calc(var(--size) * 0.05) calc(var(--size) * 0.05) calc(var(--size) * 0.05) calc(var(--size) * 0.012);
    background: var(--moin); color: #fbf6ea; font-family: var(--serif); font-style: italic; font-weight: 700;
    font-size: calc(var(--size) * 0.075); line-height: 1;
  }
  .bubble.mute { width: calc(var(--size) * 0.2); height: calc(var(--size) * 0.12); padding: 0; }
  .cap {
    position: absolute; left: 4%; right: 4%; margin: 0; text-align: center; font-family: var(--sans); font-weight: 800;
    font-size: var(--fs); line-height: 1.02; text-transform: uppercase; letter-spacing: 0.01em; color: #fff;
    -webkit-text-stroke: var(--stroke) #000; paint-order: stroke fill; overflow-wrap: anywhere;
  }
  .top { top: calc(var(--size) * 0.035); }
  .bottom { bottom: calc(var(--size) * 0.035); }
</style>
