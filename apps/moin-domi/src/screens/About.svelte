<script lang="ts">
  import Icon from '../components/Icon.svelte';
  import { contact } from '../lib/config.js';
  import { domi } from '@moin/ui/copy/domi';

  const t = domi.about;
  let { onback }: { onback: () => void } = $props();
</script>

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label={t.back} onclick={onback}><Icon name="back" /></button>
    <h1 tabindex="-1">{t.title}</h1>
  </div>

  <section class="panel">
    <h2 class="label">{t.whatTitle}</h2>
    <p>{t.what}</p>
  </section>

  <section class="panel">
    <h2 class="label">{t.notAllowed}</h2>
    <ul>
      {#each t.rules as rule (rule)}<li>{rule}</li>{/each}
    </ul>
  </section>

  <section class="panel">
    <h2 class="label">{t.careTitle}</h2>
    <p>{t.care}</p>
  </section>

  <section class="panel">
    <h2 class="label">{t.contactTitle}</h2>
    {#if contact}
      <p>{t.people} {t.reportHow[0]}<em>{t.reportHow[1]}</em>{t.reportHow[2]}</p>
      <a class="mail" href={`mailto:${contact}`}>{contact}</a>
    {:else}
      <p>{t.noContact}</p>
    {/if}
  </section>
</main>

<style>
  .bar h1 { font-size: 26px; }
  section { margin-top: 12px; padding: 14px 16px; }
  .label { margin-bottom: 6px; }
  p, ul { font-size: 14.5px; line-height: 1.5; color: #d9d3e9; }
  ul { margin: 0; padding-left: 18px; }
  .mail { margin-top: 8px; min-height: 48px; display: flex; align-items: center; padding: 0 14px; border-radius: 14px; background: var(--raised); box-shadow: inset 0 0 0 1px var(--line); font-weight: 800; text-decoration: none; overflow-wrap: anywhere; }
</style>
