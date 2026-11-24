---
name: threat-model
description: Builds a threat model grounded in the repository itself (components, trust boundaries, assets, attacker capabilities, concrete abuse paths, prioritised threats and mitigations) and writes it to one Markdown file after checking key assumptions with the person. Triggered by "threat model this repo", "threat model this service", "enumerate abuse paths", "AppSec threat modeling".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: security
---

# Threat Model

## Goal

Deliver an actionable, AppSec-grade threat model that is specific to this repository (or one path in it), not a generic
checklist. Anchor every architectural claim to evidence in the repository, keep assumptions explicit, and prioritise
realistic attacker goals and concrete impacts over generic vulnerability lists.

Use it only when someone explicitly asks to threat model a codebase or path, to enumerate threats or abuse paths, or for
AppSec threat modeling. Do not use it for general architecture summaries, code review or non-security design work.

## Rules

Grounding:

- Do not invent components, data stores, endpoints, flows or controls.
- Back every architectural claim with at least one evidence anchor: a repository path plus a symbol name, config key or
  short quoted snippet. Use one or two anchors per major claim; do not dump every match.
- If information is missing, state the assumption explicitly and list the open question that would validate it.
- Never output secrets. If you find tokens, keys or passwords, redact them and describe only their presence and location.

Scope discipline:

- Separate production/runtime behaviour from CI/build/dev tooling and from tests and examples.
- Separate attacker-controlled inputs from operator-controlled and developer-controlled inputs.
- If a vulnerability class needs attacker control that this repository's real usage does not give, say so and downgrade.

Writing:

- Write for AppSec engineers: concise, specific, precise terminology. Include mitigations and residual risk.
- Summarise documentation instead of restating it, and point to evidence.

## Steps

1. **Collect inputs.** Ask for, or infer and mark as assumptions:
   - repository root and in-scope paths; out-of-scope items;
   - intended usage, deployment model, internet exposure, data sensitivity, authentication and authorisation
     expectations;
   - any existing repository summary or architecture document.
2. **Discover the repository (evidence collection).** Search text files only (skip binaries).
   - Shape: languages and frameworks; how it runs (server, CLI, library, worker); entry points; build artifacts.
   - Security-relevant surfaces and controls:
     - network listeners, routes, endpoints, RPC handlers, message consumers;
     - authentication, session and token handling, authorisation checks, RBAC/ACL logic;
     - parsing, serialisation and deserialisation (JSON, YAML, XML, protobuf), template rendering, eval or dynamic code;
     - file upload and read paths, archive extraction, image and document parsing;
     - database, queue and cache clients and query construction;
     - secrets and config loading, environment variables, key management;
     - HTTP clients that can be pointed at URLs (SSRF), webhooks, URL fetchers;
     - sandboxing and isolation, privilege boundaries, subprocess execution;
     - logging, auditing and error handling paths;
     - CI/build/release: pipelines, dependency management, artifact publishing.
   - Adapt to the project type. Web apps: where requests enter and how data is parsed, routed, authenticated and
     stored. CLIs: arguments, files, environment variables and stdin. Network daemons: ports, protocols, message formats,
     request handling. Low-level components: memory corruption and logic flaws that could lead to local privilege
     escalation or remote code execution.
   - Ask yourself: where does user input originate, how is untrusted data parsed and validated, which security
     assumptions must hold, and where are the likely choke points for security bugs?
3. **Build the system model.** List the primary components (runtime, plus critical build/CI components when relevant).
   Enumerate data flows and trust boundaries as concrete edges. For each boundary record: source and destination, data
   types crossing (credentials, personal data, files, tokens, prompts), channel or protocol (HTTP, gRPC, IPC, file,
   database), security guarantees (authentication, mTLS, origin checks, encryption, rate limits) and validation
   (schema enforcement, normalisation). Map the in-scope paths to components and name what is excluded.
4. **List assets and security objectives.** Data, credentials, integrity-critical state, availability-critical
   components, build artifacts. For each: why it matters (confidentiality, integrity, availability, compliance, user
   harm). See "Asset and control categories".
5. **Define the attacker model.** Capabilities: realistic attackers given the exposure and intended usage.
   Non-capabilities: what an attacker cannot plausibly do unless it is explicitly in scope, to avoid inflated severity.
6. **Enumerate threats as abuse paths.** Write attacker stories tied to entry points, trust boundaries and privileged
   components. Prefer multi-step abuse paths (attacker goal -> steps -> impact) over one-line generic threats. Map goals
   to assets: exfiltration, privilege escalation, integrity compromise, denial of service. Keep the list small and high
   quality.
7. **Prioritise.** For each threat: likelihood low/medium/high with a one- or two-sentence justification; impact
   low/medium/high with a one- or two-sentence justification; overall priority critical/high/medium/low from likelihood
   x impact, adjusted for existing controls. State which assumptions most affect the ranking.
8. **Check assumptions with the person (required before the final report).** List the key assumptions in 3 to 6
   bullets and ask 1 to 3 targeted questions about missing context: service owner and environment, scale and users,
   deployment model, authentication and authorisation, internet exposure, data sensitivity, multi-tenancy. Stop and
   wait for the answer. If the person cannot or does not answer, continue with explicit assumptions and mark the
   conclusions that depend on them as conditional.
9. **Recommend mitigations.** For each high or critical threat: existing mitigations with evidence anchors; gaps and
   weaknesses; recommended mitigations (code, config or process) tied to a concrete component, boundary or entry point
   and a control type (authorisation check, input validation, schema enforcement, sandboxing, rate limit, secrets
   isolation, audit logging); detection ideas (logs, metrics, alerts). Prefer specific implementation hints ("enforce
   the schema at the gateway for upload payloads") over generic advice ("validate inputs").
10. **Name focus paths.** 2 to 30 repository-relative files or directories that deserve manual security review, each
    with a one-sentence reason tied to the threat model.
11. **Run the quality check, then write the file.** Confirm that every discovered entry point is covered, every trust
    boundary appears in at least one threat, runtime and CI/dev are separated, the person's answers (or their absence)
    are reflected, assumptions and open questions are explicit, and the document follows "Output" below. Write it to
    `<repo-or-dir-name>-threat-model.md` (the repository's folder name, or the in-scope directory when modelling a
    sub-path).

## Output

First, before the report, the assumption check-in from step 8: 3 to 6 assumption bullets and 1 to 3 questions. After
the answer, write valid Markdown with these sections in this order:

1. `## Executive summary`: one short paragraph on the top risk themes and highest-risk areas.
2. `## Scope and assumptions`: in-scope paths, out-of-scope items, explicit assumptions, and open questions that would
   materially change the ranking.
3. `## System model` with `### Primary components`, `### Data flows and trust boundaries` (arrow-style bullets such as
   `Internet -> API server`, each with data types, channel, guarantees and validation) and `#### Diagram` (see below).
4. `## Assets and security objectives`: table `Asset | Why it matters | Security objective (C/I/A)`.
5. `## Attacker model` with `### Capabilities` and `### Non-capabilities`.
6. `## Entry points and attack surfaces`: table `Surface | How reached | Trust boundary | Notes | Evidence (repo path /
   symbol)`.
7. `## Top abuse paths`: 5 to 10 short numbered sequences (attacker goal -> steps -> impact).
8. `## Threat model table`: columns `Threat ID | Threat source | Prerequisites | Threat action | Impact | Impacted assets
   | Existing controls (evidence) | Gaps | Recommended mitigations | Detection ideas | Likelihood | Impact severity |
   Priority`. Threat IDs are stable and formatted `TM-001`, `TM-002`, ... Priority is one of critical, high, medium,
   low. Keep prerequisites to one or two sentences and mitigations concrete.
9. `## Criticality calibration`: what counts as critical, high, medium and low for this repository and context, with
   two or three examples per level tailored to its assets and exposure.
10. `## Focus paths for security review`: table `Path | Why it matters | Related Threat IDs`.
11. `## Quality check`: a short checklist confirming the items in step 11.

### Diagram rules

One compact Mermaid flowchart of the primary components and trust boundaries (trust zones as subgraphs), conservative
enough to render everywhere:

- Use `flowchart TD` or `flowchart LR` and only `-->` arrows.
- Use simple node IDs (letters, digits, underscores) and quoted labels, for example `A["API server"]`; avoid shape
  syntax such as `A(Label)`.
- No `title` lines and no `style` directives.
- Edge labels are plain words only, as `-->|label|`; no `{}`, `[]`, `()` or quotes in them (drop the label if needed).
- Keep node labels short: no file paths, URLs or socket paths (put those in the prose).

## Priority guidance (illustrative, not exhaustive)

- **High**: pre-auth remote code execution, authentication bypass, cross-tenant access, sensitive data exfiltration,
  key or token theft, model or config integrity compromise, sandbox escape.
- **Medium**: targeted denial of service of critical components, partial data exposure, rate-limit bypass with
  measurable impact, log or metrics poisoning that affects detection.
- **Low**: low-sensitivity information leaks, noisy denial of service with easy mitigation, issues that need unlikely
  preconditions.

## Asset and control categories

Use these to keep outputs consistent; pick only what applies and prefer system-specific items over generic text.

Assets:

- User data (personal data, content, uploads)
- Authentication artifacts (passwords, tokens, sessions, cookies)
- Authorisation state (roles, policies, ACLs)
- Secrets and keys (API keys, signing keys, encryption keys)
- Configuration and feature flags
- Models and weights (for ML systems)
- Source code and build artifacts
- Audit logs and telemetry
- Availability-critical resources (queues, caches, rate limits, compute budgets)
- Tenant isolation boundaries and metadata

Controls:

- Identity and access: authentication, authorisation, session handling, mTLS, key rotation
- Input protection: schema validation, parser hardening, upload scanning, sandboxing
- Network safeguards: TLS, network policies, WAF, rate limiting, DoS controls
- Data protection: encryption at rest and in transit, tokenisation, redaction
- Isolation: process sandboxing, container boundaries, tenant isolation, seccomp
- Observability: audit logs, alerting, anomaly detection, tamper resistance
- Supply chain: dependency pinning, SBOMs, provenance, signing
- Change control: CI checks, deployment approvals, config guardrails

Mitigation phrasing patterns:

- "Enforce schema at `<boundary>` for `<payload>` before `<component>`."
- "Require an authorisation check for `<action>` on `<resource>` in `<service>`."
- "Isolate `<parser/component>` in a sandbox with `<resource limits>`."
- "Rate limit `<endpoint>` by `<key>` and apply burst caps."
- "Encrypt `<data>` at rest using `<key management>` and rotate `<keys>`."

## Example

An abuse path and its table row, as they could appear in a report for a small upload service:

```text
3. Attacker goal: read other customers' files.
   1. Sign up for a free account (self-service, no review).
   2. Upload a ZIP whose entries contain ../ segments to POST /imports.
   3. worker/unzip.py extracts without path checks into the shared /data volume.
   4. Overwrite another tenant's manifest so it points to the attacker's bucket.
   Impact: cross-tenant data disclosure and integrity loss.
```

| Threat ID | Threat source | Prerequisites | Threat action | Impact | Impacted assets | Existing controls (evidence) | Gaps | Recommended mitigations | Detection ideas | Likelihood | Impact severity | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TM-003 | Any signed-up user | Free account; import feature enabled | Zip-slip write outside the tenant folder | Cross-tenant read and overwrite | Customer files, manifests | Size limit only (`worker/unzip.py` `MAX_BYTES`) | No path normalisation; shared volume | Resolve each entry and reject paths outside the tenant root; per-tenant volumes | Alert on extraction paths containing `..` | high | high | critical |

---
Adapted from security-threat-model by OpenAI (https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/security-threat-model/SKILL.md), Apache-2.0.
Changes: merged the skill with its prompt template and controls reference into one file, renamed sections to Goal/Steps/Output, removed tool-specific notes, added a short example. See SOURCE.md.
