import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createGame, solve } from '@moin/core';
import { levels, toBoard } from '@moin/levels';
import type { Level } from '@moin/levels';

export const person = (page: Page, x: number, y: number) => page.locator(`button[data-x="${x}"][data-y="${y}"]`);

export async function freshStart(page: Page) {
  await page.goto('./');
  await expect(page.locator('h1')).toHaveText(levels[0]!.title);
}

/** Taps the solver's par solution for the level currently on screen (story index or a level). */
export async function solveCurrent(page: Page, which: number | Level) {
  const level = typeof which === 'number' ? levels[which]! : which;
  const solution = solve(createGame(toBoard(level)));
  if (!solution) throw new Error('unsolvable');
  for (const step of solution.solution) {
    for (let k = 0; k < step.taps; k++) await person(page, step.x, step.y).click();
  }
  await expect(page.getByRole('heading', { name: 'Everyone is smiling!' })).toBeVisible();
  return solution.par;
}

export async function openLevel(page: Page, title: string) {
  await page.getByRole('button', { name: 'Levels' }).click();
  await page.getByRole('dialog').getByRole('button', { name: new RegExp(`, ${title}[,]`) }).click();
  await expect(page.locator('h1')).toHaveText(title);
}

export function today() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}
