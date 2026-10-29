import { expect, test } from '@playwright/test';

// .agents/features/levels-progression.md — a best from an old, smaller board is not shown as
// stars on its new, bigger board.
test('a saved best from an older revision of a level is dropped', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => new Promise<void>((resolve) => {
    const open = indexedDB.open('moin', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('kv');
    open.onsuccess = () => {
      const tx = open.result.transaction('kv', 'readwrite');
      // Old format (no revision): harbour-01 is unchanged, market-02 was regenerated.
      tx.objectStore('kv').put({ 'harbour-01': { bestTaps: 1 }, 'market-02': { bestTaps: 1 } }, 'levels');
      tx.oncomplete = () => resolve();
    };
  }));
  await page.reload();
  await page.getByRole('button', { name: 'Levels' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: /^Level 1, First Moin, 3 of 3 stars/ })).toBeVisible();
  await expect(dialog.getByTestId('star-total')).toContainText('3 of 120');
});
