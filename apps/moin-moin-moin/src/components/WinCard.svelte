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
    /** Daily level: copy the emoji result. Resolves to null when copied, or the text to copy by hand;
     *  with `{ copy: false }` it only returns the text. */
    share?: ((options?: { copy: boolean }) => Promise<string | null>) | null;
    /** The narrator's line for this finish, quoted in the card. */
    quote?: string | null;
    /** False while a dialog is open: never steal its focus (QA M4). */
    autofocus?: boolean;
  }
  let { stars, taps, par, last, nextLabel, onnext, onreplay, share = null, quote = null, autofocus = true }: Props = $props();
  let shared = $state<'idle' | 'copied' | 'manual'>('idle');
  /** The phone's own share sheet, where the browser has one (settings.md): still text only. */
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function shareSheet() {
    if (!share) return;
    const text = await share({ copy: false });
    if (text === null) return;
    try {
      await navigator.share({ text });
    } catch {
      // cancelled or refused: nothing to do, Copy still works
    }
  }
  let manualText = $state('');

  async function copyResult() {
    if (!share) return;
    const left = await share();
    if (left === null) shared = 'copied';
    else { manualText = left; shared = 'manual'; }
  }

  function focus(node: HTMLElement) {
    // Never scroll or shift the page: the finished board stays in view (QA feel H1).
    if (autofocus) node.focus({ preventScroll: true });
  }
</script>

<section class="win" aria-labelledby="win-title">
  <!-- The canvas layout (canvas-parity.md): title and stars on one row, stats, the quote. -->
  <div class="head">
    <h2 id="win-title">{copy.solvedTitle}</h2>
    <Stars count={stars} size="1.6rem" />
  </div>
  <p class="stats">{copy.solvedBody(taps, par)}</p>
  {#if quote}<p class="quote">{quote}</p>{/if}
  {#if last}<p class="done">{copy.allDone}</p>{/if}
  {#if share}
    <div class="share">
      <div class="share-actions">
        <button type="button" class="secondary" onclick={copyResult}>{copy.copyResult}</button>
        {#if canShare}<button type="button" class="secondary" onclick={shareSheet}>{copy.share}</button>{/if}
      </div>
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
    position: fixed; z-index: 5; left: 50%; bottom: max(12px, env(safe-area-inset-bottom));
    transform: translateX(-50%);
    max-height: 52dvh; overflow-y: auto;
    width: min(calc(100vw - 24px), 26rem);
    background: var(--card-strong); border: 0; border-radius: 24px;
    -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
    box-shadow: 0 14px 34px var(--shadow);
    padding: 1.1rem 1.2rem 1.1rem; text-align: left;
    animation: rise 0.42s cubic-bezier(0.2, 0.9, 0.3, 1.15);
  }
  @keyframes rise { from { transform: translate(-50%, 110%); opacity: 0; } 38% { opacity: 1; } to { transform: translate(-50%, 0); } }
  /* Calm motion: the setting, or the phone's reduce-motion (settings.md). */
  :global(:root[data-calm]) .win { animation: none; }
  .head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.25rem 0.75rem; }
  .head :global(.stars) { flex: none; }
  h2 { margin: 0; font-family: var(--serif); font-weight: 700; font-size: clamp(1.5rem, 6.5vw, 2rem); line-height: 1.05; color: var(--ink); }
  p { margin: 0.5rem 0 0; }
  .stats { font-weight: 700; color: var(--ink-soft); }
  .quote {
    margin: 0.7rem 0 0; padding: 0.65rem 0.9rem; border-radius: 16px;
    background: color-mix(in srgb, var(--ink) 7%, var(--paper));
    font-family: var(--serif); font-style: italic; font-weight: 600; font-size: 1.15rem; line-height: 1.25; color: var(--ink);
  }
  .done { font-family: var(--serif); font-style: italic; font-size: 1.2rem; color: var(--ink-soft); }
  .share { margin-top: 0.8rem; }
  .share-actions { display: flex; gap: 0.6rem; justify-content: center; }
  .share p { font-size: 0.9rem; color: var(--ink-soft); }
  textarea { width: 100%; margin-top: 0.4rem; font: inherit; font-size: 0.9rem; border: 2px solid var(--stone); border-radius: 8px; padding: 0.4rem; }
  .actions { display: flex; gap: 0.6rem; margin-top: 0.9rem; }
  .actions button { flex: 1; }
  .actions .primary { flex: 1.4; }
  button {
    min-height: 48px; padding: 0 1rem; border-radius: 999px; white-space: nowrap; font: inherit; font-weight: 800; cursor: pointer;
    border: 1.5px solid var(--ink); box-shadow: 0 4px 12px var(--shadow);
  }
  button:active { transform: scale(0.97); }
  button:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }
  .primary { background: var(--ink); color: var(--paper); }
  .secondary { background: var(--paper); color: var(--ink); }
  /* Landscape phones (screens.md): the card sits in the left column, beside the solved board. */
  @media (orientation: landscape) and (max-height: 560px) {
    .win {
      left: max(10px, env(safe-area-inset-left)); transform: none; width: min(calc(40vw - 20px), 24rem);
      max-height: calc(100dvh - 20px); bottom: max(10px, env(safe-area-inset-bottom));
      animation-name: rise-side;
    }
    @keyframes rise-side { from { transform: translateY(110%); opacity: 0; } 38% { opacity: 1; } to { transform: none; } }
  }
  /* Short phones: a compact sheet, so the smiling board stays the picture (QA feel H1). */
  @media (max-height: 740px) {
    .win { padding: 0.7rem 0.9rem 0.8rem; }
    h2 { font-size: min(1.55rem, 6.5vw); }
    .quote { font-size: 1rem; margin-bottom: 0.2rem; }
    p { margin-top: 0.3rem; }
    .done { font-size: 1rem; }
    .actions { margin-top: 0.6rem; }
    .win :global(.stars) { --size: 1.5rem !important; }
  }
</style>
