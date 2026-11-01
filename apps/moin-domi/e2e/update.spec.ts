import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
// @ts-expect-error plain ESM helper without types
import { startServer } from '../../moin-moin-moin/e2e/static-server.mjs';

const root = process.env.BASE_PATH ?? '/';

// CLAUDE.md §8 — the stale service worker, for Domi too: a deploy reaches the person as a prompt.
test('a new deploy of Moin Domi shows a reload prompt, and reloading activates it', async ({ page }) => {
  const dir = mkdtempSync(join(tmpdir(), 'domi-dist-'));
  cpSync(fileURLToPath(new URL('../dist/', import.meta.url)), dir, { recursive: true });
  const server = await startServer({ dir, base: `${root}domi/`, port: 4181 });
  try {
    await page.goto(server.url);
    await page.waitForFunction(async () => (await navigator.serviceWorker.ready).active?.state === 'activated');
    const sw = join(dir, 'sw.js');
    writeFileSync(sw, `${readFileSync(sw, 'utf8')}\n// deploy 2\n`);
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
    const prompt = page.getByRole('status').filter({ hasText: 'A new Moin Domi is ready.' });
    await expect(prompt).toBeVisible({ timeout: 15_000 });
    await Promise.all([page.waitForEvent('load'), prompt.getByRole('button', { name: 'Reload' }).click()]);
    await expect(page.getByText('A new Moin Domi is ready.')).toHaveCount(0);
  } finally {
    await server.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
