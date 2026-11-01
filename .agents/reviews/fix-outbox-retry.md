# Review — fix/outbox-retry (adversarial)

CI on `905a450`: after the rate-limit fix, one test left — Firefox, *a chain made offline goes
out when the network is back*. The turn test in the same browser passed.

## Findings
1. **The outbox gave up on the first network error after `online`.** If the event arrives before
   a fetch can succeed (Firefox CI here; captive portals and waking radios in life), the entry
   waited for an `online` event that had already fired — forever, while the app stayed open.
   *Fixed*: an "offline" failure while `navigator.onLine` is true retries with backoff, 2 s up to
   60 s, reset on success. New Chromium test aborts the relay's first answer and sees the chain
   go out by itself.
2. **The Firefox cause is inferred, not reproduced** — no Firefox in this container. The fix
   addresses the failure class either way; CI is the check.
3. **Retries keep the radio busy** at most once a minute while something is queued and the app
   is open. Accepted.
4. The test's wait for "went out" is now 15 s (two retries fit), with the reason in a comment —
   not a longer timeout to hide slowness: the first retry is at 2 s by design.

## Evidence
Domi e2e 13/13 on Chromium (new retry test); typecheck 0/0; lint clean.
