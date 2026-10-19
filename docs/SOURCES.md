# Sources

Every factual claim about Pi's platform on this repository rests on one of the sources below. Status
is marked explicitly. Where a fact is **measured**, the reproducing command is given.

---

## Official Pi developer documentation

| # | Source | Used for | Status |
|---|---|---|---|
| S1 | Pi Sign-in guide — `github.com/pi-apps/pi-platform-docs/blob/master/pi-sign-in.md` | `uid` is app-specific; "two apps cannot correlate the same person"; `GET /v2/me`; scopes; implicit flow | **Official** |
| S2 | Platform API reference — `docs.minepi.com/api-reference/PlatformAPI` | `/me` returns only consented fields; Server API Key rules; `UserDTO` | **Official** |
| S3 | Client SDK reference — `docs.minepi.com/api-reference/SdkReference` | `Pi.authenticate`; scopes (`username`, `payments`, `wallet_address`, `in_app_notifications`); `uid` changes on revoke; token lifetime | **Official** |
| S4 | Platform docs index — `github.com/pi-apps/pi-platform-docs` | SDK is front-end; payments require server-side approval/completion | **Official** |
| S5 | Pi Platform API — `GET https://api.minepi.com/v2/me` (Bearer access token) | The endpoint the model assumes for consented identity | **Official** |

## Official Pi policy / general

| # | Source | Used for | Status |
|---|---|---|---|
| S6 | `minepi.com/pioneer-code-of-conduct` | Behaviour is governed by policy, with account-level consequences | **Official policy** |
| S7 | `minepi.com/faqs/can-i-mine-from-more-than-one-device-…` | One-account-per-person; multi-pronged anti-Sybil method; method not public | **Official FAQ** |

## Sibling measurement repositories (this author)

| # | Source | Used for | Status |
|---|---|---|---|
| S8 | `github.com/aybvip/pi-user-behavior` | Layers B1–B7; what the chain can and cannot show | **Unofficial — independent measurement** |
| S9 | `github.com/aybvip/pi-fungibility` | The native asset carries no per-unit origin | **Unofficial — independent** |

---

## What is *measured* vs *quoted*

| Kind | Example | How to check |
|---|---|---|
| **Quoted** | "`uid` is app-specific" | open S1/S3 and read the line |
| **Structural** | "no combined-score function exists" | `node test/run.mjs` (invariant suite) |
| **Not claimed** | "this user is a real contributor" | the model defines no such output |

---

## Explicit non-sources

- **No third-party blog, wiki, or exchange page** is used for any capability claim about Pi.
- **No community assertion** about Pi's internal scoring is treated as fact.
- **No KYC data, personal data, or leaked material** is used anywhere in this repository.

If any source above changes, the model must be updated **with the new measurement** — the same rule
the sibling `pi-user-behavior` repo follows.
