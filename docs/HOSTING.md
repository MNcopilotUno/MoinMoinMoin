# Hosting Cursus on the home server

Cursus is the Moin Domi relay (`docs/MOIN_DOMI.md` D16). The owner chose the home server
(A7, 2026-11-01). This is the whole procedure; it takes about half an hour. Everything you type is
in a box; nothing here needs a cloud account.

What runs where afterwards:
- the puzzle and Moin Domi's pages: GitHub Pages, as today;
- **Cursus**: your home server, behind a TLS reverse proxy, at a name like `relay.<your-domain>`
  (for example a subdomain of the domain your Gitea already uses).

## 0. What you need
- A Linux machine that is on all the time (a Raspberry Pi 4 is plenty: Cursus is a few hundred
  lines and a SQLite file).
- **Node.js 22.18 or newer** (`node --version`). Cursus has no other dependency and no build step.
- A DNS name pointing at your home's public address. If that address changes, use your DNS
  provider's dynamic-DNS updater (most have one) or your router's DynDNS.
- Your router forwarding **TCP 80 and 443** to the machine (80 is only for the certificate).

## 1. Put Cursus on the machine
```bash
sudo mkdir -p /opt/moin && sudo chown "$USER" /opt/moin
git clone https://github.com/MNcopilotUno/MoinMoinMoin /opt/moin   # or your Gitea mirror
node --disable-warning=ExperimentalWarning /opt/moin/services/cursus/src/cli.ts   # prints its usage: Node can run it
```

## 2. Run it as a service
```bash
sudo cp /opt/moin/services/cursus/deploy/cursus.service /etc/systemd/system/
sudo systemctl edit cursus      # only if you need to change a setting, e.g.:
#   [Service]
#   Environment=CURSUS_ORIGIN=https://mncopilotuno.github.io
sudo systemctl daemon-reload && sudo systemctl enable --now cursus
curl -s http://127.0.0.1:4175/v1/health      # → {"ok":true,"api":1}
```
The unit runs Cursus as a throwaway user with a read-only system, the database in
`/var/lib/cursus/cursus.sqlite`, listening on loopback only. Settings are in
`services/cursus/deploy/README.md`; leave `CURSUS_RATE_SCALE` at 1.

## 3. Put TLS in front
**If the machine has no web server yet — Caddy** (gets and renews the certificate by itself):
```bash
sudo apt install caddy            # or your distribution's package
sudo cp /opt/moin/services/cursus/deploy/Caddyfile /etc/caddy/Caddyfile
sudo sed -i 's/relay.example.org/relay.<your-domain>/' /etc/caddy/Caddyfile
sudo systemctl reload caddy
```
**If nginx already serves your Gitea**, add a site instead (and let your existing certbot set
issue the certificate):
```nginx
server {
    listen 443 ssl http2;
    server_name relay.<your-domain>;
    # ssl_certificate … (certbot fills these in)
    access_log off;                       # the relay must not record addresses
    client_max_body_size 16k;
    location / {
        proxy_pass http://127.0.0.1:4175;
        proxy_set_header X-Forwarded-For $remote_addr;   # one hop: the client's address only
    }
}
```
Keep `CURSUS_TRUST_PROXY=1` (the unit's default): rate limits then use the proxy's
`X-Forwarded-For`, which only the proxy can set because Cursus listens on loopback.

## 4. Check it from outside
From your phone on mobile data (not Wi-Fi), open `https://relay.<your-domain>/v1/health`, or:
```bash
curl -s https://relay.<your-domain>/v1/health
curl -si -X OPTIONS https://relay.<your-domain>/v1/chains -H 'Origin: https://mncopilotuno.github.io' | grep -i access-control
```

## 5. Point the app at it
GitHub → the repository → **Settings → Secrets and variables → Actions → Variables**:
- `CURSUS_URL` = `https://relay.<your-domain>`
- `DOMI_CONTACT` = an e-mail address you read (DSA point of contact, where reports go)

Then push anything to `main` (or re-run the last workflow). The Pages build bakes the relay into
Moin Domi and allows exactly that origin in its CSP. Open `https://mncopilotuno.github.io/MoinMoinMoin/domi/`:
the "Sending isn't switched on yet" line is gone, and *About and the rules* shows your address.

## 6. Run it
- **Update**: `cd /opt/moin && git pull && sudo systemctl restart cursus`.
- **Take a reported chain down** (DSA, `.agents/features/dsa.md`): from the reported link, take the
  part after `/m/` (an id or a name) and run
  `sudo -u nobody CURSUS_DB=/var/lib/cursus/cursus.sqlite node /opt/moin/services/cursus/src/cli.ts takedown <it>`
  — or stop the service, run it as root, start it again. Answer the reporter by mail.
- **Logs**: `journalctl -u cursus` shows starts, stops and internal errors — never requests.
- **Backups**: none, on purpose. Every chain deletes itself 30 days after its last stop; a backup
  would keep what was promised to vanish. If the disk dies, chains are gone — said in the app.
- **Health**: a cron line `curl -fsS https://relay.<your-domain>/v1/health >/dev/null || echo down`
  mailed to you is enough.

## 7. What home hosting means for you
- **Your home's public address is in DNS** for anyone who looks up the relay's name. If you would
  rather hide it, a tunnel service can carry the traffic instead of the open port — but then that
  company sees the (encrypted, metadata-only) traffic. Your call; the app works either way.
- The router exposes ports 80 and 443 to that one machine; keep it updated
  (`unattended-upgrades` on Debian/Ubuntu/Raspberry Pi OS) and let it run nothing else on those
  ports that you do not mean to publish.
- Cursus stores no readable address, no user agent and no plaintext (scan-tested); the proxy must
  not log either (`access_log off` / Caddy's default).

## 8. Before you tell anyone
- `DOMI_CONTACT` set, and you read that inbox (DSA Arts. 11, 12, 16).
- You tried the takedown command once on a test chain.
- Then run the S1 playtest: `docs/PLAYTEST.md`, sheet C.
