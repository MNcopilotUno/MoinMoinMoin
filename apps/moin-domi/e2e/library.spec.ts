import { expect, test, type Browser, type Page } from '@playwright/test';

/** A8: the open-licensed library in Make the meme, in chains and in public posts. */

async function person(browser: Browser): Promise<Page> {
  return (await browser.newContext({ ...test.info().project.use })).newPage();
}

test('a library image: picked with its credit, travels in a chain, and opens for the next stop', async ({ browser, page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /Start a chain/ }).click();
  await page.getByRole('radio', { name: 'The Great Wave off Kanagawa' }).click();
  await expect(page.getByText('“The Great Wave off Kanagawa”, Katsushika Hokusai, c. 1831 · Public domain')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Nobody' })).toBeChecked();
  await expect(page.locator('.preview .bg.own')).toHaveAttribute('src', /great-wave-[A-Za-z0-9_-]{8}\.jpg$/);
  await page.getByPlaceholder('Top caption').fill('Monday');
  await page.getByPlaceholder('Bottom caption').fill('coming in');
  await page.getByRole('button', { name: 'Next: how it travels' }).click();
  await page.getByRole('button', { name: 'Lock it and make the first link' }).click();
  const link = await page.locator('[data-link]').getAttribute('data-link');

  const friend = await person(browser);
  await friend.goto(link!);
  await expect(friend.getByRole('img', { name: /over “The Great Wave off Kanagawa”/ }).first()).toBeVisible();
  const loaded = await friend.locator('.meme .bg.own').first().evaluate(async (img: HTMLImageElement) => { await img.decode(); return img.naturalWidth; });
  expect(loaded).toBe(1080);
  await friend.context().close();
});

test('choosing a painting again drops the library image; a library meme may be posted publicly', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /Start a chain/ }).click();
  await page.getByRole('radio', { name: 'The Scream' }).click();
  await page.getByRole('radio', { name: 'Market', exact: true }).click();
  await expect(page.locator('.preview .bg')).not.toHaveClass(/own/);
  await expect(page.getByRole('radio', { name: 'The Scream' })).toHaveAttribute('aria-checked', 'false');
  await page.getByRole('radio', { name: 'The Scream' }).click();
  await page.getByPlaceholder('Top caption').fill(`Scream ${Date.now()}`);
  await page.getByRole('button', { name: 'Next: how it travels' }).click();
  await page.getByRole('radio', { name: 'Public' }).click();
  await expect(page.getByRole('button', { name: 'Post it publicly' })).toBeEnabled();
  await page.getByRole('button', { name: 'Post it publicly' }).click();
  await expect(page.locator('.post').first().getByRole('img', { name: /over “The Scream”/ })).toBeVisible();
});

test('about lists every library picture with its licence and source', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: /About and the rules/ }).click();
  await page.getByText('All 24 pictures and their sources').click();
  const credits = page.locator('.credits li');
  await expect(credits).toHaveCount(24);
  for (const text of await credits.allTextContents()) expect(text).toMatch(/· (Public domain|CC0 1\.0) — source$/);
  const small = await page.$$eval('.credits a, summary', (els) => els.filter((e) => e.getBoundingClientRect().height < 44).length);
  expect(small).toBe(0);
  await expect(credits.getByRole('link').first()).toHaveAttribute('href', /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
});
