// test/model.test.mjs — offline invariant tests. No network. No personal data.
import {
  SOURCES, AXES, PI_CAPABILITIES, INVARIANTS, BOUNDARIES, EXAMPLES, FORBIDDEN,
  TRUST_LEVELS, REQUIRED_EVIDENCE_FIELDS, trustOf, trustRank, validateEvidence,
} from "../lib.mjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

let pass = 0;
let fail = 0;
const failures = [];

function ok(cond, label) {
  if (cond) { pass++; return; }
  fail++;
  failures.push(label);
}
function eq(a, b, label) {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; return; }
  fail++;
  failures.push(`${label}\n    expected: ${B}\n    actual:   ${A}`);
}

// --- sources and trust -----------------------------------------------------
eq(TRUST_LEVELS[0], "on-chain", "strongest trust level is on-chain");
ok(!TRUST_LEVELS.includes("verified-identity"), "there is no 'verified-identity' trust level");
for (const s of SOURCES) {
  ok(TRUST_LEVELS.includes(s.trust), `source ${s.id} has a known trust level`);
  ok(s.proves && s.cannotProve, `source ${s.id} states both what it proves and cannot prove`);
}
eq(trustOf("self-declared"), "self-declared", "self-declared source maps to self-declared trust");
eq(trustOf("nonsense"), "unverified", "unknown source degrades to unverified");
ok(trustRank("on-chain") < trustRank("platform-verified"), "on-chain outranks platform-verified");
ok(trustRank("platform-verified") < trustRank("self-declared"), "platform-verified outranks self-declared");
ok(trustRank("self-declared") < trustRank("unverified"), "self-declared outranks unverified");

// --- axes ------------------------------------------------------------------
eq(AXES.map((a) => a.id), ["A", "B", "C", "D"], "there are exactly four axes A-D");
for (const a of AXES) {
  ok(a.explicitlyNot, `axis ${a.id} states what it is NOT`);
  ok(a.question && a.counts && a.primarySource, `axis ${a.id} is fully specified`);
}
// I5: activity is never contribution
const axisC = AXES.find((a) => a.id === "C");
ok(/activity is not contribution/i.test(axisC.explicitlyNot), "I5: axis C explicitly says activity != contribution");

// --- Pi capabilities: the decisive limits ----------------------------------
const byId = Object.fromEntries(PI_CAPABILITIES.map((c) => [c.id, c]));
ok(/IMPOSSIBLE BY DESIGN/.test(byId.P5.limit), "P5: cross-app correlation is impossible by design");
ok(/NOT AVAILABLE/.test(byId.P6.limit), "P6: KYC identity is not available to developers");
ok(/NOT AVAILABLE/.test(byId.P7.limit), "P7: other apps' activity is not available");
ok(/app-specific|app-local/.test(byId.P1.limit), "P1: uid is app-specific");
ok(/expires|3600/.test(byId.P1.limit), "P1: token is short-lived");

// --- evidence validation ---------------------------------------------------
const good = {
  source: "git", trust: "platform-verified", verifiedBy: "GitHub API: merged PR #1",
  provenance: ["self-declared:pi->github"], observedAt: "2026-10-19", uniqueKey: "gh:owner/repo#1",
};
ok(validateEvidence(good).ok, "a complete, correctly-levelled evidence item validates");

for (const f of REQUIRED_EVIDENCE_FIELDS) {
  const broken = { ...good };
  delete broken[f];
  ok(!validateEvidence(broken).ok, `missing '${f}' is rejected`);
}

// I4: a claim may not exceed its source's trust
ok(!validateEvidence({ ...good, trust: "on-chain" }).ok, "I4: git evidence cannot claim on-chain trust");
// I2: linked evidence is at most self-declared
ok(!validateEvidence({ ...good, source: "self-declared", trust: "platform-verified" }).ok,
  "I2/I4: self-declared source cannot carry platform-verified trust");
ok(validateEvidence({ ...good, source: "self-declared", trust: "self-declared", linked: true, uniqueKey: "u" }).ok,
  "I2: a self-declared link validates at self-declared level");
ok(!validateEvidence({ ...good, linked: true }).ok, "I2: linked evidence can never be platform-verified");
ok(!validateEvidence({ ...good, trust: "totally-real" }).ok, "an unknown trust level is rejected");

// --- invariants and forbidden operations -----------------------------------
ok(INVARIANTS.length >= 7, "there are at least seven invariants");
const invText = INVARIANTS.map((i) => i.rule + " " + i.why).join(" ");
ok(/combined score/i.test(invText), "I1 mentions refusing a combined score");
ok(/self-declared/i.test(invText), "I2 mentions the self-declared link cap");
ok(/personal data/i.test(invText), "I6 mentions personal data");
ok(/cross-app/i.test(invText), "I7 mentions cross-app correlation");

// I1/I6/I7 enforced structurally: no combined score API exists in the module
const libSrc = readFileSync(join(root, "lib.mjs"), "utf8");
for (const f of FORBIDDEN) {
  ok(!new RegExp(`export\\s+(function|const)\\s+${f}\\b`).test(libSrc), `I1: no exported ${f}()`);
}
// The library must not make network calls or touch the filesystem for data.
ok(!/\bfetch\s*\(/.test(libSrc), "lib.mjs makes no network calls");
ok(!/require\(|createServer|listen\(/.test(libSrc), "lib.mjs starts no server");

// --- examples are synthetic and non-personal --------------------------------
ok(EXAMPLES.length >= 2, "there are worked examples");
for (const e of EXAMPLES) {
  ok(/SYNTHETIC/.test(e.label), `example ${e.account} is labelled SYNTHETIC`);
  ok(!/\bG[A-Z2-7]{55}\b/.test(JSON.stringify(e)), `example ${e.account} contains no Stellar-style address`);
  ok(!/@/.test(JSON.stringify(e)), `example ${e.account} contains no email/handle`);
}

// --- boundaries are non-empty and specific ---------------------------------
ok(BOUNDARIES.length >= 5, "there are at least five stated boundaries");
ok(BOUNDARIES.some((b) => /real contributor/i.test(b)), "boundary: will not name a 'real contributor'");
ok(BOUNDARIES.some((b) => /KYC/i.test(b)), "boundary: will not read or infer KYC");
ok(BOUNDARIES.some((b) => /money|wallet/i.test(b)), "boundary: no authority over money/wallet");

// --- documentation consistency ---------------------------------------------
for (const rel of ["README.md", "llms.txt", "docs/MODEL.md", "docs/LINKAGE.md", "docs/THREAT-MODEL.md", "docs/ETHICS.md", "docs/REVIEW-OF-PROPOSAL.md"]) {
  let src;
  try { src = readFileSync(join(root, rel), "utf8"); } catch { failures.push(`${rel} is missing`); fail++; continue; }
  ok(src.length > 200, `${rel} has content`);
}
const llms = readFileSync(join(root, "llms.txt"), "utf8");
ok(/self-declared/.test(llms), "llms.txt states the self-declared link rule");
ok(/combined score/i.test(llms), "llms.txt states the no-combined-score rule");

console.log("pi-contribution-evidence-model — invariant tests");
console.log(`  pass: ${pass}`);
console.log(`  fail: ${fail}`);
if (fail > 0) {
  console.log("\nFAILURES:");
  for (const f of failures) console.log("  - " + f);
  process.exitCode = 1;
}
