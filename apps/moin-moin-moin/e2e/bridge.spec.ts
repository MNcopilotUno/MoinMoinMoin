import { expect, test } from '@playwright/test';
import { levels } from '@moin/levels';
import { freshStart, solveCurrent } from './helpers';

// Phase 4 / Moin Domi S4 gate: "the button adds no network call to the puzzle until pressed, and
// is disabled with a reason when offline" (docs/MOIN_DOMI.md §7).
test('a solved level offers a Moin chain: a plain link, nothing fetched, disabled offline', async ({ page, context }) => {
  const domi: string[] = [];
  page.on('request', (r) => { if (r.url().includes('/domi/')) domi.push(r.url()); });
  await freshStart(page);
  await solveCurrent(page, 0);
  const link = page.getByRole('link', { name: 'Start a Moin chain with friends' });
  await expect(link).toHaveAttribute('href', `domi/?from=${levels[0]!.id}`);
  expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(domi).toEqual([]);
  await context.setOffline(true);
  const off = page.getByRole('button', { name: 'Start a Moin chain with friends' });
  await expect(off).toBeDisabled();
  await expect(off).toHaveAccessibleDescription(/Needs the internet/);
  await context.setOffline(false);
  await expect(page.getByRole('link', { name: 'Start a Moin chain with friends' })).toBeVisible();
  expect(domi).toEqual([]);
});

test('Moin Domi sits beside the puzzle in the level menu: a plain link, nothing fetched, disabled offline', async ({ page, context }) => {
  const domi: string[] = [];
  page.on('request', (r) => { if (r.url().includes('/domi/')) domi.push(r.url()); });
  await freshStart(page);
  await page.getByRole('button', { name: 'Levels' }).click();
  const menu = page.getByRole('dialog');
  const card = menu.getByRole('link', { name: /^Moin Domi/ });
  await expect(card).toHaveAttribute('href', 'domi/');
  expect((await card.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(domi).toEqual([]);
  await context.setOffline(true);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Levels' }).click();
  await expect(page.getByRole('dialog').getByRole('link', { name: /^Moin Domi/ })).toHaveCount(0);
  await expect(page.getByRole('dialog').getByText('Needs the internet the first time.')).toBeVisible();
  await context.setOffline(false);
});
