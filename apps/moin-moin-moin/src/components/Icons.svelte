<script lang="ts">
  interface Props { name: 'undo' | 'restart' | 'sound' | 'muted' | 'levels' | 'settings' | 'back' | 'close' }
  let { name }: Props = $props();
</script>

<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
  {#if name === 'levels'}
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  {:else if name === 'settings'}
    <!-- A ship's wheel: the harbour's own settings gear. -->
    <circle cx="12" cy="12" r="7" stroke-width="2" /><circle cx="12" cy="12" r="2.2" stroke-width="2" /><path d="M14.22 12.92L21.70 16.02 M12.92 14.22L16.02 21.70 M11.08 14.22L7.98 21.70 M9.78 12.92L2.30 16.02 M9.78 11.08L2.30 7.98 M11.08 9.78L7.98 2.30 M12.92 9.78L16.02 2.30 M14.22 11.08L21.70 7.98" stroke-width="2" />
  {:else if name === 'back'}
    <path d="M15 5l-7 7 7 7" />
  {:else if name === 'close'}
    <path d="M6 6l12 12M18 6 6 18" />
  {:else if name === 'undo'}
    <path d="M9 7 4 12l5 5" /><path d="M4 12h10a6 6 0 0 1 0 12h-2" transform="translate(0 -6)" />
  {:else if name === 'restart'}
    <path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v5h-5" />
  {:else if name === 'sound'}
    <path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7" /><path d="M19 6a8.5 8.5 0 0 1 0 12" />
  {:else}
    <path d="M4 9h4l5-4v14l-5-4H4z" /><path d="m17 9 5 6" /><path d="m22 9-5 6" />
  {/if}
</svg>
