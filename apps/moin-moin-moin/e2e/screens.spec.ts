import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { levels, sets } from '@moin/levels';
import { openLevel, solveCurrent } from './helpers';

// .agents/features/screens.md — landscape phones, desktop and 320 px phones.
const inView = async (page: Page) => {
  const box = (await page.locator('.board').boundingBox())!;
  const vp = page.viewportSize()!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(vp.height + 1);
  for (const b of await page.locator('button[data-x]').all()) {
    const p = (await b.boundingBox())!;
    expect(Math.min(p.width, p.height)).toBeGreaterThanOrEqual(44);
  }
};

test.describe('landscape phone', () => {
  test.use({ viewport: { width: 844, height: 390 } });

  test('the whole board is on screen, 5 × 5 and 7 × 7', async ({ page }) => {
    await page.goto('./');
    await openLevel(page, sets[0]!.levels[8]!.title);
    await inView(page);
    await openLevel(page, sets[2]!.levels[9]!.title);
    await inView(page);
  });

  test('the win card does not cover the solved board', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await expect(page.locator('h1')).toHaveText(levels[0]!.title);
    await solveCurrent(page, 0);
    const card = (await page.locator('section.win').boundingBox())!;
    const board = (await page.locator('.board').boundingBox())!;
    const overlap = card.x < board.x + board.width && board.x < card.x + card.width && card.y < board.y + board.height && board.y < card.y + card.height;
    expect(overlap).toBe(false);
  });
});

test('desktop: a wide painting, with the portrait one underneath', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('./');
  const bg = await page.locator('.scene').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(bg).toMatch(/harbour-wide[^,]*\.jpg.*harbour-[A-Za-z0-9_-]+\.jpg/);
});

test('phone: only the portrait painting', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const bg = await page.locator('.scene').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(bg).not.toMatch(/-wide/);
});

test('320 px: the kicker fits two lines and the title one', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('./');
  await openLevel(page, sets[0]!.levels[8]!.title);
  const kicker = page.locator('.level-no');
  const lineHeight = await kicker.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
  expect((await kicker.boundingBox())!.height).toBeLessThanOrEqual(lineHeight * 2 + 1);
  const h1 = page.locator('h1');
  const size = await h1.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect((await h1.boundingBox())!.height).toBeLessThan(size * 1.5);
});

test('wide paintings are not precached: phones never download them', async () => {
  const sw = readFileSync(new URL('../dist/sw.js', import.meta.url), 'utf8');
  expect(sw).toMatch(/harbour-[A-Za-z0-9_-]+\.jpg/);
  expect(sw).not.toMatch(/-wide-[A-Za-z0-9_-]+\.jpg/);
});
