import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Browser, type Page } from '@playwright/test';

// Every screen of Moin Domi against WCAG 2.2 A/AA with axe-core, in the real browser
// (CLAUDE.md §7: accessible from the first commit; .agents/features/domi-a11y.md).

async function audit(page: Page, screen: string): Promise<string[]> {
  // Axe must read final colours: wait until every animation (screen rise, the tree's wave) is done.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'), undefined, { timeout: 10_000 });
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return result.violations.flatMap((v) => v.nodes.map((n) => `${screen}: ${v.id} — ${n.target.join(' ')} — ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`));
}

async function person(browser: Browser): Promise<Page> {
  return (await browser.newContext({ ...test.info().project.use })).newPage();
}

test('every screen passes axe (WCAG 2.2 AA)', async ({ browser, page }) => {
  test.setTimeout(120_000);
  const found: string[] = [];
  await page.goto('./');
  found.push(...await audit(page, 'home'));
  await page.getByRole('button', { name: /Start a chain/ }).click();
  found.push(...await audit(page, 'create'));
  await page.getByRole('button', { name: 'Next: how it travels' }).click();
  found.push(...await audit(page, 'rules'));
  await page.getByRole('radio', { name: 'Just send' }).click();
  found.push(...await audit(page, 'rules-postcard'));
  await page.getByRole('radio', { name: 'A chain' }).click();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: /^Fewer: Stops/ }).click();
  await page.getByRole('button', { name: 'Lock it and make the first link' }).click();
  await expect(page.getByRole('heading', { name: 'Your chain is ready' })).toBeVisible();
  found.push(...await audit(page, 'ready'));
  const link = (await page.locator('[data-link]').getAttribute('data-link'))!;

  const friend = await person(browser);
  await friend.goto(link);
  await expect(friend.getByRole('heading', { name: 'Your turn' })).toBeVisible();
  found.push(...await audit(friend, 'turn'));
  await friend.getByRole('button', { name: 'captain', exact: true }).click();
  found.push(...await audit(friend, 'turn-picking'));
  await friend.getByRole('button', { name: 'gull', exact: true }).click();
  await friend.getByRole('button', { name: 'Pass it on', exact: true }).click();
  const next = (await friend.locator('[data-link]').getAttribute('data-link'))!;
  const last = await person(browser);
  await last.goto(next);
  await last.getByRole('button', { name: 'Add it unchanged as the last' }).click();
  await expect(last.getByRole('heading', { name: 'Look how far it drifted' })).toBeVisible();
  found.push(...await audit(last, 'finale'));
  await last.getByRole('button', { name: 'Back to the tree' }).click();
  await expect(last.getByRole('heading', { name: 'The tree opens' })).toBeVisible();
  found.push(...await audit(last, 'tree'));

  await page.goto('./');
  await page.getByRole('button', { name: /Just send/ }).click();
  await page.getByRole('button', { name: 'Next: who can open it' }).click();
  await page.getByRole('button', { name: 'Lock it and make the link' }).click();
  const card = (await page.locator('[data-link]').getAttribute('data-link'))!;
  await friend.goto(card);
  await expect(friend.getByRole('heading', { name: /A Moin for you|Moin from/ })).toBeVisible();
  found.push(...await audit(friend, 'postcard'));
  await friend.goto('./');
  found.push(...await audit(friend, 'home-waiting'));
  await friend.getByRole('button', { name: /All your chains/ }).click();
  found.push(...await audit(friend, 'yours'));
  await friend.goto('./');
  await friend.getByRole('button', { name: 'Settings' }).click();
  found.push(...await audit(friend, 'settings'));
  await friend.getByRole('button', { name: 'Forget everything on this phone' }).click();
  found.push(...await audit(friend, 'settings-confirm'));
  await friend.getByRole('button', { name: 'Keep it' }).click();
  await friend.getByRole('button', { name: 'About and the rules' }).click();
  found.push(...await audit(friend, 'about'));
  await friend.goto('./m/zzzzzzzz#AAAAAAAAAAAAAAAAAAAAAA');
  await expect(friend.getByRole('heading', { name: 'Gone with the tide' })).toBeVisible();
  found.push(...await audit(friend, 'gone'));
  expect(found).toEqual([]);
});

test('the audit itself is awake: a planted unlabeled field and low contrast are caught', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => {
    const main = document.querySelector('main')!;
    main.insertAdjacentHTML('beforeend', '<input type="text"><p style="color:#222;background:#000">dim words on black</p>');
  });
  const found = await audit(page, 'planted');
  expect(found.some((f) => f.includes('label'))).toBe(true);
  expect(found.some((f) => f.includes('color-contrast'))).toBe(true);
});

test('keyboard only: every screen change moves focus to its heading, and Tab reaches the choices', async ({ page }) => {
  await page.goto('./');
  const start = page.getByRole('button', { name: /Start a chain/ });
  const isFocused = () => start.evaluate((el) => el === document.activeElement);
  let steps = 0;
  while (!(await isFocused()) && steps++ < 10) await page.keyboard.press('Tab');
  await expect(start).toBeFocused();
  expect(steps).toBeLessThanOrEqual(3); // Settings, then the first choice: nothing hidden in between
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Make the meme' })).toBeFocused();
  // A visible focus ring on the next control (style board: 3 px paper outline).
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(outline).not.toBe('none');
});
