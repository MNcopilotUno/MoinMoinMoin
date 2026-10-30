import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { read } from '../src/index.js';

// FORMAT §4 and DOMI_ROADMAP D0: every negative fixture fails with a message naming the problem.
const dir = new URL('../fixtures/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();

interface Fixture { readonly link: string; readonly password?: string; readonly code: string; readonly message: string }

describe('negative fixtures', () => {
  it('there are exactly the seven the roadmap names', () => {
    expect(files).toEqual([
      'hops-mismatch.json', 'malformed-base64.json', 'tampered-ciphertext.json', 'too-long.json',
      'too-many-words.json', 'unknown-version.json', 'wrong-password.json',
    ]);
  });

  it.each(files)('%s fails with its message', async (file) => {
    const f = JSON.parse(readFileSync(new URL(file, dir), 'utf8')) as Fixture;
    const r = await read(f.link, f.password);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.code).toBe(f.code);
    expect(r.message.toLowerCase()).toContain(f.message.toLowerCase());
  });
});
