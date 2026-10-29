import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
// @ts-expect-error plain ESM helper without types
import { startServer } from './static-server.mjs';

const base = process.env.BASE_PATH ?? '/';

// CLAUDE.md §8 — the stale service worker: a deploy must reach the player as "reload to update".
test('a new deploy shows "reload to update", and reloading activates it', async ({ page }) => {
  const dir = mkdtempSync(join(tmpdir(), 'moin-dist-'));
  cpSync(fileURLToPath(new URL('../dist/', import.meta.url)), dir, { recursive: true });
  const server = await startServer({ dir, base, port: 4180 });
  try {
    await page.goto(server.url);
    await page.waitForFunction(async () => (await navigator.serviceWorker.ready).active?.state === 'activated');
    await expect(page.getByText('A fresh harbour is ready.')).toHaveCount(0);

    // "Deploy": the worker script's own bytes change (as a real rebuild changes precache revisions).
    const sw = join(dir, 'sw.js');
    writeFileSync(sw, `${readFileSync(sw, 'utf8')}\n// deploy 2\n`);
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());

    const toast = page.getByRole('status').filter({ hasText: 'A fresh harbour is ready.' });
    await expect(toast).toBeVisible({ timeout: 15_000 });
    await expect(toast).toContainText('Your stars and best taps stay');
    await Promise.all([page.waitForEvent('load'), toast.getByRole('button', { name: 'Reload' }).click()]);
    await expect(page.getByText('A fresh harbour is ready.')).toHaveCount(0);
    expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.waiting ?? null)).toBeNull();
  } finally {
    await server.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
