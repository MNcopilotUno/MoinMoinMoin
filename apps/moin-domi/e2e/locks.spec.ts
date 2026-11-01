import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Browser, type Page } from '@playwright/test';

// S3 — password and custom links (D12, D13, A2 proposal: .agents/features/password-links.md).

async function person(browser: Browser): Promise<Page> {
  return (await browser.newContext({ ...test.info().project.use })).newPage();
}

async function toRules(page: Page) {
  await page.goto('./');
  await page.getByRole('button', { name: /Start a chain/ }).click();
  await page.getByRole('button', { name: 'Next: how it travels' }).click();
}

const unique = () => `${test.info().project.name}-${Math.random().toString(36).slice(2, 7)}`;

test('a password link: no key in it, the wrong password is refused, the right one opens the turn', async ({ browser, page }) => {
  await toRules(page);
  await page.getByRole('radio', { name: /With a password/ }).click();
  const password = await page.getByLabel('Password', { exact: true }).inputValue();
  expect(password.split('-')).toHaveLength(5); // the suggested passphrase, five words
  await expect(page.getByText('Good. Send it another way than the link.')).toBeVisible();
  await page.getByRole('button', { name: 'Lock it and make the first link' }).click();
  await expect(page.getByRole('heading', { name: 'Your chain is ready' })).toBeVisible();
  await expect(page.getByText(/Locked with your password/)).toBeVisible();
  await expect(page.getByRole('region', { name: 'The password' })).toContainText(password);
  const link = (await page.locator('[data-link]').getAttribute('data-link'))!;
  expect(link).toMatch(/\/domi\/m\/[A-Za-z0-9_-]{8}$/);

  const friend = await person(browser);
  await friend.goto(link);
  await expect(friend.getByRole('heading', { name: 'A Moin is waiting' })).toBeVisible();
  await friend.waitForFunction(() => document.getAnimations().every((x) => x.playState !== 'running'));
  expect((await new AxeBuilder({ page: friend }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations.map((v) => v.id)).toEqual([]);
  await friend.getByLabel('Password', { exact: true }).fill('Not-The-Right-One-At-All');
  await friend.getByRole('button', { name: 'Open' }).click();
  await expect(friend.getByRole('alert')).toHaveText(/That isn’t it/);
  await friend.getByLabel('Password', { exact: true }).fill(password);
  await friend.getByRole('button', { name: 'Open' }).click();
  await expect(friend.getByRole('heading', { name: 'Your turn' })).toBeVisible();
});

test('a name you choose: shown as you type, opens with the password, refused while taken', async ({ browser, page }) => {
  const name = `kapitaen-hein-${unique()}`;
  await toRules(page);
  await page.getByRole('radio', { name: /A name you choose/ }).click();
  await page.getByLabel('Name').fill(name.replace('kapitaen', 'Kapitän'));
  await expect(page.getByText(`…/m/${name}`)).toBeVisible();
  const password = 'drei kleine Worte im Hafen';
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Lock it and make the first link' }).click();
  const link = (await page.locator('[data-link]').getAttribute('data-link'))!;
  expect(link.endsWith(`/domi/m/${name}`)).toBe(true);

  const friend = await person(browser);
  await friend.goto(link);
  await friend.getByLabel('Password', { exact: true }).fill(password);
  await friend.getByRole('button', { name: 'Open' }).click();
  await expect(friend.getByRole('heading', { name: 'Your turn' })).toBeVisible();

  const copycat = await person(browser);
  await toRules(copycat);
  await copycat.getByRole('radio', { name: /A name you choose/ }).click();
  await copycat.getByLabel('Name').fill(name);
  await copycat.getByLabel('Password', { exact: true }).fill('ganz andere drei Worte');
  await copycat.getByRole('button', { name: 'Lock it and make the first link' }).click();
  await expect(copycat.getByRole('alert')).toHaveText('That name is taken while its chain lives. Pick another.');
});

test('a weak password cannot be used, and says why', async ({ page }) => {
  await toRules(page);
  await page.getByRole('radio', { name: /With a password/ }).click();
  await page.getByLabel('Password', { exact: true }).fill('moinmoin');
  await expect(page.getByText('Too common — anyone would guess it.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lock it and make the first link' })).toBeDisabled();
  await page.getByLabel('Password', { exact: true }).fill('kurz');
  await expect(page.getByText('Three words, or twelve characters.')).toBeVisible();
  await page.getByRole('button', { name: 'New' }).click();
  await expect(page.getByRole('button', { name: 'Lock it and make the first link' })).toBeEnabled();
});

test('five wrong passwords: then it asks you to wait, with the time', async ({ browser, page }) => {
  await toRules(page);
  await page.getByRole('radio', { name: /With a password/ }).click();
  await page.getByRole('button', { name: 'Lock it and make the first link' }).click();
  const link = (await page.locator('[data-link]').getAttribute('data-link'))!;
  const guesser = await person(browser);
  await guesser.goto(link);
  for (let i = 0; i < 5; i++) {
    await guesser.getByLabel('Password', { exact: true }).fill(`wrong guess number ${i}`);
    await guesser.getByRole('button', { name: 'Open' }).click();
    await expect(guesser.getByRole('alert')).toBeVisible();
  }
  await expect(guesser.getByRole('alert')).toHaveText(/Too many tries\. You can try again at \d\d:\d\d\./);
  await expect(guesser.getByRole('button', { name: 'Open' })).toBeDisabled();
});
