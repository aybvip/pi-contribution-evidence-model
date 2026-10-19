# Ethics — consent, minimization, and the line we refuse to cross

Building a "contribution profile" means building a **classification of people**. That carries
ethical weight, so this page states the rules plainly. They are not decoration; where testable, they
are enforced by the invariant suite.

---

## 1. The governing principle

> **Every person's data belongs to that person.** The model may describe *evidence*, but it may
> never assert a *verdict* about a human's worth, intent, or right to belong.

The model is built so this is *hard to violate accidentally*: it has no score to weaponise, no
cross-app identity to doxx with, and no verdict field to fill in.

---

## 2. Consent

| Rule | Status |
|---|---|
| No linkage happens without the user's explicit consent | Required |
| Only the scopes the user granted may be read (`GET /v2/me`) | Required (P2) |
| Consent can be revoked, and revocation must be honoured | Required |
| `uid` may change on revocation, and the model must tolerate that | Required (P1) |

A user's decision to stop sharing **ends the evidence**, not merely the display of it.

---

## 3. Minimization (collect as little as possible)

- **No KYC, ever.** Pi exposes no developer scope for it (P6); the model does not want it anyway.
- **No secrets.** No private keys, no seed phrases, no Server API Key in this repo (I6).
- **Pseudonymous by default.** Where an identifier is needed, an app-local `uid` suffices; a global
  person-id is never required and never constructed (I7).
- **No needless precision.** Contribution facts, not personal profiling.

---

## 4. The line we refuse to cross

1. **We do not name "real contributors".** The model reports evidence; the phrase "real contributor"
   is a verdict, and it is in [`BOUNDARIES`](../lib.mjs).
2. **We do not correlate people across apps.** Pi's design forbids it; doing it would be a privacy
   violation dressed as a feature (I7, P5).
3. **We do not fold behaviour into a single number** that could become a gate or a reward (I1).
4. **We take no authority over anyone's money or wallet**, and the model has no mechanism to
   (boundary, and it issues no signed operations).

---

## 5. Why defaults matter more than intentions

It is easy to *say* "we care about privacy" and then ship a system whose easiest path is
surveillance. This model inverts that:

- The **default** is separation — four axes, provenance labels, no join key.
- The **easy path** is honest (label self-declared evidence as self-declared).
- The **hard path** (a combined, cross-app ranking) requires you to first defeat the invariants,
  which fail the build.

Good ethics here is not a promise. It is a design that makes the harmful version *hard to build*.

---

## 6. If you want to go further

You do not need this model to reward real contribution. You can:

- pay contributors directly (axis A/B evidence, per-repo, git-native),
- run a grants program with human review,
- credit users inside **your own app** for **their own** actions (axis C, consented).

All of these are ethical *and* simpler than a global profile — because they avoid the identity-link
problem entirely. That is the honest recommendation, and it is why this repo is a *model*, not a
product.
