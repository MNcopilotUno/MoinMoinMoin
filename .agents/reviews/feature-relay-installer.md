# Review — feature/relay-installer (adversarial)

Scope: `services/cursus/deploy/install.sh` (install/update and `check`), the short way in
`docs/HOSTING.md`. The owner chose the home server (A7) and asked to deploy Domi on Pages — the
app already is (checked live 2026-11-02: page, manifest, worker, the `/m/` 404 redirect, the
latest content in the bundle); sending waits for this relay.

## Findings
1. **Never run here.** The script changes a machine (systemd unit, `/opt`, proxy config). I tried
   a dry run in this container and, in the same command, a real run as root by mistake; the
   sandbox refused the whole command. *Only `bash -n` was done.* The first real run is the owner's:
   `--dry-run` first is in the guide.
2. **ProtectHome**: the unit hides `/home`, so Node from nvm under `/home` would fail at start.
   The script refuses such a Node with the reason, and copies Cursus to `/opt` so the clone can
   live anywhere.
3. **Existing Caddy configs are not overwritten**: the site goes into its own file and one
   `import` line is appended (once). `caddy validate` runs before the reload.
4. **nginx**: an HTTP block plus the `certbot --nginx` hint — certbot is the usual tool there; the
   script does not run it (it may ask questions).
5. **Inputs are checked** (host name pattern, https origin without a path, proxy choice) — the
   host goes into config files, so a stray character must not.
6. **`check` from outside** confirms health and CORS for the app's origin and only then prints the
   two GitHub variables, so they are not set before the relay answers.

## Evidence
`bash -n` clean; file mode 100755 in git. Not executed (finding 1).
