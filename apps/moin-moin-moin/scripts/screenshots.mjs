// The install sheet's screenshots (store-presence.md), taken from the BUILT app (`pnpm build`
// first; never the dev server, CLAUDE.md §8). Writes packages/assets/icons/screenshots/*.jpg.
// Run: `pnpm --filter @moin/moin-moin-moin screenshots`.
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { startServer } from '../e2e/static-server.mjs';

const out = fileURLToPath(new URL('../../../packages/assets/icons/screenshots/', import.meta.url));
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const base = process.env.BASE_PATH ?? '/';
mkdirSync(out, { recursive: true });

const server = await startServer({ dir: dist, base, port: 4190 });
const browser = await chromium.launch();
try {
  for (const [name, width, height, scale] of [['narrow', 390, 844, 2], ['wide', 1440, 900, 1]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale, reducedMotion: 'reduce' });
    await page.goto(server.url);
    // A harbour level part-way through: some faces smiling, some still grumpy.
    await page.getByRole('button', { name: 'Levels' }).click();
    await page.getByRole('dialog').getByRole('button', { name: /^Level 10, / }).first().click();
    // Three greedy taps (par is 4, so the level stays unsolved): each round keeps the tap that
    // wakes the most people, so the picture is mostly smiles with a few grumps left.
    const person = page.locator('button[data-x]');
    const smiling = () => page.locator('button[data-x].smiling').count();
    for (let round = 0; round < 3; round++) {
      let best = -1, most = -1;
      for (let i = 0; i < (await person.count()); i++) {
        if (await person.nth(i).evaluate((b) => b.classList.contains('smiling'))) continue;
        await person.nth(i).click();
        await page.waitForTimeout(150);
        const n = await smiling();
        if (n > most) { most = n; best = i; }
        await page.getByRole('button', { name: 'Undo' }).click();
      }
      await person.nth(best).click();
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}${name}.jpg`, type: 'jpeg', quality: 80 });
    await page.close();
    console.log(`wrote screenshots/${name}.jpg`);
  }
} finally {
  await browser.close();
  await server.close();
}
