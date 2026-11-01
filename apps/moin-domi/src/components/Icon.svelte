<script lang="ts">
  type Name = 'back' | 'gear' | 'share' | 'lock' | 'wave' | 'speaker' | 'chevron' | 'trash' | 'mail' | 'alert';
  let { name, size = 22, color = 'currentColor' }: { name: Name; size?: number; color?: string } = $props();
</script>

<svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
  {#if name === 'back'}<path d="M15 6l-6 6 6 6" />
  {:else if name === 'chevron'}<path d="M9 6l6 6-6 6" />
  {:else if name === 'gear'}<circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.2" /><path d="M14.2 12.9L21.7 16M12.9 14.2L16 21.7M11.1 14.2L8 21.7M9.8 12.9L2.3 16M9.8 11.1L2.3 8M11.1 9.8L8 2.3M12.9 9.8L16 2.3M14.2 11.1L21.7 8" />
  {:else if name === 'share'}<path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  {:else if name === 'lock'}<rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
  {:else if name === 'wave'}<path d="M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2 5-1" /><path d="M2 17c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2 5-1" opacity="0.5" />
  {:else if name === 'speaker'}<path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
  {:else if name === 'trash'}<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  {:else if name === 'mail'}<rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 8l9 6 9-6" />
  {:else if name === 'alert'}<circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.5" />
  {/if}
</svg>
