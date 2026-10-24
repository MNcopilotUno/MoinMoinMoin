// Render the paintings to the committed images in ../art (JPEG, 2× phone size).
// Uses the machine's Chromium (PLAYWRIGHT_BROWSERS_PATH or PLAYWRIGHT_CHROMIUM).
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { harbour, plank, SCENES, water } from './paint.mjs';

const art = fileURLToPath(new URL('../art/', import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'moin-art-'));
const jobs = [
  ...Object.entries(SCENES).map(([name, o]) => [name, harbour({ w: 390, h: 844, horizon: 0.33, ...o }), 390, 844]),
  ['water', water(), 340, 230],
];
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {});
try {
  for (const [name, svg, w, h] of jobs) {
    const file = join(tmp, `${name}.svg`);
    writeFileSync(file, svg);
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await page.goto(`file://${file}`);
    await page.screenshot({ path: join(art, `${name}.jpg`), type: 'jpeg', quality: 78 });
    await page.close();
    console.log(`wrote art/${name}.jpg`);
  }
  writeFileSync(join(art, 'plank.svg'), plank());
  console.log('wrote art/plank.svg');
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
