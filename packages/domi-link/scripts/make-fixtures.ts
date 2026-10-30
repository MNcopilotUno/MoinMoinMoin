// Writes the negative fixtures (docs/DOMI_FORMAT.md §4; DOMI_ROADMAP D0): one per failure, each
// with the error code and a piece of the message that names the problem. Deterministic.
import { writeFileSync } from 'node:fs';
import { encode, lock, toBase64url } from '../src/index.js';
import type { Moin } from '../src/index.js';

const anna: Moin = { wave: 'quay', words: 'Saw your boat this morning. Moin!', holders: ['Anna'], held: 1, day: '2026-10-30', fade: 'week', passOn: true, reach: true };
let k = 7;
const random = (n: number) => Uint8Array.from({ length: n }, () => k++ & 0xff);

/** Pack a hand-written payload the library itself would refuse to write. */
async function raw(payload: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const out = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  return `#m1.${toBase64url(new Uint8Array(await new Response(out).arrayBuffer()))}`;
}

const wire = { v: 1, w: 'quay', h: ['Anna'], n: 1, d: '2026-10-30', x: 'week', p: 1, r: 1 };
const locked = await lock(anna, 'kutter am kai', random);
const [head, salt, iv, data] = locked.split('.') as [string, string, string, string];
const flipped = (data[5] === 'A' ? 'B' : 'A');

const fixtures: Record<string, { link: string; password?: string; code: string; message: string; why: string }> = {
  'unknown-version': { link: (await encode(anna)).replace('#m1.', '#m2.'), code: 'unsupported-version', message: 'version 2', why: 'a major version this reader does not know' },
  'tampered-ciphertext': { link: `${head}.${salt}.${iv}.${data.slice(0, 5)}${flipped}${data.slice(6)}`, password: 'kutter am kai', code: 'wrong-password', message: 'damaged', why: 'one character of the ciphertext changed; the right password no longer opens it' },
  'wrong-password': { link: locked, password: 'kutter am kay', code: 'wrong-password', message: 'password', why: 'the right link, the wrong password' },
  'too-long': { link: `#m1.${'A'.repeat(8000)}`, code: 'too-long', message: 'too long', why: 'over the 8 000-character cap' },
  'too-many-words': { link: await raw({ ...wire, t: 'w'.repeat(81) }), code: 'invalid', message: 'words must be at most 80', why: '81 characters of words' },
  'malformed-base64': { link: '#m1.Moin$moin', code: 'malformed', message: 'base64url', why: 'a character that is not base64url' },
  'hops-mismatch': { link: await raw({ ...wire, h: ['Anna', 'Ben', 'Jule'], n: 2 }), code: 'invalid', message: 'held must be', why: 'three names, but a count of two' },
};

for (const [name, f] of Object.entries(fixtures)) {
  writeFileSync(new URL(`../fixtures/${name}.json`, import.meta.url), JSON.stringify(f, null, 2) + '\n');
  console.log(`wrote fixtures/${name}.json`);
}
