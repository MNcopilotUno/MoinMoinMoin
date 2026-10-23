import { expect, test } from '@playwright/test';
import { levels } from '@moin/levels';
import { solveCurrent } from './helpers';

// pnpm test:offline — load once, cut the network, solve a level, reload, progress survives.
test('offline after the first load: play, solve, reload, progress survives', async ({ page, context }) => {
  await page.goto('./');
  await expect(page.locator('h1')).toHaveText(levels[0]!.title);
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.state === 'activated' && navigator.serviceWorker.controller !== null;
  });

  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toHaveText(levels[0]!.title);
  await solveCurrent(page, 0);

  await page.reload();
  await expect(page.locator('h1')).toHaveText(levels[1]!.title);
  await solveCurrent(page, 1);
  await context.setOffline(false);
});
