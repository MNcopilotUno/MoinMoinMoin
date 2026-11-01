// Serve the BUILT Domi app at <base>/domi/ (CLAUDE.md §8: never the dev server), with the same
// 404 page GitHub Pages serves, so `/domi/m/<id>#<key>` links are tested the way they will travel.
import { fileURLToPath } from 'node:url';
import { startServer } from '../../moin-moin-moin/e2e/static-server.mjs';
import { notFoundPage } from '../../../scripts/not-found.mjs';

const root = process.env.BASE_PATH ?? '/';
const dir = fileURLToPath(new URL(`../${process.env.DIST ?? 'dist'}/`, import.meta.url));
const { url } = await startServer({ dir, base: `${root}domi/`, port: Number(process.env.PORT ?? 4174), notFound: notFoundPage(root) });
console.log(`serving ${dir} at ${url}`);
