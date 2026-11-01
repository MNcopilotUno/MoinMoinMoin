import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

// Vitest transpiles TypeScript; Node in production only strips types. A parameter property or an
// enum passes every other test and still crashes `pnpm start` (.agents/lessons/technical.md).
describe('runs under Node type stripping, as deployed', () => {
  it('loads every module without a build', () => {
    const out = execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning', '--input-type=module', '-e',
      "await import('./src/store.ts'); await import('./src/app.ts'); console.log('loaded')"], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
    expect(out.trim()).toBe('loaded');
  });
  it('the operator command explains itself', () => {
    let status = 0;
    try {
      execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning', 'src/cli.ts'], { cwd: new URL('..', import.meta.url), stdio: 'pipe' });
    } catch (error) {
      status = (error as { status: number }).status;
    }
    expect(status).toBe(2);
  });
});
