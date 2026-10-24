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
