# Feature: Cursus — the relay (stage S1, code only)

Spec: `docs/MOIN_DOMI.md` §3, §4, D10, D14, D16, A4. Client and wire types:
`packages/tessera/src/relay.ts`. **Not deployed**: hosting and domain are still open (§9), so
S1's gate (six real people) cannot be run yet. Everything here runs on loopback in tests.

## Problem
Hops must travel between phones without the relay being able to read them, and the relay must
enforce the only rules it can see: depth (stops), children per hop (branches), 100 hops per chain,
expiry 30 days after the last hop, pending hops (A4).

## Design
Node 22 only: `node:http` and `node:sqlite` (no native modules, no framework); the TypeScript
runs directly (Node strips types), so there is no build.

### API v1 (JSON; boxes are base64url)
| Request | Success | Refusals |
|:--|:--|:--|
| `POST /v1/chains` `{chainId, hopId, maxStops 1–12, maxBranches 1–3, content, wrapKeyByT, wrapTByKey}` | 201 `{day}` | 409 id taken; 422 `bad-request`, `too-big` |
| `GET /v1/hops/:id` | 200 `HopView` (no `wrapTByKey`) | 404 unknown, pending or expired |
| `POST /v1/hops/:id/children` `{hopId, content}` | 201 `{wrapTByKey, day}` — the **parent's** wrap, only now (§3 step 3) | 404; 409; 422 `last-stop`, `branches-full`, `chain-full`, `too-big`, `bad-request` |
| `POST /v1/hops/:id/complete` `{wrapKeyByT, wrapTByKey}` | 200 `{day}` | 404 no such pending hop; 422 `bad-request` |
| `GET /v1/chains/:id/tree` | 200 `TreeView`: complete hops by `seq` | 404 |

`maxStops` 1 is a **postcard** (*Just send* in the design): one hop that nobody can extend. D3
says 3–12; the design's postcard needs 1 — recorded as proposal A6 in `MOIN_DOMI.md`.

### Data (§4)
`chains(id, maxStops, maxBranches, lastHopDay, expiresDay)`;
`hops(id, chainId, parentId, depth, day, seq, ciphertext, wrapKeyByT, wrapTByKey, pendingSince)`.
- `hopCount` is **counted, not stored** (one less number to drift). Pending hops count toward
  branches and the 100-hop cap while they live, so two people racing for the last branch cannot
  both win.
- `pendingSince` is the only finer-than-a-day time stored, and it exists for ten minutes at most.
- No IP, no user agent, no request log — the server writes nothing per request, anywhere.
- Expiry: `expiresDay = lastHopDay + 30`; a chain past it is deleted by the hourly sweep, and is
  answered as 404 before that.

### Headers
`cache-control: no-store`, `referrer-policy: no-referrer`, `x-content-type-options: nosniff`;
CORS for the configured app origin (`CURSUS_ORIGIN`, default `*` — no cookies are ever used, so
`*` gives nothing away); bodies over 8 KB → 413.

### Operator
`node src/cli.ts takedown <hopId|chainId>` deletes the whole chain (DSA Art. 6, `dsa.md`).

## Risks
- **Rate limits (added 2026-11-01).** Token buckets in memory per *HMAC(salt, address)*, the
  salt random per process: create 10 then 1 per 6 min, writes 60 then 1 per 10 s, reads 120 then
  2 per s; 429 with `Retry-After`. The relay never holds a readable address; a restart forgets
  everything. Behind a proxy (`CURSUS_TRUST_PROXY=1`) the first `X-Forwarded-For` entry counts —
  without a proxy that header is ignored, so it cannot be spoofed. NAT'd groups (a school, a
  café) share one bucket: accepted at this scale.
- **Disk guard**: new chains get 507 once the database passes `CURSUS_MAX_MB` (default 512).
- **Deploy kit** in `services/cursus/deploy/` (systemd + Caddy, or a Dockerfile) and a CI hook:
  the repository variable `CURSUS_URL` becomes `VITE_CURSUS_URL` in the Pages build.
- **Ids are client-chosen.** A squatter can take ids; harmless (48 random bits, 409 → retry).
- `node:sqlite` prints an *experimental* warning in Node 22; the API used (`DatabaseSync`,
  `prepare`, `run`, `get`, `all`) has been stable in practice. Pin Node 22 in deploy.

## Test matrix (`services/cursus/test`)
| Area | Happy day | Bad weather |
|:--|:--|:--|
| Turns | tessera start → open → turn → tree over real HTTP; postcard opens | hop past stops (`last-stop`); 2nd child at branches 1, 4th at 3 (`branches-full`, pending counted); hop 101 (`chain-full`); duplicate id 409; bad ids, bad limits, bad boxes 422; 9 KB body 413 |
| Pending (A4) | completes and appears | invisible to `GET hop` and tree; deleted by the sweep after 10 minutes; complete twice → 404 |
| Expiry | gone on day 31 after the last hop | a hop on day 29 extends it to day 59 |
| Privacy | — | DB file contains no caption plaintext, no `127.0.0.1`, no user agent; nothing logged per request |
| HTTP | CORS preflight answers; `/v1/health` | unknown route 404, wrong method 405 |
| Limits | a burst passes, refills after the interval | 11th chain in a burst → 429 with `Retry-After: 360`; full database → 507 while reads still work; no readable address in memory; two processes salt differently |
| Operator | takedown by hop id removes the chain | takedown of an unknown id says so |
