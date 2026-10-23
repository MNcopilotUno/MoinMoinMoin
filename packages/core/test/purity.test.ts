import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../../', import.meta.url));

/** CLAUDE.md §7: the purity lint must exist and must bite. */
describe('core purity lint', () => {
  const eslint = new ESLint({ cwd: root });
  const lint = async (code: string) =>
    (await eslint.lintText(code, { filePath: `${root}packages/core/src/probe.ts` }))[0]?.messages.map((m) => m.ruleId) ?? [];

  it.each([
    ['clock', 'export const t = Date.now();', 'no-restricted-globals'],
    ['randomness', 'export const r = Math.random();', 'no-restricted-properties'],
    ['transcendental maths', 'export const s = Math.sin(1);', 'no-restricted-properties'],
    ['I/O', 'export const d = document.title;', 'no-restricted-globals'],
    ['an import from outside core', "import { x } from '@moin/levels';\nexport const y = x;", 'no-restricted-imports'],
  ])('rejects %s', async (_, code, rule) => {
    expect(await lint(code)).toContain(rule);
  });

  it('accepts integer arithmetic and local imports', async () => {
    expect(await lint("import { CELL } from './constants.js';\nexport const c = Math.min(CELL, 3) % 2;")).toEqual([]);
  });

  it('the real core source is clean', async () => {
    const results = await eslint.lintFiles([`${root}packages/core/src/**/*.ts`]);
    expect(results.flatMap((r) => r.messages)).toEqual([]);
  });
});
