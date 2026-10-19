# Verification

Everything here is **offline**. There is nothing to install, no API key, no account, and no data.

## 0. Requirements

```bash
node --version   # expect v20 or newer
```

## 1. Run the invariant suite (no network)

```bash
node test/run.mjs
```

Expected: all tests pass, `fail: 0`. This suite enforces the model's constitution:

- no combined-score function is exported (I1),
- every evidence item has the six mandatory fields (I3),
- a claim cannot exceed its source's trust (I4),
- linked evidence is at most `self-declared` (I2),
- axis C explicitly says activity is not contribution (I5),
- `lib.mjs` makes no network calls and starts no server (I6),
- the capability table marks cross-app correlation as impossible by design (I7/P5).

## 2. Inspect the model

```bash
node evidence.mjs --model
```

Prints sources and trust levels, the four axes, the Pi capability table (with limits), and the
invariants. Every "limit" line is the point: e.g. P5 reads *IMPOSSIBLE BY DESIGN*.

## 3. See the boundaries

```bash
node evidence.mjs --boundaries
```

Prints what the model refuses to do (name a "real contributor", read KYC, correlate across apps,
combine axes, touch money).

## 4. Examples

```bash
node evidence.mjs --examples
```

Two **synthetic** accounts contrasting high activity with measurable technical contribution. They
contain no real uid, address, handle, or person.

## What you should *not* find

- Any stored profile, database, or personal data.
- Any function returning a single contribution number.
- Any cross-app identity join.
- Any network call.

If any of these appears, this repository has violated its own invariants.
