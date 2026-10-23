import { defineConfig, devices } from '@playwright/test';

const base = process.env.BASE_PATH ?? '/';
const url = `http://127.0.0.1:4173${base}`;
// Firefox and WebKit run the replay test only, and only where they are installed (CI).
const allBrowsers = process.env.PW_ALL_BROWSERS === '1';

export default defineConfig({
  testDir: 'e2e',
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  use: { baseURL: url, trace: 'retain-on-failure' },
  webServer: {
    command: 'vite build && node e2e/static-server.mjs',
    url,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Pixel 7'] } },
    ...(allBrowsers
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] }, testMatch: /replay\.spec\.ts/ },
          { name: 'webkit', use: { ...devices['iPhone 14'] }, testMatch: /replay\.spec\.ts/ },
        ]
      : []),
  ],
});
