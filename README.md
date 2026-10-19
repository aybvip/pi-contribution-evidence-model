# pi-contribution-evidence-model

**A read-only, zero-dependency measurement toolkit for the *evidence layer* behind a
"contribution profile" — built to make the model rigorous, not to build a product.**

> **What this is.** A **reference specification** for how you *could* assemble a per-Pioneer
> contribution evidence profile from multiple, independently-labelled sources — and, just as
> importantly, a **machine-checkable set of invariants** that stop the model from overclaiming.
>
> **What this is not.** It is **not** a deployed service. It does **not** store personal data, does
> **not** link a Pi identity to a GitHub account to an app account, and does **not** produce a
> single "contribution score" for a real person. There is **no database**, **no login**, **no
> personal data** in this repository — only the model, its rules, and offline checks.

---

## Why this exists (and why it is *separate* from `pi-user-behavior`)

The sibling repository [`pi-user-behavior`](https://github.com/aybvip/pi-user-behavior) measured a
narrow and important thing: **what user behavior is observable on the Pi chain** (layers B1–B7).
Its central finding is that **app engagement, economic intent, and identity enforcement are not on
the ledger.**

This repository takes the natural next question seriously — *"then how would anyone assemble a
contribution profile from *other* evidence?"* — and answers it as a **model**, with the honesty
constraints encoded as tests.

**The two repositories are deliberately kept apart:**

| Repo | Mode | Claim |
|---|---|---|
| `pi-user-behavior` | measurement | "this is what the chain shows, and what it cannot show" |
| `pi-contribution-evidence-model` | specification | "this is how an evidence model could be built, and which invariants it must not violate" |

**Do not merge them.** A measurement repo that starts producing people-scores stops being a
measurement repo. This separation *is* the integrity mechanism.

---

## The core principle: evidence, not a score

A contribution profile is **not** a number. It is a **set of typed evidence items**, each of which
must carry:

1. **Source** — where it came from (chain / app / Git platform / self-declared).
2. **Trust level** — `on-chain` · `platform-verified` · `self-declared` · `unverified`.
3. **Verification basis** — the exact check that established it.
4. **Provenance path** — which account linkage it depends on (and whether that link is proven).
5. **Time** — when it was observed and when it expires.
6. **Uniqueness key** — what stops the same contribution being counted twice.

No evidence item without all six. The tests in this repo enforce that.

---

## The four independent axes (never collapse them into one number)

| Axis | Answers | Independent source |
|---|---|---|
| **A — Technical contribution** | "did this person build / fix / document something, and was it *accepted*?" | Git platform API (merged PRs, reviews, releases) |
| **B — Ecosystem utility** | "did what they built get *used* or *fix a documented problem*?" | downstream usage evidence, issue closures |
| **C — In-app activity** | "did this account *do* things in a participating app?" | the **participating app's own** signed events |
| **D — Evidence strength** | "how trustworthy is the above?" | provenance chain, cross-source corroboration |

> **Invariant (enforced by test).** The four axes are reported **separately**. The model exposes
> **no** function that returns a single combined score. Anyone who wants one must define it *and
> publish their weighting* — the model refuses to hide it behind a default.

---

## What Pi's own platform actually allows (measured, with sources)

This is the part most proposals get wrong. Everything below is quoted from **official** Pi developer
documentation. See [`docs/SOURCES.md`](docs/SOURCES.md) for the full list.

| Capability | Official reality | Consequence for this model |
|---|---|---|
| **Authenticate a user** | `Pi.authenticate(scopes)` → `{ accessToken, user: { uid, username } }`. | You can confirm *"this session is some real consenting Pioneer."* |
| **Read consenting identity** | `GET https://api.minepi.com/v2/me` with `Authorization: Bearer <access token>` → `UserDTO { uid, credentials.scopes, valid_until, username? }`. | You get **only what the user consented to share**. |
| **`uid` is app-specific and non-joinable** | *"An app-local identifier for the user. It is specific to this user and this app… It will change if the user revokes the permissions they granted to your app."* / *"The same Pi user gets a different `uid` in a different app, so two apps cannot correlate the same person."* | **You cannot correlate one person across two apps by design.** Any cross-app linkage is out of scope. |
| **Scopes** | `username`, `payments`, `wallet_address`, `in_app_notifications`. There is **no** identity/KYC scope and **no** "activity" scope. | You cannot read KYC, history, or other apps' activity. |
| **Access token lifetime** | `expires_in` ≈ 3600s, **no refresh token**. | Identity is a *session*, not a standing key. |
| **Server key** | Money/notification endpoints need the **Server API Key**, which *"must be kept on your server"* and never sent to clients. | Any real backend must isolate this secret; the model treats it as a `not-claimed` boundary. |

> **The decisive constraint.** Because `uid` is **app-local and deliberately non-correlatable**,
> a *global* "Pioneer contribution profile" spanning many apps **cannot be assembled from Pi
> platform primitives alone.** A developer could only ever build a profile for **their own app's**
> consenting users, plus **self-declared** external evidence. This repo encodes that as a hard rule,
> not a footnote.

---

## The linkage rule (the hardest problem, stated honestly)

There are two very different things, and they must never be conflated:

| | What it means | Can you get it? |
|---|---|---|
| **Consented linkage** | "this app-`uid` consented to share X with *my* app" | ✅ Yes — via `Pi.authenticate` + `/me` |
| **Proven identity linkage** | "this app-`uid`, this GitHub account, and this wallet are the *same human*" | ❌ **No** — not provable from these primitives |

**Therefore:** the model treats every cross-source link as **`self-declared`** unless a
cryptographic proof exists (e.g. a signed message *from* the wallet/account being linked, which the
linker can verify but which the model itself does **not** perform — that is app-side logic, out of
scope here).

> **Invariant (enforced by test).** A `link` record is never labelled `verified`. The strongest
> allowed label for a cross-source account link is `self-declared`, and the model must surface that
> label wherever the linked evidence is used.

Everything else — the schema, the axes, the linkage rules, the threat model — is in
[`docs/`](docs/INDEX.md).

---

## Quick start

Requires **Node.js ≥ 20**. **No npm dependencies.**

```bash
# 1. Print the model: sources, trust levels, axes, invariants
node evidence.mjs --model

# 2. Print worked, NON-PERSONAL examples (synthetic data only)
node evidence.mjs --examples

# 3. Print what the model deliberately refuses to do (boundary audit)
node evidence.mjs --boundaries

# 4. Run the offline invariant suite (no network, no data)
node test/run.mjs
```

There is **nothing to install and nothing to run a server for.** This repo is a specification with
executable invariants, not a service.

---

## What this repository deliberately does **not** contain

To be unambiguous:

- **No database schema that stores a living person's data.** The proposed schema is in docs, marked
  *illustrative*, with retention/minimization rules — and no code that runs it.
- **No authentication code.** No tokens, no server key handling, no sessions.
- **No personal data.** Zero real profiles; examples are synthetic and clearly labelled.
- **No combined score.** By design (see the four axes).
- **No cross-app correlation.** By Pi's own design, and by this model's rule.
- **No claim to be official or endorsed.** This is an independent model.

If a future version ever adds *any* of the above, it belongs in a **different repository** with a
**different threat model**, not this one.

---

## Documentation

- [`docs/INDEX.md`](docs/INDEX.md) — index of everything here
- [`docs/MODEL.md`](docs/MODEL.md) — the data model: sources, trust levels, axes, evidence schema
- [`docs/LINKAGE.md`](docs/LINKAGE.md) — what can and cannot be linked, and why
- [`docs/THREAT-MODEL.md`](docs/THREAT-MODEL.md) — how the model can be gamed, and the invariants that resist it
- [`docs/REVIEW-OF-PROPOSAL.md`](docs/REVIEW-OF-PROPOSAL.md) — a measured review of the common "contribution profile" proposal
- [`docs/ETHICS.md`](docs/ETHICS.md) — consent, minimization, deletion, and the line we refuse to cross
- [`docs/SOURCES.md`](docs/SOURCES.md) — every official source, with status
- [`llms.txt`](llms.txt) — one-line answers for agent consumption

## Related repositories

- [`pi-user-behavior`](https://github.com/aybvip/pi-user-behavior) — what the chain can and cannot show
- [`pi-fungibility`](https://github.com/aybvip/pi-fungibility) — the native asset carries no per-unit origin
- [`pi-fixed-supply`](https://github.com/aybvip/pi-fixed-supply) — `totalCoins` is fixed

## License

MIT. See [`LICENSE`](LICENSE).

## Scope

- **Read-only, offline.** The code here makes **no network calls at all**.
- **Unofficial.** Not affiliated with Pi Network. Not an official contribution system.
- **No claim** about price, identity, intent, rewards, or any person's actual contributions.
