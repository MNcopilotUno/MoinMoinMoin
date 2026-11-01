# Review — feature/cursus-hardening (adversarial)

Scope: rate limits, disk guard and `/v1/health` in Cursus; `slow-down` in Tessera and the app;
the deploy kit (`services/cursus/deploy/`); CI passes the repository variables `CURSUS_URL` and
`DOMI_CONTACT` into the Pages build.

## Findings
1. **Rate limits need addresses; the relay promises to keep none.** *Resolved*: buckets are keyed
   by an HMAC with a per-process random salt, live in memory, are bounded (10 000, oldest out)
   and vanish on restart; a test asserts no readable address is held. Settings already says the
   relay "sees your connection while you use it".
2. **`X-Forwarded-For` is attacker-controlled.** Trusted only with `CURSUS_TRUST_PROXY=1`, i.e.
   behind Caddy on loopback, where Caddy sets it. Without the flag it is ignored — a spoofed
   header cannot buy a fresh bucket (the privacy test sends one; it changes nothing).
3. **Shared addresses** (a family behind one router) share the create bucket: 10 chains at once,
   then one per six minutes. *Accepted* for friends-scale use; the numbers live in `RATES`.
4. **Health before limits**: `/v1/health` is answered before the limiter so monitoring never
   eats a reader's budget; it reads nothing from the store.
5. **The disk guard counts pages, not free disk.** A full disk below the limit still fails as a
   500 on insert. *Accepted*; the limit should be set well under the disk.
6. **Deploy kit is untested here**: no Docker or systemd in this container. The unit and the
   Dockerfile are short and conventional; *must be tried on the real host* — logged in HANDOVER.
7. **`MemoryDenyWriteExecute=no`** in the unit: V8's JIT needs writable-executable memory; the
   line is explicit so nobody "hardens" Node into a crash.

## Evidence
cursus **31** tests (limit 5 new, relay 3 new), tessera 38; lint and `tsc` clean.
