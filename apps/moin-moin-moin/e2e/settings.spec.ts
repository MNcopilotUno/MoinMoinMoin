import { expect, test } from '@playwright/test';
import { levels } from '@moin/levels';
import { freshStart, solveCurrent } from './helpers';

// .agents/features/settings.md — the settings sheet and its dialogs, against the built app.
const openSettings = async (page: import('@playwright/test').Page) => {
  await page.getByRole('button', { name: 'Settings' }).click();
  const sheet = page.getByRole('dialog', { name: 'Settings' });
  await expect(sheet).toBeVisible();
  return sheet;
};

test('settings is a modal: focus stays in, Escape closes and gives focus back', async ({ page }) => {
  await freshStart(page);
  const opener = page.getByRole('button', { name: 'Settings' });
  const sheet = await openSettings(page);
  await expect(page.locator('.shell')).toHaveAttribute('inert', '');
  for (let i = 0; i < 30; i++) await page.keyboard.press('Tab');
  expect(await sheet.evaluate((d) => d.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(opener).toBeFocused();
});

test('sound, haptics and look are switched in settings and remembered', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await freshStart(page);
  let sheet = await openSettings(page);
  const sound = sheet.getByRole('switch', { name: /^Sound/ });
  await expect(sound).toHaveAttribute('aria-checked', 'true');
  await sound.click();
  await expect(sound).toHaveAttribute('aria-checked', 'false');
  await expect(sheet.getByRole('slider', { name: 'Volume' })).toBeDisabled();
  await sheet.getByRole('switch', { name: /^Haptics/ }).click();
  await sheet.getByRole('radio', { name: 'Night' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  sheet = await openSettings(page);
  await expect(sheet.getByRole('switch', { name: /^Sound/ })).toHaveAttribute('aria-checked', 'false');
  await expect(sheet.getByRole('switch', { name: /^Haptics/ })).toHaveAttribute('aria-checked', 'false');
  await sheet.getByRole('radio', { name: 'Morning' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('calm motion follows the phone until it is switched', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await freshStart(page);
  await expect(page.locator('html')).toHaveAttribute('data-calm', '');
  const sheet = await openSettings(page);
  const calm = sheet.getByRole('switch', { name: /^Calm motion/ });
  await expect(calm).toHaveAttribute('aria-checked', 'true');
  await calm.click();
  await expect(page.locator('html')).not.toHaveAttribute('data-calm', '');
  await page.reload();
  await expect(page.locator('html')).not.toHaveAttribute('data-calm', '');
});

test('the narrator can be turned off', async ({ page }) => {
  await freshStart(page);
  await expect(page.locator('.narrator .line')).toBeVisible();
  const sheet = await openSettings(page);
  await sheet.getByRole('switch', { name: /^Narrator/ }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.narrator')).toHaveCount(0);
  await solveCurrent(page, 0);
  await expect(page.locator('section.win .quote')).toHaveCount(0);
});

test('start over asks first, keeps the stars by default, and really clears them', async ({ page }) => {
  await freshStart(page);
  await solveCurrent(page, 0);
  let sheet = await openSettings(page);
  await expect(sheet.getByTestId('progress')).toContainText('1 level solved');
  await sheet.getByRole('button', { name: 'Start over…' }).click();
  const confirm = page.getByRole('alertdialog', { name: 'Start the harbour over?' });
  await expect(confirm.getByRole('button', { name: 'Keep my stars' })).toBeFocused();
  await confirm.getByRole('button', { name: 'Keep my stars' }).click();
  await expect(confirm).toBeHidden();
  await expect(sheet.getByTestId('progress')).toContainText('1 level solved');
  await sheet.getByRole('button', { name: 'Start over…' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Start over', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Settings' })).toBeHidden();
  await expect(page.locator('h1')).toHaveText(levels[0]!.title);
  await page.reload();
  await expect(page.locator('h1')).toHaveText(levels[0]!.title);
  sheet = await openSettings(page);
  await expect(sheet.getByTestId('progress')).toContainText('No stars yet');
});

test('about and privacy says what is (not) collected', async ({ page }) => {
  await freshStart(page);
  const sheet = await openSettings(page);
  await sheet.getByRole('button', { name: 'About and privacy' }).click();
  await expect(sheet.getByRole('heading', { name: 'About and privacy' })).toBeVisible();
  await expect(sheet).toContainText('No accounts, no analytics, no cookies, no ads');
  await sheet.getByRole('button', { name: 'Back to settings' }).click();
  await expect(sheet.getByRole('switch', { name: /^Sound/ })).toBeVisible();
});

test('every control in the sheet is at least 44 px on a small phone', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await page.goto(baseURL!);
    await page.getByRole('button', { name: 'Settings' }).click();
    const sheet = page.getByRole('dialog', { name: 'Settings' });
    for (const control of await sheet.locator('button, label:has(input[type=radio]), input[type=range]').all()) {
      const box = (await control.boundingBox())!;
      expect(box.height, await control.evaluate((el) => el.outerHTML.slice(0, 80))).toBeGreaterThanOrEqual(44);
    }
  } finally {
    await context.close();
  }
});
