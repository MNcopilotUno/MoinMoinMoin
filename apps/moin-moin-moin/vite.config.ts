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
});
