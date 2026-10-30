// One GitHub Pages site, two apps (DOMI_ROADMAP D0): the puzzle at <base>/ and Moin Domi at
// <base>/domi/. Run after both builds (`pnpm build` does): copies Domi's dist into the puzzle's.
// The puzzle's service worker is told not to answer /domi/ (navigateFallbackDenylist), and Domi's
// files are copied after the puzzle's precache manifest was written, so they are never precached.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const puzzle = fileURLToPath(new URL('../apps/moin-moin-moin/dist/', import.meta.url));
const domi = fileURLToPath(new URL('../apps/moin-domi/dist/', import.meta.url));
for (const dir of [puzzle, domi]) if (!existsSync(dir)) throw new Error(`missing build: ${dir}`);
rmSync(`${puzzle}domi`, { recursive: true, force: true });
cpSync(domi, `${puzzle}domi`, { recursive: true });
console.log('assembled: puzzle at ./, Moin Domi at ./domi/');
