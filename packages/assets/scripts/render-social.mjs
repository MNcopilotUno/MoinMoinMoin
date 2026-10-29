// The social card (store-presence.md): the wide harbour painting with the key-art title panel,
// 1200 × 630, written to the app's public folder (`icons/og.jpg`). Uses the self-hosted fonts.
// Re-run with `pnpm --filter @moin/assets social` after the art or the title changes.
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const font = (pkg, file) => `file://${here(`../node_modules/@fontsource/${pkg}/files/${file}`)}`;
const painting = `file://${here('../art/harbour-wide.jpg')}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Cormorant Garamond'; font-weight: 700; src: url(${font('cormorant-garamond', 'cormorant-garamond-latin-700-normal.woff2')}); }
@font-face { font-family: 'Cormorant Garamond'; font-weight: 500; font-style: italic; src: url(${font('cormorant-garamond', 'cormorant-garamond-latin-500-italic.woff2')}); }
@font-face { font-family: 'Cormorant Garamond'; font-weight: 700; font-style: italic; src: url(${font('cormorant-garamond', 'cormorant-garamond-latin-700-italic.woff2')}); }
@font-face { font-family: Figtree; font-weight: 800; src: url(${font('figtree', 'figtree-latin-800-normal.woff2')}); }
@font-face { font-family: Figtree; font-weight: 600; src: url(${font('figtree', 'figtree-latin-600-normal.woff2')}); }
html, body { margin: 0; }
.card { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #b7b8dd url(${painting}) center 42% / cover; color: #1e2b4c; }
.panel { position: absolute; left: 40px; bottom: 40px; width: 640px; box-sizing: border-box; padding: 26px 34px 28px; border-radius: 30px;
  background: rgba(251, 246, 234, 0.92); box-shadow: 0 22px 54px rgba(30, 43, 76, 0.28); }
.kicker { margin: 0; font: 800 14px/1 Figtree, sans-serif; letter-spacing: 0.16em; text-transform: uppercase; color: #3a4866; }
h1 { margin: 10px 0 0; white-space: nowrap; font: 700 80px/0.95 'Cormorant Garamond', serif; letter-spacing: -0.01em; }
.tag { margin: 12px 0 0; font: italic 500 25px/1.25 'Cormorant Garamond', serif; color: #2e3a55; }
.small { margin: 14px 0 0; font: 600 16px/1.3 Figtree, sans-serif; color: #3a4866; }
.moin { position: absolute; left: 862px; top: 236px; padding: 8px 22px 11px; border-radius: 26px 26px 26px 6px;
  background: #c8102e; color: #fbf6ea; font: italic 700 40px/1 'Cormorant Garamond', serif; box-shadow: 0 14px 30px rgba(120, 10, 30, 0.35); }
</style></head><body><div class="card">
<span class="moin">Moin!</span>
<div class="panel">
  <p class="kicker">A puzzle from the North German coast</p>
  <h1>Moin Moin Moin</h1>
  <p class="tag">The harbour woke up grumpy. Pass one Moin along the quay until everyone is smiling.</p>
  <p class="small">Free · works offline · no accounts, no ads</p>
</div></div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'moin-social-'));
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {});
try {
  const file = join(dir, 'card.html');
  writeFileSync(file, html);
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(`file://${file}`);
  await page.evaluate(() => globalThis.document.fonts.ready);
  await page.screenshot({ path: here('../icons/og.jpg'), type: 'jpeg', quality: 84 });
  console.log('wrote icons/og.jpg');
} finally {
  await browser.close();
  rmSync(dir, { recursive: true, force: true });
}
