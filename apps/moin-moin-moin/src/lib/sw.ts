import { registerSW } from 'virtual:pwa-register';

/**
 * Register the service worker. A new worker waits; the app shows *reload to update* and only
 * reloads when the player says so (CLAUDE.md §8, stale service worker).
 */
export function startServiceWorker(onUpdate: (apply: () => void) => void): void {
  if (!('serviceWorker' in navigator)) return;
  const update = registerSW({
    immediate: true,
    onNeedRefresh() {
      onUpdate(() => {
        // Reload ourselves once the new worker takes over. workbox-window's own reload only fires
        // when an older worker controlled the page at load, so a deploy that lands during the
        // very first visit would leave the button dead (.agents/lessons/technical.md).
        navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
        void update(false);
      });
    },
  });
}
