import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { palette } from '@moin/assets';
import { GAME_NAME, GAME_SHORT_NAME } from '@moin/core';
import { dailyLevel, dayId, levels, sets } from '@moin/levels';
import { freshStart, openLevel, person, solveCurrent, today } from './helpers';

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
  // On a win the narrator's line moves into the win card (it never sits under it).
  await expect(page.locator('section.win .quote')).toHaveText(/not a word wasted|impressed/);
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

test('all thirty levels can be solved at par through the interface; stars are kept; the story is told', async ({ page }) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  for (let i = 0; i < levels.length; i++) {
    await expect(page.locator('h1')).toHaveText(levels[i]!.title);
    const par = await solveCurrent(page, i);
    await expect(page.getByTestId('score')).toContainText(`${par} tap`);
    await expect(page.locator('section.win').getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
    if (i === 9) await expect(page.locator('section.win .quote')).toHaveText(/The harbour is awake/);
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
  expect(manifest.theme_color).toBe(palette.ink);
  expect(manifest.background_color).toBe(palette.fog);
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  expect(html).toContain(`<title>${GAME_NAME}</title>`);
  expect(html).toContain(`content="${palette.ink}"`);
});

test('level select: three parts of town, star totals, pick any level, Escape closes', async ({ page }) => {
  await page.goto('./');
  await solveCurrent(page, 0);
  await page.getByRole('button', { name: 'Levels' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { level: 3 })).toHaveText([/The harbour/, /The market/, /The ferry/]);
  await expect(dialog.getByTestId('star-total')).toContainText('3 of 90 stars');
  await expect(dialog.getByRole('button', { name: /^Level 1, First Moin, 3 of 3 stars$/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await openLevel(page, sets[2]!.levels[4]!.title);
  await expect(page.locator('.level-no')).toHaveText(/The ferry\s*level 5 of 10/);
});

test('the fog over the town lifts as its levels are solved', async ({ page }) => {
  await page.goto('./');
  const fog = page.locator('.scene .fog');
  const opacity = () => fog.evaluate((el) => Number((el as HTMLElement).style.opacity));
  const before = await opacity();
  expect(before).toBeGreaterThan(0);
  await solveCurrent(page, 0);
  await expect.poll(opacity).toBeLessThan(before);
});

test("a chatterbox says Moin moin and wakes the captain with one Moin", async ({ page }) => {
  await page.goto('./');
  await openLevel(page, 'Moin moin');
  const chatty = page.getByRole('button', { name: /chatterbox/ });
  await chatty.click();
  await expect(page.getByTestId('moin')).toBeVisible();
  await expect(page.getByTestId('moin')).toContainText('Moin moin');
  await expect(page.getByRole('heading', { name: 'Everyone is smiling!' })).toBeVisible();
  await expect(page.getByTestId('score')).toContainText('1 tap');
});

test('the daily Moin: same puzzle as the generator, solvable at par, result copied as text', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('./');
  await page.getByRole('button', { name: 'Levels' }).click();
  await page.getByRole('button', { name: /Daily Moin/ }).click();
  const level = dailyLevel(today());
  await expect(page.locator('.level-no')).toContainText(dayId(today()));
  await expect(page.locator('button[data-x]')).toHaveCount(level.cells.filter((c) => c.kind === 'person').length);
  await solveCurrent(page, level);
  await page.getByRole('button', { name: 'Copy result' }).click();
  await expect(page.getByText('Copied — paste it anywhere.')).toBeVisible();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain(`daily ${dayId(today())}`);
  expect(text).toContain('⭐⭐⭐');
  expect(text).not.toMatch(/https?:/);
  await page.getByRole('button', { name: 'Back to the town' }).click();
  await expect(page.locator('h1')).toHaveText(levels[0]!.title);
});

test('night harbour: follows the phone, can be switched in settings, and is remembered', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('.scene')).toHaveAttribute('data-painting', 'night');
  const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--paper').trim());
  expect(bg).toBe('#1a2142');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('radio', { name: 'Morning' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.scene')).toHaveAttribute('data-painting', 'day');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('radio', { name: 'Night' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('a crowded, living harbour: poking it is never a move (also with reduced motion)', async ({ page }) => {
  // Ambient sway never settles, so click with motion reduced: the harbour must stay interactive.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.getByRole('button', { name: /^Onlooker, / })).toHaveCount(7);
  await page.getByRole('button', { name: /^Onlooker, / }).nth(1).click();
  await expect(page.getByText('Moin!')).toBeVisible();
  await page.getByRole('button', { name: 'A boat on the water: toot' }).click();
  await page.getByRole('button', { name: 'A gull overhead: shoo it' }).first().click();
  const board = page.getByRole('group', { name: 'Harbour' });
  const box = (await board.boundingBox())!;
  await page.mouse.click(box.x + box.width - 12, box.y + box.height - 12);
  await expect(page.getByTestId('ripple')).toHaveCount(1);
  await expect(page.getByTestId('score')).toContainText('0 taps');
  // the crowd celebrates a solve
  await person(page, 0, 1).click();
  await expect(page.getByRole('heading', { name: 'Everyone is smiling!' })).toBeVisible();
  await expect(page.locator('.quay')).toHaveClass(/celebrate/);
});

test('no sideways scrolling on a phone', async ({ page }) => {
  await page.goto('./');
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
});

test('QA B1: a solve is saved even when the solver double-taps during the animation', async ({ page }) => {
  await page.goto('./');
  await person(page, 0, 1).click();
  await person(page, 0, 1).click();
  await expect(page.getByRole('heading', { name: 'Everyone is smiling!' })).toBeVisible();
  await page.reload();
  await expect(page.locator('h1')).toHaveText(levels[1]!.title);
});

test('QA M4: the level menu is modal and gives focus back', async ({ page }) => {
  await page.goto('./');
  const opener = page.getByRole('button', { name: 'Levels' });
  await opener.click();
  const dialog = page.getByRole('dialog');
  for (let i = 0; i < 45; i++) await page.keyboard.press('Tab');
  expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('QA M5: every person button is at least 44 px on a small phone, even on 7 × 7', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await page.goto(baseURL!);
    await openLevel(page, sets[2]!.levels[9]!.title);
    for (const b of await page.locator('button[data-x]').all()) {
      const box = (await b.boundingBox())!;
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
    }
  } finally {
    await context.close();
  }
});

test('QA M6: at night the level menu shows the moonlit paintings', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  await page.getByRole('button', { name: 'Levels' }).click();
  const banner = page.locator('.banner').first();
  expect(await banner.evaluate((el) => getComputedStyle(el).getPropertyValue('--painting'))).toMatch(/night/);
});
