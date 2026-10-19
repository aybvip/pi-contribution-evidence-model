#!/usr/bin/env node
// evidence.mjs — print the model, its examples, and its boundaries.
//
// Read-only, offline, zero-dependency. Makes NO network calls and holds NO personal data.
//
// Usage:
//   node evidence.mjs --model
//   node evidence.mjs --examples
//   node evidence.mjs --boundaries
//   node evidence.mjs --help

import {
  SOURCES, AXES, PI_CAPABILITIES, INVARIANTS, BOUNDARIES, EXAMPLES, FORBIDDEN, TRUST_LEVELS,
} from "./lib.mjs";

const out = (s = "") => process.stdout.write(s + "\n");
const rule = (t) => out(`\n=== ${t} ===`);

function help() {
  out("pi-contribution-evidence-model — the model, offline");
  out("");
  out("  node evidence.mjs --model       sources, trust levels, axes, invariants");
  out("  node evidence.mjs --examples    worked synthetic (non-personal) examples");
  out("  node evidence.mjs --boundaries  what the model refuses to do");
  out("  node evidence.mjs --help        this help");
  out("");
  out("No network. No personal data. No combined score.");
}

function model() {
  rule("EVIDENCE SOURCES");
  for (const s of SOURCES) {
    out(`  [${s.trust.padEnd(18)}] ${s.id.padEnd(14)} ${s.name}`);
    out(`      proves:        ${s.proves}`);
    out(`      cannot prove:  ${s.cannotProve}`);
    if (s.requires) out(`      requires:      ${s.requires}`);
  }

  rule("TRUST LEVELS (strongest first)");
  out("  " + TRUST_LEVELS.join("  >  "));

  rule("THE FOUR INDEPENDENT AXES (never collapsed into one number)");
  for (const a of AXES) {
    out(`  [${a.id}] ${a.name}`);
    out(`      question:  ${a.question}`);
    out(`      source:    ${a.primarySource}`);
    out(`      counts:    ${a.counts}`);
    out(`      NOT:       ${a.explicitlyNot}`);
  }

  rule("PI PLATFORM CAPABILITIES (measured from official docs)");
  for (const c of PI_CAPABILITIES) {
    out(`  [${c.id}] ${c.what}`);
    out(`      source: ${c.source}`);
    out(`      limit:  ${c.limit}`);
  }

  rule("INVARIANTS (the model's constitution)");
  for (const i of INVARIANTS) {
    out(`  [${i.id}] ${i.rule}`);
    out(`        why: ${i.why}`);
  }

  rule("FORBIDDEN OPERATIONS (must not exist)");
  for (const f of FORBIDDEN) out(`  x ${f}()`);
}

function examples() {
  rule("WORKED EXAMPLES — SYNTHETIC, NON-PERSONAL");
  for (const e of EXAMPLES) {
    out(`  account: ${e.account}   (${e.label})`);
    for (const k of ["A", "B", "C", "D"]) out(`      ${k}: ${e.axes[k]}`);
    out(`      reading: ${e.reading}`);
    out("");
  }
  out("  These are constructed to contrast 'activity' with 'contribution'.");
  out("  They contain no real user, address, uid, or handle.");
}

function boundaries() {
  rule("WHAT THIS MODEL REFUSES TO DO");
  for (const b of BOUNDARIES) out(`  - ${b}`);
  out("");
  out("  These are enforced by the invariant tests in test/run.mjs, not merely stated.");
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h") || args.length === 0) help();
else if (args.includes("--model")) model();
else if (args.includes("--examples")) examples();
else if (args.includes("--boundaries")) boundaries();
else {
  out(`unknown option: ${args.join(" ")}`);
  out("try: node evidence.mjs --help");
  process.exitCode = 2;
}
