// One GitHub Pages site, two apps (docs/MOIN_DOMI.md): the puzzle at <base>/ and Moin Domi at
// <base>/domi/. Run after both builds (`pnpm build` does): copies Domi's dist into the puzzle's.
// The puzzle's service worker is told not to answer /domi/ (navigateFallbackDenylist), and Domi's
// files are copied after the puzzle's precache manifest was written, so they are never precached.
// The root 404.html (scripts/not-found.mjs) turns `domi/m/<id>#<key>` into `domi/?m=<id>#<key>`.
import { cpSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { notFoundPage } from './not-found.mjs';

const puzzle = fileURLToPath(new URL('../apps/moin-moin-moin/dist/', import.meta.url));
const domi = fileURLToPath(new URL('../apps/moin-domi/dist/', import.meta.url));
for (const dir of [puzzle, domi]) if (!existsSync(dir)) throw new Error(`missing build: ${dir}`);
rmSync(`${puzzle}domi`, { recursive: true, force: true });
cpSync(domi, `${puzzle}domi`, { recursive: true });
writeFileSync(`${puzzle}404.html`, notFoundPage(process.env.BASE_PATH ?? '/'));
console.log('assembled: puzzle at ./, Moin Domi at ./domi/, 404.html redirects Domi links');
