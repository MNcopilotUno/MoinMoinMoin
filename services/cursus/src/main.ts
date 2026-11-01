import { createServer } from 'node:http';
import { createHandler } from './app.ts';
import { openStore } from './store.ts';

// Cursus (D16). Loopback by default; put a TLS reverse proxy in front to publish it.
const store = openStore(process.env.CURSUS_DB ?? 'cursus.sqlite');
const port = Number(process.env.CURSUS_PORT ?? 4175);
const host = process.env.CURSUS_HOST ?? '127.0.0.1';
const origin = process.env.CURSUS_ORIGIN ?? '*';

const server = createServer(createHandler({ store, origin }));
server.listen(port, host, () => console.log(`cursus: listening on http://${host}:${port}`));
store.sweep(Date.now());
const sweeper = setInterval(() => store.sweep(Date.now()), 60 * 60 * 1000);
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    clearInterval(sweeper);
    server.close(() => {
      store.close();
      process.exit(0);
    });
  });
}
