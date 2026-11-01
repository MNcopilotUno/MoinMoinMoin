import { registerSW } from 'virtual:pwa-register';

/** As in the puzzle (CLAUDE.md §8): a new worker waits until the person chooses to reload. */
export function startServiceWorker(onUpdate: (apply: () => void) => void): void {
  if (!('serviceWorker' in navigator)) return;
  const update = registerSW({
    immediate: true,
    onNeedRefresh() {
      onUpdate(() => {
        navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
        void update(false);
      });
    },
  });
}
