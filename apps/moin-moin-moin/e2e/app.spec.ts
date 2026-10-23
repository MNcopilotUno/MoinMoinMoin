import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { palette } from '@moin/assets';
import { GAME_NAME, GAME_SHORT_NAME } from '@moin/core';
import { levels } from '@moin/levels';
import { freshStart, person, solveCurrent } from './helpers';

test('cold open → level 1 → first ripple in under ten seconds, no menu, no prompt', async ({ page }) => {
  const started = Date.now();
  await page.goto('./');
  const first = person(page, 0, 1);
  await first.click();
  await expect(page.getByTestId('moin')).toBeVisible();
  expect(Date.now() - started).toBeLessThan(10_000);
  await expect(page.getByRole('heading', { name: 'Everyone is smiling!' })).toBeVisible();
  await expect(page.locator('section.win').getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next level' })).toBeFocused();
  await page.getByRole('button', { name: 'Next level' }).click();
  await expect(page.locator('h1')).toHaveText(levels[1]!.title);
});

test('every person is a labelled button at least 44 × 44 px', async ({ page }) => {
  await freshStart(page);
  const buttons = page.locator('button[data-x]');
  await expect(buttons).toHaveCount(3);
  for (const button of await buttons.all()) {
    await expect(button).toHaveAttribute('aria-label', /^Grumpy (fisherman|kid|captain|market woman), facing (north|east|south|west), needs (one|two) greetings?$/);
    const box = await button.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  for (const tool of await page.locator('header button').all()) {
    const box = await tool.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test('the ripple is announced as text', async ({ page }) => {
  await freshStart(page);
  await person(page, 1, 1).click();
  await expect(page.getByTestId('announcer')).toHaveText('Two people smiled. The Moin flew out to sea.');
});

test('a smiling person cannot be tapped and the tap does not count (R2); undo is free (R8)', async ({ page }) => {
  await freshStart(page);
  await person(page, 1, 1).click();
  await expect(page.getByTestId('score')).toContainText('1 tap');
  await expect(person(page, 1, 1)).toHaveAttribute('aria-label', /^Smiling/);
  await person(page, 1, 1).click();
  await expect(page.getByTestId('score')).toContainText('1 tap');
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByTestId('score')).toContainText('0 taps');
  await expect(person(page, 1, 1)).toHaveAttribute('aria-label', /^Grumpy/);
  await expect(page.getByRole('button', { name: 'Undo' })).toBeDisabled();
});

test('playable by keyboard alone', async ({ page }) => {
  await freshStart(page);
  await person(page, 0, 1).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Everyone is smiling!' })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toHaveText(levels[1]!.title);
});

test('the narrator never blocks play and can be tapped away', async ({ page }) => {
  await freshStart(page);
  const line = page.getByRole('button', { name: /Foggy morning/ });
  await expect(line).toBeVisible();
  await person(page, 0, 1).click();
  await expect(page.getByRole('heading', { name: 'Everyone is smiling!' })).toBeVisible();
  await page.getByRole('button', { name: /not a word wasted|impressed/ }).click();
  await expect(page.getByRole('button', { name: /not a word wasted|impressed/ })).toBeHidden();
});

test('a tap during the animation is never ignored', async ({ page }) => {
  await page.goto('./');
  await solveCurrent(page, 0);
  await page.getByRole('button', { name: 'Next level' }).click();
  // harbour-02: tap the start, then immediately another person while the Moin flies
  await person(page, 0, 3).click();
  await expect(page.getByTestId('moin')).toBeVisible();
  await person(page, 0, 0).click();
  await expect(page.getByTestId('score')).toContainText('2 taps');
});

test('all ten levels can be solved at par through the interface, and stars are kept', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  for (let i = 0; i < levels.length; i++) {
    await expect(page.locator('h1')).toHaveText(levels[i]!.title);
    const par = await solveCurrent(page, i);
    await expect(page.getByTestId('score')).toContainText(`${par} tap`);
    await expect(page.locator('section.win').getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
    await page.getByRole('button', { name: i === levels.length - 1 ? 'Back to the first level' : 'Next level' }).click();
  }
  await expect(page.locator('h1')).toHaveText(levels[0]!.title);
  await expect(page.getByTestId('score').getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
});

test('progress survives a reload: the cold open continues at the first unsolved level', async ({ page }) => {
  await page.goto('./');
  await solveCurrent(page, 0);
  await page.reload();
  await expect(page.locator('h1')).toHaveText(levels[1]!.title);
});

test('silent and local: no third-party request, no cookie, no localStorage, no CSP violation', async ({ page, context, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const foreign: string[] = [];
  page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) foreign.push(r.url()); });
  const violations: string[] = [];
  page.on('console', (m) => { if (/Content Security Policy|Refused to/.test(m.text())) violations.push(m.text()); });
  await page.goto('./');
  await solveCurrent(page, 0);
  expect(foreign).toEqual([]);
  expect(violations).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test('the web manifest names the game from core and uses the palette', async ({ request }) => {
  const manifest = await (await request.get('manifest.webmanifest')).json();
  expect(manifest.name).toBe(GAME_NAME);
  expect(manifest.short_name).toBe(GAME_SHORT_NAME);
  expect(manifest.theme_color).toBe(palette.royal);
  expect(manifest.background_color).toBe(palette.fog);
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  expect(html).toContain(`<title>${GAME_NAME}</title>`);
  expect(html).toContain(`content="${palette.royal}"`);
});
