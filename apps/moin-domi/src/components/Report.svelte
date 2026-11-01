<script lang="ts">
  import type { Item } from '../lib/db.js';
  import { reportHref } from '../lib/flow.js';

  let { item }: { item: Pick<Item, 'hopId' | 'secret'> } = $props();
  const href = $derived(reportHref(item));
  let sent = $state(false);
</script>

{#if href}
  <a class="report" {href} onclick={() => (sent = true)}>Report this chain</a>
  {#if sent}<p class="sent" role="status">Your mail app has the report with the full link. A person reads every report and answers by mail; a chain that breaks the rules is deleted for everyone.</p>{/if}
{/if}

<style>
  .report { align-self: center; min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; padding: 0 12px; font-size: 13px; font-weight: 700; color: var(--dusk); }
  .report:hover { color: var(--lilac); }
  .sent { margin: 0 4px; font-size: 12.5px; line-height: 1.4; color: var(--lilac); text-align: center; }
</style>
