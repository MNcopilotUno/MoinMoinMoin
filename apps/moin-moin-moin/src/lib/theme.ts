import type { ThemeSetting } from './progress';

const query = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;

/** The theme actually shown: the setting, or the phone's preference in Auto. */
export function effectiveTheme(setting: ThemeSetting): 'light' | 'dark' {
  if (setting !== 'auto') return setting;
  return query?.matches ? 'dark' : 'light';
}

/** Put the theme on <html> (palette.css swaps its tokens on `data-theme`). */
export function applyTheme(theme: 'light' | 'dark'): void {
  document.documentElement.dataset.theme = theme;
}

/** Call `onchange` when the phone switches between light and dark. Returns an unsubscribe. */
export function watchSystemTheme(onchange: () => void): () => void {
  query?.addEventListener('change', onchange);
  return () => query?.removeEventListener('change', onchange);
}

const motion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

/** Calm motion as shown: the player's choice, or the phone's reduce-motion setting until then. */
export function effectiveCalm(setting: boolean | null): boolean {
  return setting ?? motion?.matches ?? false;
}

/** Put calm motion on <html>: every reduced-motion rule keys off `data-calm` (settings.md). */
export function applyCalm(calm: boolean): void {
  document.documentElement.toggleAttribute('data-calm', calm);
}

/** Call `onchange` when the phone's reduce-motion setting changes. Returns an unsubscribe. */
export function watchSystemMotion(onchange: () => void): () => void {
  motion?.addEventListener('change', onchange);
  return () => motion?.removeEventListener('change', onchange);
}
