<script lang="ts">
  import { copy, Stars } from '@moin/ui';

  interface Props {
    stars: 1 | 2 | 3;
    taps: number;
    par: number;
    last: boolean;
    nextLabel: string;
    onnext: () => void;
    onreplay: () => void;
    /** Daily level: copy the emoji result. Resolves to null when copied, or the text to copy by hand. */
    share?: (() => Promise<string | null>) | null;
  }
  let { stars, taps, par, last, nextLabel, onnext, onreplay, share = null }: Props = $props();
  let shared = $state<'idle' | 'copied' | 'manual'>('idle');
  let manualText = $state('');

  async function copyResult() {
    if (!share) return;
    const left = await share();
    if (left === null) shared = 'copied';
    else { manualText = left; shared = 'manual'; }
  }

  function focus(node: HTMLElement) {
    node.focus({ preventScroll: true });
    node.closest('section')?.scrollIntoView({ block: 'nearest' });
  }
</script>

<section class="win" aria-labelledby="win-title">
  <h2 id="win-title">{copy.solvedTitle}</h2>
  <Stars count={stars} />
  <p>{copy.solvedBody(taps, par)}</p>
  {#if last}<p class="done">{copy.allDone}</p>{/if}
  {#if share}
    <div class="share">
      <button type="button" class="secondary" onclick={copyResult}>{copy.copyResult}</button>
      {#if shared === 'copied'}<p role="status">{copy.copied}</p>{/if}
      {#if shared === 'manual'}
        <p role="status">{copy.copyFailed}</p>
        <textarea readonly rows="8" aria-label={copy.copyResult}>{manualText}</textarea>
      {/if}
    </div>
  {/if}
  <div class="actions">
    <button type="button" class="secondary" onclick={onreplay}>{copy.replay}</button>
    <button type="button" class="primary" onclick={onnext} use:focus>{nextLabel}</button>
  </div>
</section>

<style>
  .win {
    margin: 0 auto;
    width: min(calc(100vw - 32px), 26rem);
    background: var(--white); border: var(--outline) solid var(--ink); border-radius: 20px;
    box-shadow: 0 6px 0 var(--ink);
    padding: 1rem 1rem 1.1rem; text-align: center;
    animation: rise 0.35s ease-out;
  }
  @keyframes rise { from { transform: translateY(30px); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .win { animation: none; } }
  h2 { margin: 0 0 0.4rem; font-size: 1.35rem; }
  p { margin: 0.5rem 0 0; }
  .done { font-style: italic; color: var(--deep); }
  .share { margin-top: 0.8rem; }
  .share p { font-size: 0.9rem; color: var(--deep); }
  textarea { width: 100%; margin-top: 0.4rem; font: inherit; font-size: 0.9rem; border: 2px solid var(--stone); border-radius: 8px; padding: 0.4rem; }
  .actions { display: flex; gap: 0.6rem; justify-content: center; margin-top: 0.9rem; }
  button {
    min-height: 48px; padding: 0 1.1rem; border-radius: 14px; font: inherit; font-weight: 800; cursor: pointer;
    border: var(--outline) solid var(--ink); box-shadow: 0 3px 0 var(--ink);
  }
  button:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--ink); }
  button:focus-visible { outline: 3px solid var(--royal); outline-offset: 3px; }
  .primary { background: var(--royal); color: var(--white); }
  .secondary { background: var(--white); color: var(--ink); }
</style>
