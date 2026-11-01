import { expect, test, type Page } from '@playwright/test';

// docs/MOIN_DOMI.md §6 Offline: the app opens offline once loaded; making and passing on work
// offline and say "will send when online", never a spinner; then they go out by themselves.

async function loadOnce(page: Page) {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Moin Domi');
}

async function makeMeme(page: Page, top: string) {
  await page.getByRole('button', { name: /Start a chain/ }).click();
  await page.getByPlaceholder('Top caption').fill(top);
  await page.getByRole('button', { name: 'Next: how it travels' }).click();
}

test('opens with no network once loaded, and a chain made offline goes out when the network is back', async ({ page, context }) => {
  await loadOnce(page);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Moin Domi');
  await makeMeme(page, 'Made on the ferry');
  await expect(page.getByText('You’re offline. It will be locked and sent when you’re back.')).toBeVisible();
  await page.getByRole('button', { name: 'Send it when I’m back online' }).click();
  await expect(page.getByRole('heading', { name: 'Waiting for the tide' })).toBeVisible();
  await page.getByRole('button', { name: 'Home' }).click();
  await expect(page.getByRole('heading', { name: 'Waiting to send' })).toBeVisible();
  await expect(page.getByText('Goes out when you’re back online')).toBeVisible();
  await context.setOffline(false);
  // On the `online` event, or at the latest the outbox's next 5-second look (Firefox may not send
  // the event to a page loaded offline), plus a retry if the relay is not reachable yet.
  await expect(page.getByRole('status')).toHaveText(/Your Moin went out/, { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'Waiting to send' })).toHaveCount(0);
  await page.getByRole('button', { name: /All your chains/ }).click();
  await expect(page.getByRole('button', { name: /Made on the ferry/ })).toBeVisible();
});

test('a turn taken offline is kept and passed on later; the tree opens offline as last seen', async ({ browser, page }) => {
  // Someone starts a chain online and sends the link.
  await loadOnce(page);
  await makeMeme(page, 'When the captain');
  await page.getByRole('button', { name: 'Lock it and make the first link' }).click();
  const link = await page.locator('[data-link]').getAttribute('data-link');

  const context = await browser.newContext({ ...test.info().project.use });
  const friend = await context.newPage();
  await friend.goto(link!);
  await expect(friend.getByRole('heading', { name: 'Your turn' })).toBeVisible();
  await context.setOffline(true);
  await friend.getByRole('button', { name: 'captain', exact: true }).click();
  await friend.getByRole('button', { name: 'gull', exact: true }).click();
  await friend.getByRole('button', { name: 'Pass it on when I’m back online' }).click();
  await expect(friend.getByRole('heading', { name: 'Waiting for the tide' })).toBeVisible();
  await context.setOffline(false);
  await expect(friend.getByRole('heading', { name: 'Passed on' })).toBeVisible();

  // The tree, seen once online, still opens offline — marked as such.
  await friend.getByRole('button', { name: 'See the tree' }).click();
  await expect(friend.locator('.node')).toHaveCount(2);
  await friend.getByRole('button', { name: 'Back' }).click();
  await context.setOffline(true);
  await friend.getByRole('button', { name: /All your chains/ }).click();
  await friend.getByRole('button', { name: /When the gull/ }).click();
  await expect(friend.getByRole('status')).toHaveText(/Offline: this is the tree as you saw it/);
  await expect(friend.locator('.node')).toHaveCount(2);
  await expect(friend.getByRole('button', { name: 'Your link, to send it on' })).toBeVisible();
  await context.close();
});

test('a link opened offline keeps its key in the address bar to try again', async ({ page, context }) => {
  await loadOnce(page);
  await context.setOffline(true);
  await page.goto('./m/abcdEFGH#AAAAAAAAAAAAAAAAAAAAAA');
  await expect(page.getByRole('heading', { name: 'Offline' })).toBeVisible();
  expect(page.url()).toMatch(/#AAAAAAAAAAAAAAAAAAAAAA$/);
});

test('online but the relay unreachable: kept, then sent by itself on a retry', async ({ page }) => {
  await page.goto('./');
  // The first answer from the relay never arrives: the phone thinks it is online, the send fails.
  let refused = 0;
  await page.route('**/v1/chains', (route) => (refused++ === 0 ? route.abort('internetdisconnected') : route.continue()));
  await makeMeme(page, 'Behind a café portal');
  await page.getByRole('button', { name: 'Lock it and make the first link' }).click();
  await expect(page.getByRole('heading', { name: 'Waiting for the tide' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your chain is ready' })).toBeVisible({ timeout: 10_000 });
  expect(refused).toBe(2);
});

test('the outbox goes out even if the online event never comes', async ({ page, context }) => {
  await loadOnce(page);
  // Swallow every online event, as Firefox did in CI for a page loaded offline.
  await page.addInitScript(() => window.addEventListener('online', (e) => e.stopImmediatePropagation(), { capture: true }));
  await context.setOffline(true);
  await page.reload();
  await makeMeme(page, 'No event came');
  await page.getByRole('button', { name: 'Send it when I’m back online' }).click();
  await page.getByRole('button', { name: 'Home' }).click();
  await context.setOffline(false);
  await expect(page.getByRole('status')).toHaveText(/Your Moin went out/, { timeout: 15_000 });
});
