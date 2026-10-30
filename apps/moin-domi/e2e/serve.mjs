// Serve the BUILT Domi app at <base>/domi/ (CLAUDE.md §8: never the dev server).
import { fileURLToPath } from 'node:url';
import { startServer } from '../../moin-moin-moin/e2e/static-server.mjs';

const dir = fileURLToPath(new URL('../dist/', import.meta.url));
const { url } = await startServer({ dir, base: `${process.env.BASE_PATH ?? '/'}domi/`, port: Number(process.env.PORT ?? 4174) });
console.log(`serving ${dir} at ${url}`);
