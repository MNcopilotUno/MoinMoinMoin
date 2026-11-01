import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Moin Domi lives beside the puzzle at <base>/domi/ (docs/MOIN_DOMI.md); the workflow sets BASE_PATH.
const base = `${process.env.BASE_PATH ?? '/'}domi/`;

/** The page may talk to its own origin and to the relay, and nowhere else (CSP `connect-src`). */
function relayCsp(relayUrl: string | undefined): Plugin {
  const origin = relayUrl ? new URL(relayUrl).origin : '';
  return {
    name: 'domi-relay-csp',
    transformIndexHtml: (html) => html.replace("connect-src 'self'", origin ? `connect-src 'self' ${origin}` : "connect-src 'self'"),
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const relayUrl = process.env.VITE_CURSUS_URL ?? env.VITE_CURSUS_URL;
  return {
    base,
    // Domi's own icons (packages/assets/icons/domi, rendered by `pnpm --filter @moin/assets icons`).
    publicDir: fileURLToPath(new URL('../../packages/assets/icons/domi', import.meta.url)),
    plugins: [
      svelte(),
      relayCsp(relayUrl),
      // Offline (§6): the shell, fonts and the four night paintings are precached under /domi/;
      // the relay is never cached — a hop is always asked for afresh, or read from IndexedDB.
      VitePWA({
        registerType: 'prompt',
        injectRegister: null,
        // Installable, and a target in the phone's share sheet (.agents/features/domi-install.md):
        // a Moin Domi link shared from a messenger opens here, read as `?share-text=` / `share-url`.
        manifest: {
          name: 'Moin Domi',
          short_name: 'Moin Domi',
          description: 'A private Stille Post for memes from the Moin harbour.',
          lang: 'en',
          start_url: './',
          scope: './',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#000000',
          theme_color: '#000000',
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
          ],
          share_target: {
            action: './',
            method: 'GET',
            params: { title: 'share-title', text: 'share-text', url: 'share-url' },
          },
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,woff2,svg,png,webmanifest}', '**/*-night-*.jpg'],
          globIgnores: ['**/*-wide-*.jpg'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: false,
        },
      }),
    ],
    build: { target: 'es2022', sourcemap: false },
    server: { host: '127.0.0.1' },
    preview: { host: '127.0.0.1' },
  };
});
