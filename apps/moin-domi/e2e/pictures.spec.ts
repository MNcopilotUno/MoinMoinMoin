import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Browser, type Page } from '@playwright/test';
import { RELAY } from '../playwright.config';

/** A8: your own photo or GIF in a private chain (`.agents/features/domi-uploads.md`). */

async function person(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ ...test.info().project.use });
  return context.newPage();
}

const MARKER = 'GPS-52.5200N-13.4050E-SECRET';

/** A real JPEG from the browser, with an EXIF block carrying `MARKER` spliced in after SOI. */
async function photoWithExif(page: Page): Promise<Buffer> {
  const bytes = await page.evaluate(async (marker) => {
    const c = document.createElement('canvas');
    c.width = 1600;
    c.height = 1200;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#3a6ea5';
    ctx.fillRect(0, 0, 1600, 1200);
    ctx.fillStyle = '#f2c46b';
    ctx.fillRect(400, 300, 800, 600);
    const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), 'image/jpeg', 0.9));
    const jpeg = new Uint8Array(await blob.arrayBuffer());
    const payload = new TextEncoder().encode(`Exif\0\0${marker}`);
    const app1 = new Uint8Array([0xff, 0xe1, (payload.length + 2) >> 8, (payload.length + 2) & 255, ...payload]);
    return [...jpeg.subarray(0, 2), ...app1, ...jpeg.subarray(2)];
  }, MARKER);
  return Buffer.from(bytes);
}

/** The classic 1×1 GIF89a. */
const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');

async function startWithPicture(page: Page, file: { name: string; mimeType: string; buffer: Buffer }): Promise<void> {
  await page.goto('./');
  await page.getByRole('button', { name: /Start a chain/ }).click();
  await page.locator('input[type=file]').setInputFiles(file);
  await expect(page.locator('.preview .bg.own')).toHaveAttribute('src', /^blob:/);
  await expect(page.getByRole('radio', { name: 'Nobody' })).toBeChecked();
}

/**
 * The picture this page shows, as decoded on screen, and the bytes it keeps for it (IndexedDB):
 * the CSP rightly keeps even a test's `fetch` off `blob:` URLs.
 */
async function shownBytes(page: Page): Promise<{ head: number[]; w: number; h: number }> {
  const { w, h } = await page.locator('.meme .bg.own').first().evaluate(async (img: HTMLImageElement) => {
    await img.decode();
    return { w: img.naturalWidth, h: img.naturalHeight };
  });
  const head = await page.evaluate(() => new Promise<number[]>((resolve, reject) => {
    const req = indexedDB.open('moin-domi');
    req.onsuccess = () => {
      const all = req.result.transaction('pictures').objectStore('pictures').getAll();
      all.onsuccess = () => (all.result.length === 1 ? resolve([...new Uint8Array(all.result[0].bytes)]) : reject(new Error(`${all.result.length} pictures`)));
    };
  }));
  return { head, w, h };
}

test('a photo: shrunk, EXIF gone, asks for consent, sealed on the relay, shown to the next stop', async ({ browser, page }) => {
  const sent: Buffer[] = [];
  page.on('request', (r) => { if (r.url().startsWith(`${RELAY}/v1/media/`) && r.method() === 'POST') sent.push(r.postDataBuffer() ?? Buffer.alloc(0)); });
  await page.goto('./');
  await startWithPicture(page, { name: 'harbour.jpg', mimeType: 'image/jpeg', buffer: await photoWithExif(page) });
  await page.getByPlaceholder('Top caption').fill('Moin from');
  await page.getByPlaceholder('Bottom caption').fill('my own harbour');
  const next = page.getByRole('button', { name: 'Tick “I may share this picture” first' });
  await expect(next).toBeDisabled();
  await page.getByLabel('I may share this picture').check();
  await page.getByRole('button', { name: 'Next: how it travels' }).click();
  await page.getByRole('button', { name: 'Lock it and make the first link' }).click();
  await expect(page.getByRole('heading', { name: 'Your chain is ready' })).toBeVisible();
  const link = await page.locator('[data-link]').getAttribute('data-link');

  // What went to the relay is one sealed box: no JPEG marker, no EXIF, not the picture.
  expect(sent).toHaveLength(1);
  expect(sent[0]![0]).toBe(0x01);
  expect(sent[0]!.includes(Buffer.from(MARKER))).toBe(false);
  expect(sent[0]!.includes(Buffer.from([0xff, 0xd8, 0xff]))).toBe(false);

  const second = await person(browser);
  await second.goto(link!);
  await expect(second.getByRole('heading', { name: 'Your turn' })).toBeVisible();
  await expect(second.getByRole('img', { name: /over their own picture/ }).first()).toBeVisible();
  const shown = await shownBytes(second);
  expect(shown.head.slice(0, 2)).toEqual([0xff, 0xd8]); // a JPEG
  expect(Buffer.from(shown.head).includes(Buffer.from(MARKER))).toBe(false); // without its EXIF
  expect([shown.w, shown.h]).toEqual([1080, 810]); // 1600×1200 shrunk to 1080 on the long side
  // Nobody in front: no smile to toggle.
  await expect(second.getByRole('radio', { name: /A smile|A frown/ })).toHaveCount(0);
  await second.context().close();
});

test('a GIF travels as it is in a postcard; one over 2 MB is refused with the reason', async ({ browser, page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /Just send/ }).click();
  const big = Buffer.concat([GIF.subarray(0, 13), Buffer.alloc(2.1 * 1024 * 1024)]);
  await page.locator('input[type=file]').setInputFiles({ name: 'long.gif', mimeType: 'image/gif', buffer: big });
  await expect(page.getByRole('alert')).toHaveText(/over 2 MB/);
  await expect(page.locator('.preview .bg.own')).toHaveCount(0);

  await page.locator('input[type=file]').setInputFiles({ name: 'tiny.gif', mimeType: 'image/gif', buffer: GIF });
  await expect(page.locator('.preview .bg.own')).toHaveAttribute('src', /^blob:/);
  await page.getByPlaceholder('Top caption').fill('Tiny gif');
  await page.getByLabel('I may share this picture').check();
  await page.getByRole('button', { name: 'Next: who can open it' }).click();
  await page.getByRole('button', { name: 'Lock it and make the link' }).click();
  await expect(page.getByRole('heading', { name: 'Your postcard is ready' })).toBeVisible();
  const link = await page.locator('[data-link]').getAttribute('data-link');

  const friend = await person(browser);
  await friend.goto(link!);
  const shown = await shownBytes(friend);
  expect(Buffer.from(shown.head).equals(GIF)).toBe(true); // byte for byte
  await friend.context().close();
});

test('not a picture: said plainly, and the painting stays', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: /Start a chain/ }).click();
  await page.locator('input[type=file]').setInputFiles({ name: 'notes.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not a jpeg at all') });
  await expect(page.getByRole('alert')).toHaveText(/isn’t a photo or a GIF/);
  await expect(page.locator('.preview .bg')).not.toHaveClass(/own/);
});

test('the picture controls pass axe, and every target is at least 44 px', async ({ page }) => {
  await page.goto('./');
  await startWithPicture(page, { name: 'tiny.gif', mimeType: 'image/gif', buffer: GIF });
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  const small = await page.$$eval('.own label, .own button', (els) => els.map((e) => e.getBoundingClientRect()).filter((r) => r.height < 44 || r.width < 44).length);
  expect(small).toBe(0);
});
