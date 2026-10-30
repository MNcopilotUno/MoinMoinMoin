import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';
import { expect, test } from '@playwright/test';
import { lock, passOn, read, start } from '../../../packages/domi-link/src/index';
import type { Moin } from '../../../packages/domi-link/src/index';

// DOMI_ROADMAP D0 gate: a locked ten-hop Moin made in this engine opens elsewhere, and the other
// way round; stays under 2 000 characters; every fixture fails here as in Node. Runs in Chromium
// locally and in Chromium, Firefox and WebKit in CI (DEFLATE bytes may differ between engines —
// interoperability, not equality, is the contract: docs/DOMI_FORMAT.md §3).
const lib = buildSync({
  entryPoints: [fileURLToPath(new URL('../../../packages/domi-link/src/index.ts', import.meta.url))],
  bundle: true, format: 'iife', globalName: 'MoinLink', write: false, target: 'es2020',
}).outputFiles[0]!.text;

type Lib = typeof import('../../../packages/domi-link/src/index');
test.use({ bypassCSP: true }); // the library is injected inline; the app itself keeps its CSP

function tenHops(): Moin {
  let m = start({ wave: 'light', words: 'Ein Moin vom Leuchtturm, für alle die heute früh auf waren. Moin moin!', from: 'Wiebke-Johanna Petersen', day: '2026-10-30', fade: 'month', passOn: true, reach: true });
  for (let i = 1; i < 10; i++) {
    const r = passOn(m, i % 3 ? `Holder ${i} Hansen-Jensen` : '');
    if (!r.ok) throw new Error(r.message);
    m = r.moin;
  }
  return m;
}

test.beforeEach(async ({ page }) => {
  await page.goto('./'); // http://127.0.0.1 is a secure context: WebCrypto is available
  await page.addScriptTag({ content: lib });
});

test('a locked ten-hop Moin made in this engine opens in Node, under 2 000 characters', async ({ page }) => {
  const moin = tenHops();
  const link = await page.evaluate(async (m) => {
    const L = (window as unknown as { MoinLink: Lib }).MoinLink;
    return L.lock(m, 'drei wörter reichen', (n) => crypto.getRandomValues(new Uint8Array(n)));
  }, moin);
  expect(link.length).toBeLessThan(2000);
  expect(await read(link, 'drei wörter reichen')).toEqual({ ok: true, locked: true, moin });
});

test('a locked Moin made in Node opens in this engine, and passes on', async ({ page }) => {
  const moin = tenHops();
  let k = 3;
  const link = await lock(moin, 'kutter am kai', (n) => Uint8Array.from({ length: n }, () => k++ & 0xff));
  const result = await page.evaluate(async (l) => {
    const L = (window as unknown as { MoinLink: Lib }).MoinLink;
    const r = await L.read(l, 'kutter am kai');
    if (!r.ok) return { r, next: null };
    const p = L.passOn(r.moin, 'Okke');
    return { r, next: p.ok ? await L.encode(p.moin) : null };
  }, link);
  expect(result.r).toEqual({ ok: true, locked: true, moin });
  expect(await read(result.next!)).toMatchObject({ ok: true, moin: { held: 11, holders: [...moin.holders, 'Okke'] } });
});

test('every negative fixture fails in this engine with the same code', async ({ page }) => {
  const dir = new URL('../../../packages/domi-link/fixtures/', import.meta.url);
  const fixtures = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(new URL(f, dir), 'utf8')) as { link: string; password?: string; code: string });
  const codes = await page.evaluate(async (fs) => {
    const L = (window as unknown as { MoinLink: Lib }).MoinLink;
    return Promise.all(fs.map(async (f) => { const r = await L.read(f.link, f.password); return r.ok ? 'ok' : r.code; }));
  }, fixtures);
  expect(codes).toEqual(fixtures.map((f) => f.code));
});
