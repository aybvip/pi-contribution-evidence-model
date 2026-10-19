# Review of the "Pioneer Contribution Profile" proposal

A proposal circulated for developing `pi-user-behavior` into a system that collects a Pi identity,
GitHub activity, an external app-activity database, and on-chain data, and turns them into a
"contribution profile". This page reviews it **item by item against official Pi documentation**.

The tone is deliberate: the proposal is **mostly thoughtful** and gets several things right. But it
contains **one decisive technical error** that changes what is buildable. We state both.

---

## 1. What the proposal gets right

| Point | Verdict |
|---|---|
| "The blockchain shows *what* happened, not *why*" | ✅ Correct — same conclusion as `pi-user-behavior` |
| "An external database does not replace the chain; each source proves a different thing" | ✅ Correct, and good design |
| "Do not reward commit volume; commits can be trivial or automated" | ✅ Correct |
| "Linking two accounts ≠ proving all activity in both was the same person" | ✅ Correct, and the crux |
| "Never store passwords, seed phrases, or KYC data" | ✅ Correct, and important |
| "Keep it read-only at first, with no authority over money/wallets" | ✅ Correct |

These are real strengths, and this repository adopts them as invariants.

---

## 2. The decisive error: `uid` is app-local and non-correlatable

The proposal treats "the Pioneer's identity" as something a system can hold once and join to GitHub
and to "all Pi apps". Official Pi documentation says the opposite:

> "**`uid`** is **app-specific** … The same Pi user gets a different `uid` in a different app, so
> **two apps cannot correlate the same person**." — Pi Sign-in guide

> "`uid` … It will **change if the user revokes the permissions** they granted to your app."
> — SDK / Platform API reference

**Consequences the proposal misses:**

1. **A global profile spanning apps is not constructible** from Pi platform primitives. Not
   "difficult" — blocked by design (this repo's capability **P5**).
2. **GitHub identity is never proven** by Pi. Any Pi↔GitHub link is **self-declared** (invariant
   **I2**), because there is no developer scope tying a git account to a `uid`.
3. **KYC is unavailable** to third-party developers (capability **P6**). The proposal never claims
   to read KYC directly, but a "contribution profile" can *imply* verified personhood that the
   developer cannot actually verify.
4. **Other apps' activity is unavailable** (capability **P7**). Each app sees only its own events.

---

## 3. Point-by-point, proposal item vs. official reality

| Proposal item | Official reality | Model treatment |
|---|---|---|
| "A. Profile & Identity — the Pi id the user consented to share" | `uid` is app-local and can change | Keep as app-local session id; never a global person-id |
| "B. Developer Contributions — GitHub projects, commits, PRs" | git API proves the *git* account's work; not its link to a Pi user | Axis **A**, rooted at a **self-declared** link |
| "C. App Activity Database — real activity across participating apps" | each app sees only its own `uid` and events | Axis **C**, **per app**, never merged across apps |
| "D. On-chain Evidence — transactions linkable to documented data" | the chain proves tx existence, not intent or contribution | Source `chain` at `on-chain` trust; never a contribution verdict |
| "Four separate indicators instead of one number" | — | ✅ Adopted directly: the **four axes** |
| "Contribution Analysis Engine / quality scoring / confidence level" | — | ⚠️ Reduced to **evidence strength (D)** only; **no** combined score (invariant **I1**) |
| PostgreSQL schema with `pioneer_profiles`, `consent_log`, etc. | — | ❌ **Not in this repo.** Named as *illustrative* in `MODEL.md` §6; real data belongs elsewhere |
| "Human review for hard cases" | — | ✅ Adopted: named as unavoidable in the threat model |

---

## 4. The privacy problem the proposal understates

The proposal says "with the user's consent" — necessary, but not sufficient. A system that

- holds a durable identity table,
- joins a Pi session to a GitHub account,
- joins both to app activity,

creates a **re-identification risk** that consent alone does not neutralise: the *aggregate* can name
a person across contexts Pi deliberately kept separate. That is why this model:

- keeps links at **`self-declared`** (I2),
- refuses **cross-app correlation** (I7),
- refuses a **combined score** (I1),
- and keeps **no data at all** (I6).

---

## 5. Verdict

- **As a direction**, the proposal is sound: evidence over opinion, multiple sources, human review,
  no naive scoring.
- **As a "global Pioneer profile"**, it is **not buildable** from Pi's platform primitives, because
  Pi makes people unlinkable across apps on purpose.
- **As an ethical matter**, the safest form of the idea is exactly what this repo is: **a model with
  invariants, holding no data** — plus, if you want to reward contribution, do it *per-repo* or
  *inside your own app*, where consent and scope are actually meaningful.

The most useful thing the proposal produced is the *conversation about linkage*. That conversation
ends with: **you can build a profile for your own app's users; you cannot build one for the person.**

---

## Sources

- Pi Sign-in (official): `pi-apps/pi-platform-docs` → `pi-sign-in.md`
- Platform API reference (official): `docs.minepi.com/api-reference/PlatformAPI`
- SDK reference (official): `docs.minepi.com/api-reference/SdkReference`
- Related: [`LINKAGE.md`](LINKAGE.md) · [`ETHICS.md`](ETHICS.md) · [`MODEL.md`](MODEL.md)
