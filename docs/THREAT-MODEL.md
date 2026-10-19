# Threat model — how the model can be gamed, and what resists it

Any system that tries to distinguish *contribution* invites gaming. This page names the attacks and
maps each to an **invariant** (enforced by `test/run.mjs`) or an explicit boundary.

> **Scope note.** This threat model covers the **model's logic**, not a deployed service. There is no
> storage here to breach. A real deployment would need an *additional* data-security threat model
> (see [`MODEL.md`](MODEL.md) §6).

---

## 1. Attack catalogue

| # | Attack | How it works | Resistance |
|---|---|---|---|
| T1 | **Evidence inflation** | claim credit for trivial or automated commits | Axis **A** counts *accepted* work (merged PRs, reviews), not raw commit count; `uniqueKey` dedupes |
| T2 | **Activity-as-contribution** | farm in-app actions to look like a builder | Axis **C** is reported **separately** and never folded into **A** (invariant **I5**) |
| T3 | **Identity spoofing** | claim someone else's GitHub as "mine" | cross-source links are **`self-declared`** (**I2**); the model never asserts ownership |
| T4 | **Trust laundering** | store a self-asserted fact and later cite it as verified | a claim may **never exceed its source's trust** (**I4**); `validateEvidence` rejects it |
| T5 | **Weighting capture** | argue for a weighing that flatters one group | the model **produces no combined score** (**I1**); any weighting must be explicit and public |
| T6 | **Cross-app correlation** | re-identify the same person across apps | **not attempted** (**I7**); Pi's `uid` is app-local by design (P5) |
| T7 | **Sybil profiles** | many accounts boosting each other | out of scope: distinguishing humans is **not** something this model claims to do (boundary) |
| T8 | **Stale evidence** | cite an old contribution as current | every item carries `observedAt`; freshness is a required field, not optional |
| T9 | **Key/secret exposure** | leak a Server API Key while building a service | this repo has **no** keys and makes **no** network calls; server-key handling is out of scope |
| T10 | **Reputation weaponisation** | use the profile to punish a dissenting user | boundaries: **no authority** over money/wallet, and **no** answer to "who is a real contributor" |

---

## 2. The invariants that do the work

Restated as the model's constitution (each is asserted in the test suite):

- **I1** — No combined score exists.
- **I2** — Cross-source links are at most `self-declared`.
- **I3** — Every evidence item carries source, trust, verifiedBy, provenance, observedAt, uniqueKey.
- **I4** — A claim never exceeds its source's trust level.
- **I5** — Activity (C) is never reported as contribution (A).
- **I6** — No personal data, KYC, or secrets are stored by this repo.
- **I7** — No cross-app correlation is attempted.

---

## 3. Residual risks the model cannot remove

Being honest about what remains, even with the invariants:

- **A gifted but unverifiable contributor** may have real contributions that leave no public trace.
  The model under-counts them; that is a *known* limitation, not a bug to paper over.
- **Self-declared links are often true.** Most people honestly link their own accounts. The model
  still labels them `self-declared`, because *some* are false and the label is about provability,
  not about the person.
- **Axis B (utility) is the hardest to measure** and most easily gamed socially ("look how popular").
  It should be treated as the weakest axis.
- **Human review is unavoidable** for hard cases. No purely automated model should decide them.

---

## 4. What a deployment would additionally need

Named here so nobody mistakes the model for a service:

1. **Storage threat model** — breach, retention limits, true erasure.
2. **Replay protection** for app events (signed, nonce/sequence).
3. **Server-key isolation** — the Pi Server API Key must stay server-side, never in client code.
4. **Access control** — who may read a profile, and consent for that.
5. **Deletion SLA** — honour "revoke consent" by actually deleting.

See [`ETHICS.md`](ETHICS.md) for the consent and minimization rules that would carry over.
