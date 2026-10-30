import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

// Moin Domi lives beside the puzzle at <base>/domi/ (DOMI_ROADMAP D0); the workflow sets BASE_PATH.
const base = `${process.env.BASE_PATH ?? '/'}domi/`;

export default defineConfig({
  base,
  publicDir: false,
  plugins: [svelte()],
  build: { target: 'es2022', sourcemap: false },
  server: { host: '127.0.0.1' },
  preview: { host: '127.0.0.1' },
});
