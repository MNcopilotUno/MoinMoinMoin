# Review — feature/domi-gaps (adversarial)

Scope: a password for any link you hand on (Ready → *Send it with a password instead*, after a
turn too); what happens after *Report this chain* is said in the app.

## Findings
1. **The password is shown once and lives only in memory** (`shownPassword`); reopening *Ready*
   from Yours later shows the locked link without it — the person must have sent or noted it.
   *Accepted*: storing passwords on the phone is what the design avoids.
2. **Locking after the fact leaves the key link valid.** Anyone who already has the key link can
   still open the hop; the password protects the link you send *now*. Said nowhere yet in the UI;
   *noted* — the panel appears before you send anything, which is the normal order.
3. **Name check then lock is not atomic** (two people choosing one name in the same second); the
   relay's 409 then surfaces as the same "taken" message. Fine.
4. **The report note cannot know the mail was sent** — `mailto:` gives no answer. Worded as "your
   mail app has the report", not "sent".
5. **No e2e for the report note**: clicking `mailto:` in headless browsers is unreliable; the
   href itself is tested.

## Evidence
Domi e2e 26/26 on Chromium (new: a password on the link after a turn, opened at stop 3);
typecheck 0/0; lint clean.
