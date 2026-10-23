<script lang="ts">
  interface Props { name: 'undo' | 'restart' | 'sound' | 'muted' }
  let { name }: Props = $props();
</script>

<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
  {#if name === 'undo'}
    <path d="M9 7 4 12l5 5" /><path d="M4 12h10a6 6 0 0 1 0 12h-2" transform="translate(0 -6)" />
  {:else if name === 'restart'}
    <path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v5h-5" />
  {:else if name === 'sound'}
    <path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7" /><path d="M19 6a8.5 8.5 0 0 1 0 12" />
  {:else}
    <path d="M4 9h4l5-4v14l-5-4H4z" /><path d="m17 9 5 6" /><path d="m22 9-5 6" />
  {/if}
</svg>
