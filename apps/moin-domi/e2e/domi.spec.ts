import { expect, test, type Browser, type Page } from '@playwright/test';
import { NO_RELAY, RELAY } from '../playwright.config';

/** Every request stays on the app's origin or goes to the relay (CLAUDE.md §1, domi-app.md). */
function watchOrigins(page: Page, allowed: string[]): string[] {
  const off: string[] = [];
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith('data:') && !u.startsWith('blob:') && !allowed.some((a) => u.startsWith(a))) off.push(u);
  });
  return off;
}

async function person(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ ...test.info().project.use });
  return context.newPage();
}

async function tapTargets(page: Page): Promise<string[]> {
  return page.$$eval('button, a, [role="radio"], [role="switch"]', (els) => els
    .filter((e) => (e as HTMLElement).offsetParent !== null)
    .map((e) => ({ name: (e.getAttribute('aria-label') ?? e.textContent ?? '').trim().slice(0, 30), r: e.getBoundingClientRect() }))
    .filter(({ r }) => Math.round(r.height * 100) / 100 < 44 || Math.round(r.width * 100) / 100 < 44)
    .map(({ name, r }) => `${name} ${r.width.toFixed(1)}×${r.height.toFixed(1)}`));
}

/** Home → make → rules → link. Returns the full link from the Ready screen. */
async function makeChain(page: Page, stops: number): Promise<string> {
  await page.goto('./');
  await page.getByRole('button', { name: /Start a chain/ }).click();
  await expect(page.getByRole('heading', { name: 'Make the meme' })).toBeVisible();
  await page.getByRole('radio', { name: 'The grumpy captain' }).click();
  await page.getByPlaceholder('Top caption').fill('When the captain');
  await page.getByPlaceholder('Bottom caption').fill('finally says Moin');
  await page.getByRole('button', { name: 'Next: how it travels' }).click();
  await expect(page.getByRole('heading', { name: 'How it travels' })).toBeVisible();
  for (let s = 6; s > stops; s--) await page.getByRole('button', { name: /^Fewer: Stops/ }).click();
  await expect(page.locator('output').first()).toHaveText(String(stops));
  await page.getByRole('button', { name: 'Lock it and make the first link' }).click();
  await expect(page.getByRole('heading', { name: 'Your chain is ready' })).toBeVisible();
  const link = await page.locator('[data-link]').getAttribute('data-link');
  expect(link).toMatch(/\/domi\/m\/[A-Za-z0-9_-]{8}#[A-Za-z0-9_-]{22}$/);
  return link!;
}

test('home: both choices, every target ≥ 44 px, nothing off the origin', async ({ page, baseURL }) => {
  const off = watchOrigins(page, [new URL(baseURL!).origin, RELAY]);
  await page.goto('./');
  await expect(page).toHaveTitle('Moin Domi');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Moin Domi');
  await expect(page.getByRole('button', { name: /Start a chain/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Just send/ })).toBeVisible();
  expect(await tapTargets(page)).toEqual([]);
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(0, 0, 0)');
  expect(off).toEqual([]);
});

test('a chain of three: make, change one word, last stop, finale, tree', async ({ browser, baseURL }) => {
  const creator = await person(browser);
  const off = watchOrigins(creator, [new URL(baseURL!).origin, RELAY]);
  const first = await makeChain(creator, 3);

  // Stop 2 opens the link by its path: GitHub Pages' 404 page turns it into ?m=…#key.
  const second = await person(browser);
  await second.goto(first);
  await expect(second.getByRole('heading', { name: 'Your turn' })).toBeVisible();
  expect(second.url()).not.toContain('#');
  expect(second.url()).not.toContain('?m=');
  await expect(second.getByRole('img', { name: /You are stop 2 of 3/ })).toBeVisible();
  await second.getByRole('button', { name: 'captain', exact: true }).click();
  await second.getByRole('button', { name: 'gull', exact: true }).click();
  await expect(second.getByText('0 of 1 word left')).toBeVisible();
  await expect(second.getByRole('button', { name: 'finally, no swaps left' })).toBeDisabled();
  await second.getByRole('radio', { name: 'A gull' }).click();
  expect(await tapTargets(second)).toEqual([]);
  await second.getByRole('button', { name: 'Pass it on', exact: true }).click();
  await expect(second.getByRole('heading', { name: 'Passed on' })).toBeVisible();
  const next = await second.locator('[data-link]').getAttribute('data-link');

  // Stop 3 is the last: passing it on unchanged opens the finale.
  const third = await person(browser);
  await third.goto(next!);
  await expect(third.getByRole('img', { name: /When the gull/ }).first()).toBeVisible();
  await third.getByRole('button', { name: 'Add it unchanged as the last' }).click();
  await expect(third.getByRole('heading', { name: 'Look how far it drifted' })).toBeVisible();
  const drift = third.getByRole('list', { name: 'How the words changed' });
  await expect(drift.locator('li')).toHaveCount(3);
  await expect(drift.locator('strong')).toHaveText(['gull']);
  await expect(drift).toContainText('a gull joined');

  // Everyone who took a turn sees the whole tree.
  await third.getByRole('button', { name: 'Back to the tree' }).click();
  await expect(third.getByRole('heading', { name: 'The tree opens' })).toBeVisible();
  await expect(third.locator('.node')).toHaveCount(3);
  await creator.goto('./');
  await creator.getByRole('button', { name: /All your chains/ }).click();
  await expect(creator.getByRole('button', { name: /When the captain finally says Moin/ })).toBeVisible();
  await creator.getByRole('button', { name: /When the captain finally says Moin/ }).click();
  await expect(creator.getByRole('heading', { name: 'The tree opens' })).toBeVisible();
  await expect(creator.locator('.node')).toHaveCount(3);
  await expect(creator.getByRole('button', { name: 'The finale' })).toBeVisible();
  expect(off).toEqual([]);
});

test('a link that was already passed on cannot take a second turn at branches 1', async ({ browser }) => {
  const creator = await person(browser);
  const link = await makeChain(creator, 4);
  const a = await person(browser);
  await a.goto(link);
  await a.getByRole('button', { name: 'Pass it on unchanged' }).click();
  await expect(a.getByRole('heading', { name: 'Passed on' })).toBeVisible();
  const b = await person(browser);
  await b.goto(link);
  await expect(b.getByText(/Someone already passed this one on/)).toBeVisible();
});

test('just send: a postcard opens as a postcard and cannot be changed', async ({ browser }) => {
  const sender = await person(browser);
  await sender.goto('./');
  await sender.getByRole('button', { name: /Just send/ }).click();
  await sender.getByRole('radio', { name: 'The market woman' }).click();
  await sender.getByPlaceholder('Top caption').fill('Herring is');
  await sender.getByPlaceholder('Bottom caption').fill('a vegetable if you say Moin');
  await sender.getByRole('button', { name: 'Next: who can open it' }).click();
  await expect(sender.getByRole('radio', { name: 'Just send' })).toHaveAttribute('aria-checked', 'true');
  await sender.getByPlaceholder('a nickname, or leave it blank').fill('Hein');
  await sender.getByRole('button', { name: 'Lock it and make the link' }).click();
  await expect(sender.getByRole('heading', { name: 'Your postcard is ready' })).toBeVisible();
  const link = await sender.locator('[data-link]').getAttribute('data-link');
  const friend = await person(browser);
  await friend.goto(link!);
  await expect(friend.getByRole('heading', { name: 'Moin from Hein' })).toBeVisible();
  await expect(friend.getByRole('img', { name: /Herring is \/ a vegetable/ })).toBeVisible();
  await expect(friend.getByRole('button', { name: 'Send one back' })).toBeVisible();
  await expect(friend.getByRole('button', { name: /Pass it on/ })).toHaveCount(0);
  // DSA Art. 16: a report carries the exact link — with its key, the only way to see a chain.
  const report = decodeURIComponent((await friend.getByRole('link', { name: 'Report this chain' }).getAttribute('href'))!);
  expect(report.startsWith('mailto:report@example.org?subject=Moin Domi: report a chain&body=')).toBe(true);
  expect(report).toContain(link!);
  expect(report).toContain('I believe in good faith');
  // Save image draws the same layers on a canvas: a real PNG, made on the phone.
  const [download] = await Promise.all([friend.waitForEvent('download'), friend.getByRole('button', { name: 'Save image' }).click()]);
  expect(download.suggestedFilename()).toBe('herring-is-a-vegetable-if-you-say-moin.png');
  const bytes = await (await download.createReadStream()).toArray();
  const png = Buffer.concat(bytes);
  expect(png.subarray(1, 4).toString()).toBe('PNG');
  expect(png.readUInt32BE(16)).toBe(1080);
  expect(png.length).toBeGreaterThan(100_000);
});

test('a broken key and an unknown stop say so', async ({ page }) => {
  await page.goto('./m/abcdEFGH#short');
  await expect(page.getByRole('heading', { name: 'This link doesn’t open' })).toBeVisible();
  await expect(page.getByText('This link is broken. Ask for it again, all of it.')).toBeVisible();
  await page.goto('./m/zzzzzzzz#AAAAAAAAAAAAAAAAAAAAAA');
  await expect(page.getByRole('heading', { name: 'Gone with the tide' })).toBeVisible();
  expect(page.url()).not.toContain('#');
});

test('settings: switches are switches, forgetting asks first', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Settings' }).click();
  const calm = page.getByRole('switch', { name: /Calm motion/ });
  await calm.click();
  await expect(calm).toHaveAttribute('aria-checked', 'true');
  expect(await page.evaluate(() => document.documentElement.hasAttribute('data-calm'))).toBe(true);
  await page.getByRole('button', { name: 'Forget everything on this phone' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep it' }).click();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  expect(await tapTargets(page)).toEqual([]);
});

test('without a relay (the live site today) sending is off and says why', async ({ page }) => {
  await page.goto(NO_RELAY);
  await expect(page.getByText(/Sending isn’t switched on yet/)).toBeVisible();
  await page.getByRole('button', { name: /Start a chain/ }).click();
  await page.getByRole('button', { name: 'Next: how it travels' }).click();
  await expect(page.getByRole('button', { name: 'Lock it and make the first link' })).toBeDisabled();
  await expect(page.getByRole('alert')).toHaveText(/the relay has no home/);
});

test('about and the rules: what is not allowed, how reports work, who to write to', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'About and the rules' }).click();
  await expect(page.getByRole('heading', { name: 'About and the rules' })).toBeVisible();
  await expect(page.getByText(/we delete the whole chain, for everyone/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'report@example.org' })).toHaveAttribute('href', 'mailto:report@example.org');
  expect(await tapTargets(page)).toEqual([]);
  await page.goto(NO_RELAY);
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'About and the rules' }).click();
  await expect(page.getByText(/No contact address yet/)).toBeVisible();
});
