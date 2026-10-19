// lib.mjs — the model, as pure data + pure helpers. No network. No personal data.
//
// This file is the single source of truth for:
//   - the evidence sources and their trust levels
//   - the four independent axes (never combined)
//   - the Pi-platform capability table (measured from official docs)
//   - the invariants that stop the model from overclaiming

// ---------------------------------------------------------------------------
// 1. Evidence sources and trust levels
// ---------------------------------------------------------------------------

/** Trust levels, strongest first. A contribution claim may never exceed its source's level. */
export const TRUST_LEVELS = ["on-chain", "platform-verified", "self-declared", "unverified"];

export const SOURCES = [
  {
    id: "chain",
    name: "Pi blockchain (read-only)",
    trust: "on-chain",
    proves: "that a transaction/operation occurred, with time and amounts",
    cannotProve: "who intended what, whether it was a contribution, or any identity link",
  },
  {
    id: "app-events",
    name: "Participating app's own signed events",
    trust: "platform-verified",
    proves: "that the app's server recorded an action for an app-local uid",
    cannotProve: "anything about the same person in another app",
    requires: "app-side signing + replay protection (threat model)",
  },
  {
    id: "pi-platform",
    name: "Pi Platform API (consented identity)",
    trust: "platform-verified",
    proves: "that a session belongs to a consenting Pioneer, and which scopes were granted",
    cannotProve: "KYC identity, other apps' activity, or any cross-app correlation",
    requires: "backend verification of the access token via GET /v2/me",
  },
  {
    id: "git",
    name: "Git platform API (GitHub or similar)",
    trust: "platform-verified",
    proves: "that an account authored/merged/reviewed a specific commit or PR",
    cannotProve: "that the account belongs to a specific Pi user (that link is self-declared)",
    requires: "the platform's own API; account ownership of the git identity is out of band",
  },
  {
    id: "self-declared",
    name: "Self-declared profile links",
    trust: "self-declared",
    proves: "that a user asserted a link (e.g. 'this GitHub is mine')",
    cannotProve: "that the assertion is true",
    requires: "explicit consent; never upgraded to verified by the model",
  },
];

export const trustOf = (id) => SOURCES.find((s) => s.id === id)?.trust ?? "unverified";

/** Strictness ordering: index 0 is strongest. */
export const trustRank = (level) => {
  const i = TRUST_LEVELS.indexOf(level);
  return i === -1 ? TRUST_LEVELS.length : i;
};

// ---------------------------------------------------------------------------
// 2. The four independent axes (never collapsed)
// ---------------------------------------------------------------------------

export const AXES = [
  {
    id: "A",
    name: "Technical contribution",
    question: "Did this account build, fix, review, or document something, and was it accepted?",
    primarySource: "git",
    counts: "merged PRs, accepted reviews, released artifacts",
    explicitlyNot: "raw commit count (noise, automated commits, trivial changes)",
  },
  {
    id: "B",
    name: "Ecosystem utility",
    question: "Did what they built actually get used, or fix a documented problem?",
    primarySource: "git",
    counts: "downstream users, closed issues, dependents",
    explicitlyNot: "self-asserted importance",
  },
  {
    id: "C",
    name: "In-app activity",
    question: "Did this account do things inside a participating app?",
    primarySource: "app-events",
    counts: "completed actions recorded by the app",
    explicitlyNot: "developer quality — activity is not contribution",
  },
  {
    id: "D",
    name: "Evidence strength",
    question: "How trustworthy is A/B/C for this account?",
    primarySource: "pi-platform",
    counts: "provenance completeness, corroboration across independent sources",
    explicitlyNot: "a substitute for A/B/C content",
  },
];

// ---------------------------------------------------------------------------
// 3. Pi platform capabilities — measured from official docs, with the limit
// ---------------------------------------------------------------------------

export const PI_CAPABILITIES = [
  {
    id: "P1",
    what: "Authenticate a Pioneer and obtain an app-local uid + short-lived access token",
    source: "official SDK reference (Pi.authenticate)",
    limit: "uid is app-specific; token expires (~3600s) and there is no refresh token",
  },
  {
    id: "P2",
    what: "Verify a session and read only consented fields",
    source: "official Platform API (GET /v2/me, Bearer <access token>)",
    limit: "returns only UserDTO fields the user consented to share",
  },
  {
    id: "P3",
    what: "Read the user's Pi username",
    source: "official Platform API (username scope)",
    limit: "requires the username scope; it is a display handle, not a legal identity",
  },
  {
    id: "P4",
    what: "Read the user's wallet address (if consented)",
    source: "official docs (wallet_address scope)",
    limit: "an address, not a proven identity link to a git account",
  },
  {
    id: "P5",
    what: "Cross-correlate the same person across two different apps",
    source: "(no such capability)",
    limit: "IMPOSSIBLE BY DESIGN — docs: 'two apps cannot correlate the same person'",
  },
  {
    id: "P6",
    what: "Read KYC identity, sanctions, or verified real-world identity",
    source: "(no public developer scope)",
    limit: "NOT AVAILABLE to third-party developers",
  },
  {
    id: "P7",
    what: "Read a user's activity inside other apps",
    source: "(no such capability)",
    limit: "NOT AVAILABLE — each app sees only its own events",
  },
];

// ---------------------------------------------------------------------------
// 4. Evidence schema (six required fields) — validated by `validateEvidence`
// ---------------------------------------------------------------------------

export const REQUIRED_EVIDENCE_FIELDS = [
  "source",       // which SOURCES id
  "trust",        // must equal trustOf(source)
  "verifiedBy",   // the exact check performed
  "provenance",   // which account link(s) it depends on
  "observedAt",   // when it was observed
  "uniqueKey",    // what prevents double counting
];

/**
 * Validate a single evidence item. Returns { ok, errors[] }.
 * Enforces: all six fields present; trust matches the declared source;
 * a self-declared source can never carry a stronger trust than "self-declared";
 * and any linked (cross-source) evidence must not be stronger than "self-declared".
 */
export function validateEvidence(item) {
  const errors = [];
  if (!item || typeof item !== "object") return { ok: false, errors: ["evidence is not an object"] };

  for (const f of REQUIRED_EVIDENCE_FIELDS) {
    if (item[f] === undefined || item[f] === null || item[f] === "") errors.push(`missing field: ${f}`);
  }

  if (item.source !== undefined) {
    if (typeof trustOf(item.source) === "undefined") errors.push(`unknown source: ${item.source}`);
    else if (item.trust !== trustOf(item.source)) {
      errors.push(`trust mismatch: source '${item.source}' is '${trustOf(item.source)}', item claims '${item.trust}'`);
    }
  }

  // A cross-source link is at most self-declared.
  if (item.linked === true && item.trust !== "self-declared") {
    errors.push(`linked evidence must be 'self-declared', got '${item.trust}'`);
  }

  if (item.trust !== undefined && !TRUST_LEVELS.includes(item.trust)) {
    errors.push(`unknown trust level: ${item.trust}`);
  }

  return { ok: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// 5. The invariants — the model's constitution
// ---------------------------------------------------------------------------

export const INVARIANTS = [
  {
    id: "I1",
    rule: "No single combined score is produced.",
    why: "collapsing A/B/C/D hides the weighting and invites ranking people.",
  },
  {
    id: "I2",
    rule: "Cross-source account links are at most 'self-declared'.",
    why: "Pi uid is app-local; identity across sources is not provable from these primitives.",
  },
  {
    id: "I3",
    rule: "Every evidence item carries source, trust, verifiedBy, provenance, observedAt, uniqueKey.",
    why: "evidence without provenance is opinion.",
  },
  {
    id: "I4",
    rule: "A contribution claim may never exceed its source's trust level.",
    why: "self-asserted data cannot become verified by being stored.",
  },
  {
    id: "I5",
    rule: "Activity (axis C) is never reported as contribution (axis A).",
    why: "using an app is not building one.",
  },
  {
    id: "I6",
    rule: "No personal data, no KYC, no secrets are stored by this repo.",
    why: "the model must be examinable without holding anyone's data.",
  },
  {
    id: "I7",
    rule: "No cross-app correlation is attempted.",
    why: "Pi's design forbids it, and it would be a privacy violation, not a feature.",
  },
];

// ---------------------------------------------------------------------------
// 6. Boundaries — what the model refuses to do
// ---------------------------------------------------------------------------

export const BOUNDARIES = [
  "It does not answer 'who is a real contributor'.",
  "It does not verify that a GitHub account belongs to a Pi user.",
  "It does not read, infer, or approximate KYC / real-world identity.",
  "It does not combine the four axes into a ranking or a reward.",
  "It does not correlate a person across two different apps.",
  "It does not decide anything with authority over a user's money or wallet.",
];

/** The forbidden operation: any function that would combine axes into one number. */
export const FORBIDDEN = ["combinedScore", "rankPioneers", "contributionScore", "totalScore"];

// ---------------------------------------------------------------------------
// 7. Synthetic, non-personal examples (clearly labelled)
// ---------------------------------------------------------------------------

export const EXAMPLES = [
  {
    label: "SYNTHETIC — not a real person",
    account: "example-A",
    axes: {
      A: "no merged PRs on record",
      B: "—",
      C: "high recorded in-app activity",
      D: "activity is platform-verified within one app only",
    },
    reading: "active user of an app; NOT evidence of technical contribution",
  },
  {
    label: "SYNTHETIC — not a real person",
    account: "example-B",
    axes: {
      A: "three merged PRs, one accepted review",
      B: "a documented issue closed by their fix",
      C: "low in-app activity",
      D: "git evidence is platform-verified; the Pi<->git link is self-declared",
    },
    reading: "measurable technical contribution; the identity link remains unproven",
  },
];
