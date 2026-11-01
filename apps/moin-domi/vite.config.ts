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
    publicDir: false,
    plugins: [
      svelte(),
      relayCsp(relayUrl),
      // Offline (§6): the shell, fonts and the four night paintings are precached under /domi/;
      // the relay is never cached — a hop is always asked for afresh, or read from IndexedDB.
      VitePWA({
        registerType: 'prompt',
        injectRegister: null,
        manifest: false,
        workbox: {
          globPatterns: ['**/*.{js,css,html,woff2}', '**/*-night-*.jpg'],
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
