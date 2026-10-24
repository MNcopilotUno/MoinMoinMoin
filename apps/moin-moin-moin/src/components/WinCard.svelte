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
    background: rgba(251, 246, 234, 0.94); border: 0; border-radius: 24px;
    -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
    box-shadow: 0 14px 34px rgba(30, 43, 76, 0.28);
    padding: 1rem 1rem 1.1rem; text-align: center;
    animation: rise 0.35s ease-out;
  }
  @keyframes rise { from { transform: translateY(30px); opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .win { animation: none; } }
  h2 { margin: 0 0 0.5rem; font-family: var(--serif); font-weight: 700; font-size: 2rem; line-height: 1.05; color: var(--ink); }
  p { margin: 0.5rem 0 0; }
  .done { font-family: var(--serif); font-style: italic; font-size: 1.2rem; color: var(--ink-soft); }
  .share { margin-top: 0.8rem; }
  .share p { font-size: 0.9rem; color: var(--ink-soft); }
  textarea { width: 100%; margin-top: 0.4rem; font: inherit; font-size: 0.9rem; border: 2px solid var(--stone); border-radius: 8px; padding: 0.4rem; }
  .actions { display: flex; gap: 0.6rem; justify-content: center; margin-top: 0.9rem; }
  button {
    min-height: 48px; padding: 0 1.3rem; border-radius: 999px; font: inherit; font-weight: 800; cursor: pointer;
    border: 1.5px solid var(--ink); box-shadow: 0 4px 12px rgba(30, 43, 76, 0.18);
  }
  button:active { transform: scale(0.97); }
  button:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }
  .primary { background: var(--ink); color: var(--paper); }
  .secondary { background: var(--paper); color: var(--ink); }
</style>
