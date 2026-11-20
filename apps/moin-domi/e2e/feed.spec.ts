import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Browser, type Page } from '@playwright/test';
import { NO_RELAY, RELAY } from '../playwright.config';

/** A8: the public feed (`.agents/features/domi-feed.md`). */

async function person(browser: Browser): Promise<Page> {
  return (await browser.newContext({ ...test.info().project.use })).newPage();
}

async function toPublic(page: Page, top: string) {
  await page.goto('./');
  await page.getByRole('button', { name: /Start a chain/ }).click();
  await page.getByRole('radio', { name: 'The market woman' }).click();
  await page.getByPlaceholder('Top caption').fill(top);
  await page.getByPlaceholder('Bottom caption').fill('for everyone');
  await page.getByRole('button', { name: 'Next: how it travels' }).click();
  await page.getByRole('radio', { name: 'Public' }).click();
}

/** The relay's own view, to find a post's id. */
async function idOf(page: Page, top: string): Promise<string> {
  const { posts } = await (await page.request.get(`${RELAY}/v1/posts`)).json() as { posts: { id: string; content: string }[] };
  const found = posts.find((p) => JSON.parse(p.content).top === top);
  expect(found).toBeDefined();
  return found!.id;
}

test('post publicly: said plainly first, then at the top of everyone’s feed, with Share and Report', async ({ browser, page }) => {
  const top = `Herring ${Date.now()}`;
  await toPublic(page, top);
  await expect(page.getByText('It is not encrypted: the relay, and everyone, can read it.')).toBeVisible();
  await expect(page.getByText('Anyone can see this, for 30 days.')).toBeVisible();
  await expect(page.getByRole('radio', { name: /Private link/ })).toHaveCount(0); // no link to choose
  await page.getByPlaceholder('a nickname, or leave it blank').fill('Hein');
  await page.getByRole('button', { name: 'Post it publicly' }).click();
  await expect(page.getByRole('heading', { name: 'The public feed' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Posted. Anyone can see it for 30 days.');
  await expect(page.getByRole('img', { name: new RegExp(top) }).first()).toBeVisible();

  const other = await person(browser);
  await other.goto('./');
  await other.getByRole('button', { name: /The public feed/ }).click();
  const first = other.locator('.post').first();
  await expect(first.getByRole('img', { name: new RegExp(top) })).toBeVisible();
  await expect(first).toContainText('by Hein · today');
  const id = await idOf(other, top);
  const report = await first.getByRole('link', { name: 'Report' }).getAttribute('href');
  expect(decodeURIComponent(report!)).toContain(`/domi/p/${id}`);
  expect(report).toMatch(/^mailto:report@example\.org\?subject=/);
  await other.context().close();
});

test('a shared post link opens that post first, through the 404 page; a hidden or unknown one says it is gone', async ({ browser, page }) => {
  const top = `Link ${Date.now()}`;
  await toPublic(page, top);
  await page.getByRole('button', { name: 'Post it publicly' }).click();
  await expect(page.getByRole('status')).toBeVisible();
  const id = await idOf(page, top);

  const friend = await person(browser);
  await friend.goto(`./p/${id}`);
  await expect(friend.getByRole('heading', { name: 'A public post' })).toBeVisible();
  await expect(friend.locator('section').first().getByRole('img', { name: new RegExp(top) })).toBeVisible();
  expect(friend.url()).not.toContain('?p=');
  await friend.goto('./p/AAAAAAAA');
  await expect(friend.getByText('This post is gone: hidden after a report, or older than 30 days.')).toBeVisible();
  await friend.context().close();
});

test('your own picture cannot be posted, and the button says why', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /Start a chain/ }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'g.gif', mimeType: 'image/gif', buffer: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64') });
  await page.getByPlaceholder('Top caption').fill('Private, really');
  await page.getByLabel('I may share this picture').check();
  await page.getByRole('button', { name: 'Next: how it travels' }).click();
  await page.getByRole('radio', { name: 'Public' }).click();
  await expect(page.getByRole('alert')).toHaveText(/Your own picture stays private/);
  await expect(page.getByRole('button', { name: 'Post it publicly' })).toBeDisabled();
});

test('junk a hostile client posted is skipped; 20 a page, then older ones on request', async ({ page }) => {
  const run = Date.now();
  const valid = (i: number) => JSON.stringify({ v: 1, who: 'kid', where: 'water', top: `Page ${run} ${i}`, bottom: '', bubble: 'none', gull: false, mood: 'grumpy', weather: 'clear', nick: '', budget: 1 });
  for (let i = 0; i < 22; i++) {
    expect((await page.request.post(`${RELAY}/v1/posts`, { data: { content: valid(i) } })).status()).toBe(201);
    if (i === 20) await page.request.post(`${RELAY}/v1/posts`, { data: { content: JSON.stringify({ v: 1, who: '<img src=x onerror=alert(1)>', top: `junk ${run}` }) } });
  }
  let reads = 0;
  page.on('request', (r) => { if (r.method() === 'GET' && r.url().startsWith(`${RELAY}/v1/posts`)) reads++; });
  await page.goto('./');
  await page.getByRole('button', { name: /The public feed/ }).click();
  await expect(page.getByRole('img', { name: new RegExp(`Page ${run} 21`) })).toBeVisible();
  await expect(page.getByText(`junk ${run}`)).toHaveCount(0);
  await expect(page.getByRole('img', { name: new RegExp(`Page ${run} 0\\b`) })).toHaveCount(0);
  await page.getByRole('button', { name: 'Load older posts' }).click();
  await expect(page.getByRole('img', { name: new RegExp(`Page ${run} 0\\b`) })).toBeVisible();
  await page.waitForTimeout(500);
  expect(reads).toBe(2); // one page, then the older one: never a reload loop
});

test('without a relay the feed says it isn’t switched on', async ({ page }) => {
  await page.goto(NO_RELAY);
  await page.getByRole('button', { name: /The public feed/ }).click();
  await expect(page.getByText('The feed isn’t switched on yet: the relay has no home.')).toBeVisible();
});

test('the feed and the public kind pass axe; every target is at least 44 px', async ({ page }) => {
  const audit = async (where: string) => {
    await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const small = await page.$$eval('button, a, [role="radio"]', (els) => els.filter((e) => (e as HTMLElement).offsetParent !== null)
      .map((e) => ({ t: (e.textContent ?? '').trim().slice(0, 20), r: e.getBoundingClientRect() })).filter(({ r }) => r.height < 44 || r.width < 44).map(({ t }) => t));
    return [...r.violations.map((v) => `${where}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`), ...small.map((t) => `${where}: small ${t}`)];
  };
  const found: string[] = [];
  await toPublic(page, `Axe ${Date.now()}`);
  found.push(...await audit('rules-public'));
  await page.getByRole('button', { name: 'Post it publicly' }).click();
  await expect(page.getByRole('status')).toBeVisible();
  found.push(...await audit('feed'));
  await page.getByRole('button', { name: 'Home' }).click();
  found.push(...await audit('home'));
  expect(found).toEqual([]);
});
