import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

// .agents/features/store-presence.md — the link card, the install screenshots.
const size = (page: Page, url: string) => page.evaluate((src) => new Promise<[number, number]>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve([img.naturalWidth, img.naturalHeight]);
  img.onerror = () => reject(new Error(`not served: ${src}`));
  img.src = src;
}), url);

test('a pasted link shows a card: Open Graph and Twitter tags, a 1200 × 630 image', async ({ page }) => {
  await page.goto('./');
  const meta = (sel: string) => page.locator(`meta[${sel}]`).getAttribute('content');
  expect(await meta('property="og:title"')).toBe('Moin Moin Moin');
  expect(await meta('property="og:description"')).toMatch(/Moin/);
  expect(await meta('property="og:image:alt"')).toMatch(/harbour/);
  expect(await meta('name="twitter:card"')).toBe('summary_large_image');
  const image = (await meta('property="og:image"'))!;
  expect(image).toMatch(/og\.jpg$/);
  expect(await size(page, new URL('og.jpg', page.url()).href)).toEqual([1200, 630]);
});

test('the install sheet has screenshots, narrow and wide, as large as the manifest says', async ({ page }) => {
  await page.goto('./');
  const href = (await page.locator('link[rel="manifest"]').getAttribute('href'))!;
  const manifest = await (await page.request.get(new URL(href, page.url()).href)).json() as {
    screenshots: { src: string; sizes: string; form_factor: string; label: string }[];
  };
  expect(manifest.screenshots.map((s) => s.form_factor).sort()).toEqual(['narrow', 'wide']);
  for (const s of manifest.screenshots) {
    expect(s.label.length).toBeGreaterThan(10);
    const [w, h] = await size(page, new URL(s.src, page.url()).href);
    expect(`${w}x${h}`).toBe(s.sizes);
  }
});

test('the card and screenshots are not precached: players never download them', async () => {
  const sw = readFileSync(new URL('../dist/sw.js', import.meta.url), 'utf8');
  expect(sw).not.toMatch(/og\.jpg/);
  expect(sw).not.toMatch(/screenshots\//);
});

test('the puzzle never answers for Moin Domi at /domi/ (docs/MOIN_DOMI.md)', async () => {
  const sw = readFileSync(new URL('../dist/sw.js', import.meta.url), 'utf8');
  expect(sw).toMatch(/denylist:\[\/\\\/domi\\\/\/\]/);
});
