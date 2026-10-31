import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'node:url';

// GitHub Pages serves the app under /<repo>/; the workflow sets BASE_PATH.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  // The shared icons are the app's only static files.
  publicDir: fileURLToPath(new URL('../../packages/assets/icons', import.meta.url)),
  plugins: [
    svelte(),
    // The link card needs an absolute URL (store-presence.md): SITE_URL + base, or base alone.
    { name: 'moin-site-url', transformIndexHtml: { order: 'pre', handler: (html: string) => html.replaceAll('%SITE%', `${process.env.SITE_URL ?? ''}${base}`) } },
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        // The web manifest: one of the three places that name the game (CLAUDE.md §2). The config
        // cannot import workspace TS sources, so the name and colours are literal here; a test in
        // e2e/app.spec.ts checks them against @moin/core and @moin/assets.
        name: 'Moin Moin Moin',
        short_name: 'Moin',
        description: 'A tiny harbour puzzle: pass the Moin until everyone smiles.',
        lang: 'en',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#1e2b4c',
        background_color: '#f6f1e7',
        // Chrome's richer install sheet (store-presence.md); taken from the built app.
        screenshots: [
          { src: 'screenshots/narrow.jpg', sizes: '780x1688', type: 'image/jpeg', form_factor: 'narrow', label: 'A grumpy harbour on a phone: tap a face and pass the Moin along the quay.' },
          { src: 'screenshots/wide.jpg', sizes: '1440x900', type: 'image/jpeg', form_factor: 'wide', label: 'The Speicherstadt harbour at dawn, with a puzzle of fishermen, a captain and a gull.' },
        ],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        // CLAUDE.md §8 (stale service worker): workbox revisions change with content; the cache
        // name stays stable; the new worker waits until the player chooses to reload.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2,webmanifest}'],
        // Wide paintings are for desktops and tablets only (screens.md): cached on first use, so
        // phones never download them; offline, the portrait painting underneath still shows.
        // The link card and install screenshots are for other apps, never for play.
        globIgnores: ['**/*-wide-*.jpg', 'og.jpg', 'screenshots/**'],
        runtimeCaching: [{ urlPattern: /-wide-[\w-]+\.jpg$/, handler: 'CacheFirst', options: { cacheName: 'moin-wide-paintings' } }],
        navigateFallback: 'index.html',
        // Moin Domi lives at <base>/domi/ on the same origin (docs/MOIN_DOMI.md): never answer it with the puzzle.
        navigateFallbackDenylist: [/\/domi\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
      },
    }),
  ],
  build: { target: 'es2022', sourcemap: false },
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
});
