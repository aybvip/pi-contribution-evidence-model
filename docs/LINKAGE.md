# Linkage — what can and cannot be joined, and why

The single hardest problem in any "contribution profile" is **identity linkage**: proving that two
accounts are *the same human*. This page states exactly what is possible, measured from official Pi
documentation, and what the model therefore forbids.

---

## 1. Two very different things, never conflated

| Term | Meaning | Obtainable? |
|---|---|---|
| **Consented linkage** | "this app-`uid` consented to share X with *my* app" | ✅ Yes — `Pi.authenticate` + `GET /v2/me` |
| **Proven identity linkage** | "this app-`uid`, this GitHub account, and this wallet are the *same human*" | ❌ **No** — not provable from these primitives |

Consented linkage is a *session-level* fact. Proven identity linkage is an *identity* claim. They
look similar and are not.

---

## 2. The decisive facts (quoted, official)

From the official **Pi Sign-in** developer guide:

> "**`uid`** is **app-specific** and stable per user **for your app**. The same Pi user gets a
> different `uid` in a different app, so **two apps cannot correlate the same person**."

From the official **SDK / Platform API reference**:

> "`uid` — An **app-local** identifier for the user. It is specific to this user and this app. It
> will **change if the user revokes the permissions** they granted to your app."

And, on what a backend may read:

> "Retrieve the user's information, **including user information limited to what the user has
> consented to share** with your app." (`GET /me`, Access-token authorization)

**Consequences:**

1. `uid` is **not a global person id**. It is a per-app pseudonym that can change.
2. **Cross-app correlation is blocked by design** — not by a missing endpoint, but by intent.
3. There is **no developer scope** for KYC, real-world identity, or other apps' activity.

---

## 3. So how can *anything* be linked?

Only in one of these ways, and the model labels them by strength:

| Method | Strength | Notes |
|---|---|---|
| **Consented app session** | `platform-verified` (within one app) | proves a consenting Pioneer used *your* app |
| **Self-declared link** ("this GitHub is mine") | `self-declared` | an assertion; never upgraded by the model |
| **Cryptographic proof** (user signs a challenge from the wallet/account being linked) | `platform-verified` *for that link* | app-side logic; **out of scope** for this repo |
| **Cross-app correlation by a third party** | — | **not attempted**; it is a privacy violation, not a feature |

> **Model rule (I2).** A cross-source account link is **at most `self-declared`**. The model never
> labels a link `verified`. `validateEvidence()` rejects any linked item claiming more than
> `self-declared`, and the invariant suite asserts it.

---

## 4. Why the model refuses cryptographic linking *here*

Cryptographic linking is *technically possible* (a user can sign a nonce with a Stellar-style key
pair, or OAuth-authorize a git account). But doing it means:

- handling key material or OAuth secrets,
- operating a challenge/verify service,
- holding a durable identity table.

All three are **outside a specification repo**. They belong in an app, under the app's own threat
model. The model *names* the method and its strength, and stops there — which keeps this repository
free of secrets and personal data.

---

## 5. The honest conclusion

A **global** "Pioneer contribution profile" that spans many apps **cannot be assembled from Pi
platform primitives alone**, because Pi deliberately makes the same person unlinkable across apps.

What *is* buildable, honestly:

- a profile for **your own app's** consenting users (axes A/B via self-declared git + C via your own
  events + D as evidence strength), **or**
- a **per-app, consented, non-correlated** view — which is exactly what Pi's design permits.

Anything that claims more is claiming to have **defeated Pi's own privacy design**. That is the line
this model refuses to cross, and states so in [`ETHICS.md`](ETHICS.md) and the invariant tests.
