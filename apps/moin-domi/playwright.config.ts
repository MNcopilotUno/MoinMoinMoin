import { defineConfig, devices } from '@playwright/test';

const root = process.env.BASE_PATH ?? '/';
const url = `http://127.0.0.1:4174${root}domi/`;
export const RELAY = 'http://127.0.0.1:4175';
export const NO_RELAY = `http://127.0.0.1:4176${root}domi/`;
// Firefox and WebKit run too where they are installed (CI).
const allBrowsers = process.env.PW_ALL_BROWSERS === '1';

export default defineConfig({
  testDir: 'e2e',
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 90_000,
  use: { baseURL: url, trace: 'retain-on-failure' },
  webServer: [
    // A throwaway Cursus on loopback, in memory (services/cursus). Every browser project shares it
    // from one address, so its rate limits are raised a hundredfold (.agents/lessons/testing.md).
    { command: 'CURSUS_DB=:memory: CURSUS_PORT=4175 CURSUS_RATE_SCALE=100 pnpm --filter @moin/cursus start', port: 4175, reuseExistingServer: false, timeout: 60_000 },
    // The app as the live site has it today (no relay), and the app with the local relay.
    { command: 'vite build --outDir dist-norelay --emptyOutDir && DIST=dist-norelay PORT=4176 node e2e/serve.mjs', url: NO_RELAY, reuseExistingServer: false, timeout: 120_000 },
    { command: `VITE_CURSUS_URL=${RELAY} VITE_DOMI_CONTACT=report@example.org vite build && node e2e/serve.mjs`, url, reuseExistingServer: false, timeout: 120_000 },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Pixel 7'] } },
    ...(allBrowsers
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          // Playwright's WebKit cannot navigate or reload at all while `setOffline(true)`, even with a
          // service worker that would answer ("WebKit encountered an internal error"); the offline
          // suite runs on Chromium and Firefox. Real Safari is checked by hand (HANDOVER).
          { name: 'webkit', use: { ...devices['iPhone 14'] }, testIgnore: /offline\.spec\.ts/ },
        ]
      : []),
  ],
});
