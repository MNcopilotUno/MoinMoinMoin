import { expect, test } from '@playwright/test';

// The app shell (docs/MOIN_DOMI.md): Domi is served at <base>/domi/, says honestly that it is being built, links back to
// the puzzle, and makes no request off its origin (CLAUDE.md §1: no third-party origin).
test('the scaffold: an honest card, no request off the origin', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const offOrigin: string[] = [];
  page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) offOrigin.push(r.url()); });
  await page.goto('./');
  await expect(page).toHaveTitle('Moin Domi');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pass the meme on.');
  const play = page.getByRole('link', { name: /^Play .* meanwhile$/ });
  expect(await play.getAttribute('href')).toBe('../');
  expect((await play.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(offOrigin).toEqual([]);
});

