<script lang="ts">
  import { copy } from '@moin/ui';

  interface Props { apply: () => void }
  let { apply }: Props = $props();
</script>

<div class="toast" role="status">
  <span>{copy.updateReady}</span>
  <button type="button" onclick={apply}>{copy.reload}</button>
</div>

<style>
  .toast {
    position: fixed; top: max(8px, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%);
    display: flex; gap: 0.6rem; align-items: center; z-index: 20;
    background: var(--ink); color: var(--paper); box-shadow: 0 8px 20px var(--shadow); padding: 0.4rem 0.4rem 0.4rem 0.9rem; border-radius: 14px;
    width: max-content; max-width: calc(100vw - 32px); font-size: 0.95rem;
  }
  button {
    min-height: 44px; padding: 0 0.9rem; border-radius: 10px; border: 0;
    background: var(--paper); color: var(--ink); font: inherit; font-weight: 800; cursor: pointer;
  }
</style>
