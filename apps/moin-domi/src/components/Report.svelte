<script lang="ts">
  import type { Item } from '../lib/db.js';
  import { reportHref } from '../lib/flow.js';
  import { domi } from '@moin/ui/copy/domi';

  let { item }: { item: Pick<Item, 'hopId' | 'secret'> } = $props();
  const href = $derived(reportHref(item));
  let sent = $state(false);
</script>

{#if href}
  <a class="report" {href} onclick={() => (sent = true)}>{domi.report.link}</a>
  {#if sent}<p class="sent" role="status">{domi.report.sent}</p>{/if}
{/if}

<style>
  .report { align-self: center; min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; padding: 0 12px; font-size: 13px; font-weight: 700; color: var(--dusk); }
  .report:hover { color: var(--lilac); }
  .sent { margin: 0 4px; font-size: 12.5px; line-height: 1.4; color: var(--lilac); text-align: center; }
</style>
