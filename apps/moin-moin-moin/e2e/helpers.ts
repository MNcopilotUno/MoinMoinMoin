import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createGame, solve } from '@moin/core';
import { levels, toBoard } from '@moin/levels';

export const person = (page: Page, x: number, y: number) => page.locator(`button[data-x="${x}"][data-y="${y}"]`);

export async function freshStart(page: Page) {
  await page.goto('./');
  await expect(page.locator('h1')).toHaveText(levels[0]!.title);
}

/** Taps the solver's par solution for the level currently on screen. */
export async function solveCurrent(page: Page, index: number) {
  const solution = solve(createGame(toBoard(levels[index]!)));
  if (!solution) throw new Error('unsolvable');
  for (const step of solution.solution) {
    for (let k = 0; k < step.taps; k++) await person(page, step.x, step.y).click();
  }
  await expect(page.getByRole('heading', { name: 'Everyone is smiling!' })).toBeVisible();
  return solution.par;
}
