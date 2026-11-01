# Review — fix/outbox-poll (adversarial)

CI on `6f42d9b` still failed the Firefox test *a chain made offline goes out*.

## Findings
1. **`fix/outbox-retry` fixed a guess, not the bug.** The CI trace (Playwright report artifact)
   shows the page made **no request** to the relay after `setOffline(false)`: the `online` event
   never reached a page that was loaded offline, and the backoff only arms when the browser
   already says it is online. *Fixed*: while the outbox holds something, the app looks every 5 s
   (`navigator.onLine` → flush). The retry stays: it covers the other real case (online, relay
   unreachable). Lesson corrected in `code.md`: read the trace first.
2. **New test reproduces the Firefox behaviour on Chromium**: an init script swallows every
   `online` event; the chain still goes out (6.8 s ≈ one 5 s look).
3. **A timer while something is queued** — only then, cleared when the outbox empties.

## Evidence
Domi e2e 14/14 on Chromium; typecheck 0/0; lint clean. Firefox: the CI run after this push.
