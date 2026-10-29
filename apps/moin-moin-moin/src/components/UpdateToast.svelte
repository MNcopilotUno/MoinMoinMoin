<script lang="ts">
  import { copy } from '@moin/ui';
  import Icons from './Icons.svelte';

  interface Props { apply: () => void; dismiss: () => void }
  let { apply, dismiss }: Props = $props();
</script>

<!-- A fresh harbour is ready (settings.md): reload now, or ✕ for later. Progress is never touched. -->
<section class="toast" role="status" aria-labelledby="update-title">
  <div class="top">
    <svg class="tower" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 21V9l2-5 2 5v12" /><path d="M10 13h4M10 17h4" /><path d="M6 21h12" /><path d="M5 6l3 1M19 6l-3 1" />
    </svg>
    <div class="text">
      <h2 id="update-title">{copy.updateReady}</h2>
      <p>{copy.updateBody}</p>
    </div>
    <button type="button" class="later" onclick={dismiss} aria-label={copy.later}><Icons name="close" /></button>
  </div>
  <button type="button" class="reload" onclick={apply}>{copy.reload}</button>
</section>

<style>
  .toast {
    position: fixed; z-index: 20; left: 0; right: 0; margin-inline: auto; bottom: max(12px, env(safe-area-inset-bottom));
    width: min(calc(100vw - 24px), 28rem); box-sizing: border-box;
    display: flex; flex-direction: column; gap: 12px; padding: 14px 14px 14px 16px; border-radius: 22px;
    background: var(--ink); color: var(--paper); box-shadow: 0 14px 34px var(--shadow);
  }
  .top { display: flex; align-items: flex-start; gap: 12px; }
  .tower { width: 28px; height: 28px; flex: none; margin-top: 2px; color: var(--star, #f0c46a); }
  .text { flex: 1; }
  h2 { margin: 0; font-family: var(--serif); font-weight: 700; font-size: 1.4rem; line-height: 1.1; }
  p { margin: 4px 0 0; font-size: 0.88rem; line-height: 1.4; opacity: 0.88; }
  button { font: inherit; cursor: pointer; }
  .later {
    width: 44px; height: 44px; flex: none; margin: -6px -6px 0 0; border: 0; border-radius: 50%;
    background: transparent; color: var(--paper); display: grid; place-items: center; padding: 0;
  }
  .later :global(svg) { width: 16px; height: 16px; }
  .reload { min-height: 46px; border: 0; border-radius: 999px; background: var(--paper); color: var(--ink); font-weight: 800; }
  button:focus-visible { outline: 3px solid var(--paper); outline-offset: 2px; }
</style>
