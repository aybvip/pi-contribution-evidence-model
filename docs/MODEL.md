# The model

This is the reference specification for the **contribution evidence layer**. It is deliberately
*not* a database design for production, and it holds no data.

---

## 1. What an "evidence item" is

The atom of the model is not a *score* — it is an **evidence item**: a single, typed, sourced fact.

```jsonc
{
  "source":     "git",                          // which source (see §2)
  "trust":      "platform-verified",            // MUST equal the source's level
  "verifiedBy": "GitHub API: PR #123 merged",   // the exact check performed
  "provenance": ["self-declared: pi->github"],  // which account link(s) it rests on
  "observedAt": "2026-10-19T00:00:00Z",         // when it was observed
  "uniqueKey":  "gh:owner/repo#123",            // what stops double counting
  "linked":     true,                           // optional: rests on a cross-source link
}
```

**All six fields are mandatory.** `validateEvidence()` in `lib.mjs` rejects any item missing one of
them, any item whose `trust` does not equal its source's level, and any linked item claiming more
than `self-declared`. The invariant test suite enforces this.

---

## 2. Sources and trust levels

Trust levels, strongest first: **`on-chain` › `platform-verified` › `self-declared` › `unverified`**.

| Source id | What it is | Trust | Proves | Cannot prove |
|---|---|---|---|---|
| `chain` | Pi blockchain (read-only) | `on-chain` | a tx/op occurred, with time and amounts | who intended what; any identity link |
| `pi-platform` | Pi Platform API (consented identity) | `platform-verified` | a session belongs to a consenting Pioneer; which scopes were granted | KYC; other apps' activity; cross-app correlation |
| `git` | Git platform API | `platform-verified` | an account authored/merged/reviewed something | that the account is a specific Pi user |
| `app-events` | A participating app's own signed events | `platform-verified` | the app recorded an action for an app-local `uid` | anything about the same person in another app |
| `self-declared` | User-asserted links | `self-declared` | that a link was asserted | that the assertion is true |

**Rule:** a contribution claim may **never exceed** its source's trust level. Storing a
self-asserted fact does not make it verified.

---

## 3. The four axes

The model reports **four independent axes** and never combines them:

| Axis | Name | Primary source | Counts | Explicitly NOT |
|---|---|---|---|---|
| **A** | Technical contribution | `git` | merged PRs, accepted reviews, releases | raw commit count |
| **B** | Ecosystem utility | `git` | downstream users, closed issues, dependents | self-asserted importance |
| **C** | In-app activity | `app-events` | completed app actions | developer quality |
| **D** | Evidence strength | `pi-platform` | provenance completeness, corroboration | a substitute for A/B/C |

> **Why four and not one:** any single number requires a weighting. Hiding the weighting makes a
> judgement look like a measurement. Reporting the axes separately forces the weighting to be
> explicit and contestable.

The API deliberately exposes **no** `combinedScore()`, `rankPioneers()`, `contributionScore()`, or
`totalScore()`. The test suite asserts they do not exist.

---

## 4. Pi platform capabilities (what is actually possible)

Measured from official Pi developer documentation (see [`SOURCES.md`](SOURCES.md)):

| # | Capability | Limit that matters |
|---|---|---|
| P1 | Authenticate, get app-local `uid` + token | `uid` is **app-specific**; token expires (~3600s), no refresh |
| P2 | Verify session, read consented fields | only what the user consented to share (`GET /v2/me`) |
| P3 | Read Pi username | display handle, not legal identity |
| P4 | Read wallet address (if consented) | an address, not a proven identity link |
| **P5** | **Correlate the same person across two apps** | **IMPOSSIBLE BY DESIGN** |
| **P6** | **Read KYC / real-world identity** | **NOT AVAILABLE to third-party developers** |
| **P7** | **Read activity in other apps** | **NOT AVAILABLE** |

P5–P7 are the load-bearing facts. They mean a *global* contribution profile spanning many apps is
**not constructible from Pi platform primitives.** See [`LINKAGE.md`](LINKAGE.md).

---

## 5. Reference flow (for an app that wants this for *its own* users)

This is *illustrative* — no such service exists in this repository.

1. **Front-end**: `Pi.authenticate(scopes)` → send the `accessToken` to your backend.
2. **Backend**: `GET /v2/me` with `Bearer <accessToken>` → confirm `uid` + `credentials.scopes`.
   Never trust the front-end payload alone.
3. **Git evidence**: if the user *self-declares* a git account, fetch only *public* contribution
   facts and attach them as `self-declared`-rooted evidence.
4. **App events**: your own app records actions for `uid` with signed, replay-protected events.
5. **Assemble**: emit **four separate axis summaries** + the evidence list. Emit **no** combined
   score.

Every step after (1) is out of scope for this repository — it belongs in an app, under that app's
own threat model and privacy policy.

---

## 6. What changes if this ever becomes real

It must move to a **different repository** with:

- a threat model that includes *storage* (breach, retention, erasure),
- a legal/privacy review appropriate to the jurisdiction,
- a deletion path that actually deletes,
- and a policy that **never** turns the axes into a reward or a ranking with authority.

None of that is here, on purpose. This repo is the *model*, so it can be examined without holding
anyone's data.
