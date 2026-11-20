<script lang="ts">
  import Icon from '../components/Icon.svelte';
  import { contact } from '../lib/config.js';
  import { domi } from '@moin/ui/copy/domi';
  import { credit, LIBRARY } from '../lib/library.js';

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
    <h2 class="label">{t.libraryTitle}</h2>
    <p>{t.library}</p>
    <details>
      <summary>{t.showCredits(LIBRARY.length)}</summary>
      <ul class="credits">
        {#each LIBRARY as e (e.id)}<li><a href={e.source} rel="noreferrer noopener" target="_blank">{credit(e)} — {t.source}</a></li>{/each}
      </ul>
    </details>
  </section>

  <section class="panel">
    <h2 class="label">{t.feedTitle}</h2>
    <p>{t.feed}</p>
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
  summary { min-height: 44px; display: flex; align-items: center; margin-top: 6px; font-weight: 800; cursor: pointer; }
  .credits { margin: 4px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; }
  .credits a { display: flex; align-items: center; min-height: 44px; padding: 4px 0; font-size: 12.5px; line-height: 1.35; color: var(--lilac); }
  .credits li + li { border-top: 1px solid var(--hair); }
</style>
