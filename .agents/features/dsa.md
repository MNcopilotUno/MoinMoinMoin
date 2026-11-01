# The DSA question (stage S0, `docs/MOIN_DOMI.md` §4)

**Question.** Does running Cursus make us a hosting service under the EU Digital Services Act
(Regulation (EU) 2022/2065), and which duties follow?

**Answer (2026-11-01, not legal advice — a reading of the text, to be confirmed by a lawyer if
Moin Domi ever goes beyond friends).**

1. **Cursus is a hosting service.** Art. 3(g)(iii): a "'hosting' service, consisting of the
   storage of information provided by, and at the request of, a recipient of the service".
   Cursus stores encrypted hops at the request of whoever takes a turn. That it cannot read them
   does not change what it is.
2. **Cursus is not an online platform.** Art. 3(i) makes a platform a hosting service that
   "stores and disseminates information to the public"; Art. 3(k) defines that as "making
   information available … to a potentially unlimited number of third parties". Recital 14:
   "emails or private messaging services, fall outside the scope of the definition of online
   platforms as they are used for interpersonal communication between a finite number of persons
   determined by the sender". A Moin Domi chain goes only to people each sender chooses, is
   capped at 100 hops (D10) and has no discovery. **Condition**: this holds only while there is
   no public listing, no feed and no open link directory (`MOIN_DOMI.md` §8 already rules them
   out). A link posted publicly is the poster's act, but a design that invites it would erode
   the argument.
3. **Duties that apply** (Chapter III, Sections 1–2):
   - Art. 11 — a single point of contact for authorities, made public;
   - Art. 12 — a single point of contact for recipients, "directly and rapidly … by electronic
     means … not solely rely on automated tools";
   - Art. 13 — a legal representative in the EU, only if the provider is outside the EU (the
     owner is in the EU: not needed);
   - Art. 14 — terms and conditions stating any restrictions and how moderation works;
   - Art. 16 — a notice-and-action mechanism, "easy to access and user-friendly", electronic,
     able to receive "the exact URL" (Art. 16(2)(b));
   - Art. 17 — a statement of reasons to affected recipients, but Art. 17(2): "only … where the
     relevant electronic contact details are known to the provider" — Cursus knows none, so in
     practice none is sent;
   - Art. 18 — inform authorities of a suspected threat to life or safety if we become aware.
4. **Duties that do not apply**: Art. 15(1) transparency reports — Art. 15(2) exempts micro and
   small enterprises (a private person running it is far below the thresholds); Section 3
   (online platforms, Arts. 19–28) — not a platform; and Art. 19 would exempt micro and small
   enterprises from it anyway.
5. **Liability**: Art. 6 — not liable for stored information without "actual knowledge" and if
   acting expeditiously once aware. A notice is how we become aware: a notice must carry the full
   link **with its key** to be actionable (we cannot read anything else). The relay therefore
   needs a takedown by chain id that the operator can run.

**What S1 must ship before Cursus is public**: a contact address (Arts. 11–12) and a notice form
or address that asks for the full link and a reason (Art. 16), short terms (Art. 14) in the app's
About, and an operator command that deletes a chain by id (Art. 6 "expeditiously").

**Sources.** Regulation (EU) 2022/2065, Arts. 3(g), 3(i), 3(k), 6, 11–19 and Recital 14, read on
2026-11-01 via the article-by-article text at <https://www.eu-digital-services-act.com/>
(EUR-Lex <https://eur-lex.europa.eu/eli/reg/2022/2065/oj> refused automated access that day;
the quotes above should be checked against it once).
