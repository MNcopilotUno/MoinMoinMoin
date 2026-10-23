// Render the PNG app icons from the SVG sources once; the PNGs are committed (they are tiny).
// Uses the machine's Chromium: PLAYWRIGHT_CHROMIUM or /opt/pw-browsers.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const dir = fileURLToPath(new URL('../icons/', import.meta.url));
const jobs: [string, string, number][] = [
  ['icon.svg', 'icon-192.png', 192],
  ['icon.svg', 'icon-512.png', 512],
  ['icon.svg', 'apple-touch-icon.png', 180],
  ['maskable.svg', 'maskable-512.png', 512],
];
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {});
try {
  for (const [src, out, size] of jobs) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    const svg = readFileSync(dir + src, 'utf8').replace('<svg ', `<svg width="${size}" height="${size}" `);
    await page.setContent(`<style>html,body{margin:0;background:transparent}</style>${svg}`);
    await page.screenshot({ path: dir + out, omitBackground: true });
    await page.close();
    console.log(`wrote ${out}`);
  }
} finally {
  await browser.close();
}
