# Documentation index — pi-contribution-evidence-model

Reference specification for a **contribution evidence layer**, with executable invariants. Holds no
data, makes no network calls, and produces no combined score.

## Start here

| Document | What it answers |
|---|---|
| [`../README.md`](../README.md) | Overview, why it is separate from `pi-user-behavior`, quick start |
| [`MODEL.md`](MODEL.md) | The evidence item, four axes, Pi capabilities, reference flow |
| [`LINKAGE.md`](LINKAGE.md) | What can and cannot be linked, with official quotes |
| [`THREAT-MODEL.md`](THREAT-MODEL.md) | Attacks and the invariants that resist them |
| [`ETHICS.md`](ETHICS.md) | Consent, minimization, and the line we refuse to cross |
| [`REVIEW-OF-PROPOSAL.md`](REVIEW-OF-PROPOSAL.md) | Measured review of the "Pioneer Contribution Profile" proposal |
| [`SOURCES.md`](SOURCES.md) | Every source, with status |

## The model at a glance

| # | Concept | Value |
|---|---|---|
| Trust levels | strongest first | `on-chain` › `platform-verified` › `self-declared` › `unverified` |
| Axes | independent, never combined | A technical · B utility · C activity · D evidence strength |
| Cross-source links | strongest allowed label | `self-declared` |
| Combined score | exposed? | **No** (invariant I1) |

## Commands

| Command | Prints |
|---|---|
| `node evidence.mjs --model` | sources, trust levels, axes, Pi capabilities, invariants |
| `node evidence.mjs --examples` | synthetic (non-personal) worked examples |
| `node evidence.mjs --boundaries` | what the model refuses to do |
| `node test/run.mjs` | the offline invariant suite |

## The invariants

- **I1** — No combined score.
- **I2** — Cross-source links are at most `self-declared`.
- **I3** — Every evidence item has six mandatory fields.
- **I4** — A claim never exceeds its source's trust.
- **I5** — Activity is never reported as contribution.
- **I6** — No personal data, KYC, or secrets stored here.
- **I7** — No cross-app correlation.

## Related repositories

- [`pi-user-behavior`](https://github.com/aybvip/pi-user-behavior) — what the chain can and cannot show
- [`pi-fungibility`](https://github.com/aybvip/pi-fungibility) · [`pi-fixed-supply`](https://github.com/aybvip/pi-fixed-supply)
