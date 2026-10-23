// A tiny static server for the BUILT app (CLAUDE.md §8: never Playwright against the dev server).
// Serves `dir` under `base`, loopback only, no caching, so tests can swap files between requests.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json',
};

export function startServer({ dir, base = '/', port = 4173 }) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    if (!url.pathname.startsWith(base)) { res.writeHead(404).end('not found'); return; }
    let rel = normalize(decodeURIComponent(url.pathname.slice(base.length))).replace(/^(\.\.[/\\])+/, '');
    if (rel === '' || rel === '.' || rel.endsWith('/')) rel = join(rel, 'index.html');
    const file = join(dir, rel);
    try {
      const info = await stat(file);
      if (!info.isFile()) throw new Error('not a file');
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-cache' });
      res.end(body);
    } catch {
      res.writeHead(404).end('not found');
    }
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () =>
      resolve({ url: `http://127.0.0.1:${port}${base}`, close: () => new Promise((r) => server.close(() => r(undefined))) }));
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dir = fileURLToPath(new URL('../dist/', import.meta.url));
  const { url } = await startServer({ dir, base: process.env.BASE_PATH ?? '/', port: Number(process.env.PORT ?? 4173) });
  console.log(`serving ${dir} at ${url}`);
}
