# Running Cursus

Cursus is the Moin Domi relay (`docs/MOIN_DOMI.md` D16, `.agents/features/cursus.md`). It needs
Node 22.18 or newer and nothing else: no build, no `npm install` at run time.

## Choose one
- **A small VPS or the home server, with systemd + Caddy:** copy the repository to `/opt/moin`,
  install `cursus.service` and a Caddy site from `Caddyfile` (change the host name), point a DNS
  record at the machine.
- **A container:** `Dockerfile` in this folder; publish the port only to loopback and put a TLS
  proxy in front.

## Settings (environment)
| Variable | Default | Meaning |
|:--|:--|:--|
| `CURSUS_DB` | `cursus.sqlite` | the database file (the only state) |
| `CURSUS_HOST` / `CURSUS_PORT` | `127.0.0.1` / `4175` | where it listens |
| `CURSUS_ORIGIN` | `*` | the app's origin for CORS, e.g. `https://mncopilotuno.github.io` |
| `CURSUS_TRUST_PROXY` | off | `1` behind a reverse proxy: rate limits use `X-Forwarded-For` |
| `CURSUS_MAX_MB` | `512` | refuse new chains (507) above this database size |
| `CURSUS_RATE_SCALE` | `1` | multiplies every rate-limit burst; leave at 1 (the e2e relay uses 100) |

## Then point the app at it
In the GitHub repository: **Settings → Secrets and variables → Actions → Variables → New
repository variable** `CURSUS_URL` = `https://relay.example.org`. The next push to `main` builds
Moin Domi with that relay (`VITE_CURSUS_URL`), and its page may talk to that origin and no other
(CSP `connect-src`).

## Before telling anyone (DSA, `.agents/features/dsa.md`)
- set `VITE_DOMI_CONTACT` (repository variable `DOMI_CONTACT`) to an address you read: it is the
  point of contact (Arts. 11–12) and where reports go (Art. 16);
- to take a reported chain down: `CURSUS_DB=/var/lib/cursus/cursus.sqlite node src/cli.ts takedown <hopId>`.

## Check it
`curl https://relay.example.org/v1/health` → `{"ok":true,"api":1}`.
