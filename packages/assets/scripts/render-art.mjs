// Render the paintings to the committed images in ../art (JPEG, 2× phone size), with the
// painter in paint.browser.js. Uses the machine's Chromium (PLAYWRIGHT_BROWSERS_PATH or
// PLAYWRIGHT_CHROMIUM). Re-renders match closely but not byte for byte across Chromium builds:
// the committed images are the source of truth (.agents/lessons/technical.md).
import { Buffer } from 'node:buffer';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const art = fileURLToPath(new URL('../art/', import.meta.url));
const painter = fileURLToPath(new URL('./paint.browser.js', import.meta.url));
const PHONE = { w: 390, h: 844, scale: 2 };
const brush = { radii: [14, 7, 3.5, 2], threshold: 26, len: 6, waterLen: 5, stop: 60, broken: 0.14, jitter: 18, opacity: 0.88, skyAngle: -0.12 };
const harbour = { s: 1, horizon: 0.3, sunX: 0.74, sunY: 0.1, rowEnd: 0.55, rowScale: 1, cutterX: 0.74, cutterY: 52, cutterS: 0.95 };
const jobs = {
  harbour: { scene: 'harbour', ...PHONE, seed: 11, o: { ...harbour, gulls: 6 }, paint: { ...brush, waterY: 0.33 } },
  market: { scene: 'market', ...PHONE, seed: 23, o: { s: 1, horizon: 0.3, sunX: 0.8, sunY: 0.09, gulls: 5 }, paint: { ...brush, waterY: 0.33 } },
  ferry: { scene: 'ferry', ...PHONE, seed: 37, o: { s: 1, horizon: 0.3, sunX: 0.82, sunY: 0.1, gulls: 5 }, paint: { ...brush, waterY: 0.34 } },
  lighthouse: { scene: 'lighthouse', ...PHONE, seed: 43, o: { s: 1, horizon: 0.3, sunX: 0.22, sunY: 0.1, gulls: 5, towerX: 0.68, towerBase: 22, cottage: 84, moleNear: 78, sailX: 0.9, sailY: 64 }, paint: { ...brush, waterY: 0.33 } },
  water: { scene: 'water', w: 340, h: 230, scale: 2, seed: 5, o: {}, paint: { ...brush, radii: [10, 5, 2.5], waterY: 0 } },
};
// Wide windows (desktop, tablet landscape): the same parts of town composed for 1600 × 1000.
// Not precached (screens.md): the service worker caches them on first use.
const WIDE = { w: 1600, h: 1000, scale: 1 };
const wideBrush = { ...brush, radii: [16, 8, 4, 2.2] };
jobs['harbour-wide'] = { scene: 'harbour', ...WIDE, seed: 7, o: { s: 2.1, horizon: 0.46, sunX: 0.74, sunY: 0.16, rowEnd: 0.42, rowScale: 1.05, cutterX: 0.74, cutterY: 70, cutterS: 1.15, gulls: 9 }, paint: { ...wideBrush, waterY: 0.5 } };
jobs['market-wide'] = { scene: 'market', ...WIDE, seed: 23, o: { s: 2.1, horizon: 0.46, sunX: 0.8, sunY: 0.15, gulls: 8 }, paint: { ...wideBrush, waterY: 0.5 } };
jobs['ferry-wide'] = { scene: 'ferry', ...WIDE, seed: 37, o: { s: 2.1, horizon: 0.46, sunX: 0.82, sunY: 0.15, gulls: 8 }, paint: { ...wideBrush, waterY: 0.5 } };
jobs['lighthouse-wide'] = { scene: 'lighthouse', ...WIDE, seed: 43, o: { s: 2.1, horizon: 0.46, sunX: 0.2, sunY: 0.15, gulls: 8, towerX: 0.76, towerBase: 22, cottage: 84, moleNear: 70, sailX: 0.93, sailY: 60 }, paint: { ...wideBrush, waterY: 0.5 } };
for (const name of ['harbour', 'market', 'ferry', 'lighthouse', 'water', 'harbour-wide', 'market-wide', 'ferry-wide', 'lighthouse-wide']) {
  jobs[name.replace(/(-wide)?$/, '-night$1')] = { ...jobs[name], night: true, o: { ...jobs[name].o, gulls: 2 } };
}

const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {});
try {
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ path: painter });
  for (const name of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(jobs)) {
    const { painted } = await page.evaluate((spec) => globalThis.render(spec), jobs[name]);
    writeFileSync(`${art}${name}.jpg`, Buffer.from(painted.split(',')[1], 'base64'));
    console.log(`wrote art/${name}.jpg`);
  }
} finally {
  await browser.close();
}
