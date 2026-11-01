<script lang="ts">
  import type { Item } from '../lib/db.js';
  import { reportHref } from '../lib/flow.js';

  let { item }: { item: Pick<Item, 'hopId' | 'secret'> } = $props();
  const href = $derived(reportHref(item));
</script>

{#if href}<a class="report" {href}>Report this chain</a>{/if}

<style>
  .report { align-self: center; min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; padding: 0 12px; font-size: 13px; font-weight: 700; color: var(--dusk); }
  .report:hover { color: var(--lilac); }
</style>
