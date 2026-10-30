import { defineConfig, devices } from '@playwright/test';

const url = `http://127.0.0.1:4174${process.env.BASE_PATH ?? '/'}domi/`;
// The cross-engine gate (DOMI_ROADMAP D0) runs in Firefox and WebKit where they are installed (CI).
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
  webServer: { command: 'vite build && node e2e/serve.mjs', url, reuseExistingServer: false, timeout: 120_000 },
  projects: [
    { name: 'chromium', use: { ...devices['Pixel 7'] } },
    ...(allBrowsers
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit', use: { ...devices['iPhone 14'] } },
        ]
      : []),
  ],
});
