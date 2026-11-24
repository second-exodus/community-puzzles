# Source

- Original: security-audit, https://github.com/cloudflare/security-audit-skill/tree/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit
  (main file: https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/SKILL.md)
- Repository: cloudflare/security-audit-skill, commit c1c8a8c1471069fb0e188eeaff69b8e8db6564a8, read on 2026-11-24
- Author: Cloudflare, Inc. (copyright holder named in the licence)
- Licence: MIT (full text in LICENSE)

Files read and merged: `SKILL.md`, `RECONNAISSANCE.md`, `HUNTING.md`, `ATTACK-CLASSES.md`,
`VALIDATION-AND-REPORTING.md`, `report-schema.json`, and the domain companions `MEMORY-SAFETY-AND-BINARY.md`,
`AI-AND-LLM.md`, `WEB-PROTOCOL-AND-AUTH.md`, `CLIENT-SIDE.md`, `SUPPLY-CHAIN-AND-RELEASE.md`,
`CLOUD-AND-DEPLOYMENT.md`, `PROTOCOLS-RPC-AND-MESSAGING.md`, `RESOURCE-EXHAUSTION-AND-AVAILABILITY.md`,
`DATA-ISOLATION-AND-LIFECYCLE.md`, `DESKTOP-MOBILE-AND-LOCAL-IPC.md`, plus the repository `README.md`.

## Changes

- Merged the main skill and its 14 companion files (about 1,900 lines) into one SKILL.md under 500 lines, with the
  sections Goal and Steps; phases 1 to 6 became steps 1 to 10.
- Kept verbatim in substance: the two operating modes, the safety and sandbox rules, the reconnaissance questions, the
  hunting method, the candidate gate, the verifier brief, the three verdicts, the severity anchors, the ordinary attack
  classes and the anti-patterns (renamed "Red flags").
- Condensed each domain companion file into a short "lens": its core discipline plus a list of class names. The long
  per-class prompts, "Universal moves" and per-domain validation rules were shortened to that summary.
- Removed the Node validators (`validate-findings.cjs`, `validate-coverage-ledger.cjs` and their tests) and the JSON
  schema file; the record rules they enforce are now written out under "Findings records" and step 8.
- Replaced the descriptor-level artifact promotion procedure (no-follow, fstat, link-count checks) with one rule: copy
  out only expected regular files, size-limited, without following symlinks.
- Simplified the coverage ledger: dropped the percent-encoded `coverage_id` algorithm, the Windows device-name rule for
  agent IDs, the strict state table and the validator input limits; kept stable source-derived IDs, status values,
  attempts archive and work ordering.
- Simplified the budget arithmetic to its rules (reserve critics and validation before hunting, never exceed silently,
  incomplete when validation cannot be funded).
- Generalised vendor- and platform-specific terms: "Task tool", "`research`/`general` agent" and "subagent_type" became
  "a separate assistant session, a fresh reviewer or a person"; work can also run sequentially.
- Changed the default output folder from a home-directory path to `../<repo-name>-security-audit/run-<N>/`, relative to
  the project root.
- Removed installation instructions and the contact address from the README; kept the README's note that single runs
  find roughly half of what repeated runs find.
- Added `status: draft`, the portable front matter and an illustrative example report in `example/output.md`.
