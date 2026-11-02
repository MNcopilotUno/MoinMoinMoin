#!/usr/bin/env bash
# Install or update Cursus (the Moin Domi relay) on a Linux home server — docs/HOSTING.md, the
# short way. Safe to run again: it updates the copy, the unit and the proxy site, then restarts.
#
#   sudo services/cursus/deploy/install.sh relay.example.org            # Caddy (default)
#   sudo services/cursus/deploy/install.sh relay.example.org --proxy nginx
#   sudo services/cursus/deploy/install.sh relay.example.org --dry-run  # print, change nothing
#        services/cursus/deploy/install.sh check relay.example.org      # from anywhere, after DNS
#
# It never opens router ports, never touches DNS and never logs requests: those stay yours.
set -euo pipefail

ORIGIN="https://mncopilotuno.github.io"
PROXY="caddy"
DRY=0
TARGET=/opt/moin/services/cursus
PORT=4175

say() { printf '\033[1m%s\033[0m\n' "$*"; }
fail() { printf 'cursus install: %s\n' "$*" >&2; exit 1; }
run() { if [ "$DRY" = 1 ]; then printf '  would run: %s\n' "$*"; else "$@"; fi; }
write() { # write <path> — content on stdin
  if [ "$DRY" = 1 ]; then printf '  would write %s:\n' "$1"; sed 's/^/    | /'; else cat >"$1"; fi
}

check() {
  local host=$1 ok=0
  say "Checking https://$host from here"
  if curl -fsS --max-time 10 "https://$host/v1/health" | grep -q '"ok":true'; then echo "  health: ok"; else echo "  health: FAILED (DNS, router port 443, proxy or service)"; ok=1; fi
  if curl -fsS --max-time 10 -X OPTIONS -H "Origin: $ORIGIN" -o /dev/null -D - "https://$host/v1/chains" | grep -qi '^access-control-allow-origin'; then echo "  CORS for $ORIGIN: ok"; else echo "  CORS: FAILED (CURSUS_ORIGIN?)"; ok=1; fi
  if [ $ok = 0 ]; then
    say "Relay is up. Last step, on GitHub: Settings → Secrets and variables → Actions → Variables:"
    echo "  CURSUS_URL   = https://$host"
    echo "  DOMI_CONTACT = an address you read"
    echo "then push to main (or re-run the last workflow)."
  fi
  return $ok
}

[ "${1:-}" = "check" ] && { [ -n "${2:-}" ] || fail "usage: install.sh check <relay host>"; check "$2"; exit $?; }

HOST="${1:-}"
[ -n "$HOST" ] && [ "${HOST#-}" = "$HOST" ] || fail "usage: sudo install.sh <relay host, e.g. relay.example.org> [--proxy caddy|nginx|none] [--origin URL] [--dry-run]"
shift
while [ $# -gt 0 ]; do
  case "$1" in
    --proxy) PROXY="${2:-}"; shift 2 ;;
    --origin) ORIGIN="${2:-}"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    *) fail "unknown option $1" ;;
  esac
done
case "$PROXY" in caddy|nginx|none) ;; *) fail "--proxy must be caddy, nginx or none" ;; esac
[[ "$HOST" =~ ^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$ ]] || fail "'$HOST' is not a host name"
[[ "$ORIGIN" =~ ^https://[^/]+$ ]] || fail "--origin must be https://host with no path"
[ "$DRY" = 1 ] || [ "$(id -u)" = 0 ] || fail "run it with sudo (or add --dry-run to see what it would do)"

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
[ -f "$SRC/src/main.ts" ] || fail "cannot find Cursus next to this script ($SRC)"

say "1/4  Node.js"
NODE="$(command -v node || true)"
[ -n "$NODE" ] || fail "Node.js 22.18+ is not installed (https://nodejs.org or your distribution's nodejs 22 package)"
case "$NODE" in /home/*|/root/*) fail "node is at $NODE — the service runs with a private, read-only home; install Node system-wide (e.g. /usr/bin/node)";; esac
VERSION="$("$NODE" -p 'process.versions.node')"
IFS=. read -r MAJ MIN _ <<<"$VERSION"
{ [ "$MAJ" -gt 22 ] || { [ "$MAJ" = 22 ] && [ "$MIN" -ge 18 ]; }; } || fail "Node $VERSION is too old: Cursus needs 22.18 or newer (it runs TypeScript directly)"
echo "  $NODE $VERSION"

say "2/4  Cursus in $TARGET (a copy: the relay has no dependencies)"
run mkdir -p "$TARGET"
run cp -r "$SRC/src" "$SRC/package.json" "$TARGET/"
run "$NODE" --disable-warning=ExperimentalWarning --input-type=module -e "await import('$TARGET/src/app.ts')"

say "3/4  The service (systemd, as a throwaway user, database in /var/lib/cursus)"
run cp "$SRC/deploy/cursus.service" /etc/systemd/system/cursus.service
run mkdir -p /etc/systemd/system/cursus.service.d
write /etc/systemd/system/cursus.service.d/local.conf <<EOF
# Written by install.sh — your settings; the unit itself is replaced on every install.
[Service]
ExecStart=
ExecStart=$NODE --disable-warning=ExperimentalWarning src/main.ts
Environment=CURSUS_ORIGIN=$ORIGIN
EOF
run systemctl daemon-reload
run systemctl enable cursus
run systemctl restart cursus
if [ "$DRY" = 0 ]; then
  for _ in 1 2 3 4 5 6 7 8 9 10; do curl -fsS "http://127.0.0.1:$PORT/v1/health" >/dev/null 2>&1 && break; sleep 1; done
  curl -fsS "http://127.0.0.1:$PORT/v1/health" | grep -q '"ok":true' || fail "the service did not answer — see: journalctl -u cursus -n 50"
  echo "  answering on 127.0.0.1:$PORT"
fi

say "4/4  TLS in front ($PROXY)"
case "$PROXY" in
  caddy)
    if ! command -v caddy >/dev/null; then
      command -v apt-get >/dev/null || fail "install Caddy first (https://caddyserver.com/docs/install), then run me again"
      run apt-get install -y caddy
    fi
    write /etc/caddy/moin-relay.caddy <<EOF
# Written by install.sh. No access log: the relay must not record addresses.
$HOST {
	encode gzip
	reverse_proxy 127.0.0.1:$PORT
	header -Server
}
EOF
    if [ "$DRY" = 1 ] || ! grep -qs 'import moin-relay.caddy' /etc/caddy/Caddyfile; then
      if [ "$DRY" = 1 ]; then echo "  would add 'import moin-relay.caddy' to /etc/caddy/Caddyfile"; else printf '\nimport moin-relay.caddy\n' >>/etc/caddy/Caddyfile; fi
    fi
    run caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
    run systemctl reload-or-restart caddy
    echo "  Caddy fetches the certificate itself once DNS and port 80/443 reach this machine."
    ;;
  nginx)
    [ -d /etc/nginx/sites-available ] || [ "$DRY" = 1 ] || fail "no /etc/nginx/sites-available: add the block from docs/HOSTING.md by hand"
    write /etc/nginx/sites-available/moin-relay <<EOF
# Written by install.sh. Then: certbot --nginx -d $HOST   (adds the TLS part)
server {
    listen 80;
    server_name $HOST;
    access_log off;
    client_max_body_size 16k;
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_set_header X-Forwarded-For \$remote_addr;
    }
}
EOF
    run ln -sf /etc/nginx/sites-available/moin-relay /etc/nginx/sites-enabled/moin-relay
    run nginx -t
    run systemctl reload nginx
    echo "  Now: certbot --nginx -d $HOST"
    ;;
  none) echo "  Point your own TLS proxy at http://127.0.0.1:$PORT (no access log; X-Forwarded-For = client address)." ;;
esac

say "Done on this machine. Still yours:"
echo "  - DNS: $HOST → your home's public address (dynamic DNS if it changes)"
echo "  - router: forward TCP 80 and 443 to this machine"
echo "  - then, from anywhere:  services/cursus/deploy/install.sh check $HOST"
echo "  - updating later: git pull, then run this script again"
