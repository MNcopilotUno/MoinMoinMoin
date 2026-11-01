<script lang="ts">
  import Icon from '../components/Icon.svelte';
  import { contact } from '../lib/config.js';

  let { onback }: { onback: () => void } = $props();
</script>

<main class="screen">
  <div class="bar">
    <button type="button" class="round" aria-label="Back to settings" onclick={onback}><Icon name="back" /></button>
    <h1 tabindex="-1">About and the rules</h1>
  </div>

  <section class="panel">
    <h2 class="label">What Moin Domi is</h2>
    <p>A private Stille Post for memes between friends, from the cast of the Moin harbour. No accounts, no feed, no search: a meme reaches only the people its link is sent to, and every chain is deleted 30 days after its last stop.</p>
  </section>

  <section class="panel">
    <h2 class="label">Not allowed</h2>
    <ul>
      <li>anything illegal where you or the people you send it to live;</li>
      <li>threats, harassment, or hounding someone;</li>
      <li>someone else’s private details — addresses, numbers, secrets.</li>
    </ul>
  </section>

  <section class="panel">
    <h2 class="label">How we look after it</h2>
    <p>The relay that passes memes on cannot read them. We see a chain only when someone sends us its full link. If it breaks these rules, we delete the whole chain, for everyone, and nobody can open it again. We don’t know who was in it, so we can’t tell anyone it went.</p>
  </section>

  <section class="panel">
    <h2 class="label">Contact and reports</h2>
    {#if contact}
      <p>People answer, not a machine. To report a chain, use <em>Report this chain</em> under a meme: it puts the full link in the mail for you.</p>
      <a class="mail" href={`mailto:${contact}`}>{contact}</a>
    {:else}
      <p>No contact address yet: the relay isn’t public, so there is nothing to report. One will be here before anyone can send a Moin.</p>
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
