---
name: security-audit
description: Source-first security audit of a codebase. It maps trust boundaries, hunts vulnerabilities attack class by attack class against a written coverage plan, has every candidate re-checked by an independent reviewer, and reports only evidence-backed findings with the smallest fix. Triggered by "security audit this codebase", "find security vulnerabilities", "pen-test the code", "do a full security review".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: [dev, devops]
category: security
---

# Security Audit

Find vulnerabilities that break a real trust boundary, then give the owners the source evidence, a safe local
reproduction, a priority and the smallest effective fix. This is a defensive, source-first method. A candidate without a
concrete affected principal, resource or security outcome is not a confirmed finding.

## Goal

Produce an audit that people can act on and trust. The audit describes fixes; it never changes the target's source.

- **Confirmed findings**: complete source trace, bounded local evidence, severity, smallest source fix, regression case.
- **Needs-validation leads**: a hypothesis blocked by one exact missing fact, with a safe plan and no severity.
- **Rejected candidates**: claims disproved during validation, kept so later runs do not repeat them.
- **An honest coverage statement**: what was reviewed, deferred or out of scope. One pass never exhausts a target.

### Two modes

This skill is guidance by default. Loading it does not authorise the full workflow or creating files.

- **Guidance mode**: security questions, a focused review, triage of one finding, methodology. Use only the parts you
  need (hunting method, candidate gate, severity, attack classes). Create no output folder and no audit files.
- **Full audit mode**: only when the person explicitly asks to audit or pen-test a codebase, asks for a full,
  comprehensive or end-to-end security review, or asks for report files. Run every step below and write the files.
  If the request could mean either mode, ask one focused question before creating any file.

### Safety rules (both modes)

1. Reading source is read-only. Never edit the target's source; never push, publish or release anything.
2. Run target-controlled code (builds, tests, fixtures, fuzzers, browsers, emulators) only inside an OS-enforced sandbox
   with all of: no external network (an isolated loopback is fine for a local client/server check); an empty
   environment filled from an allowlist with dummy values and a scratch-local home, temp and cache folder; target and
   toolchain read-only, writes only to one scratch folder; low CPU, memory, process, file-size, disk and time limits.
3. If any control cannot be enforced, run no target code: keep the lead as needs-validation, name the missing capability
   and give a safe validation plan. Install nothing and let no build fetch dependencies.
4. Use dummy accounts, fixtures and secrets. Never probe deployed endpoints, external or paid services, shared
   infrastructure, production identities, other users' data or live control planes. Never stress-test a shared process.
5. Stop at the minimum local effect that proves the boundary failure (a wrong return value, an unauthorised dummy record,
   a sanitizer report). No persistence, no chains beyond the proof, no concealment.
6. Record each local check with command, exact input, limits and only allowlisted environment variable names with safe
   values. Never capture the ambient environment, credentials or unrelated host paths. Treat the scratch folder as
   untrusted after a run: copy out only expected regular files, size-limited, without following symlinks.

## Steps

### 1. Set up the run (full audit mode)

Write these down in `run-metadata.json` (or at the top of `REPORT.md`):

- **Target and source ref**: the repository root under review, the commit, and whether the worktree is dirty.
- **Output folder**: a new folder outside the repository, by default `../<repo-name>-security-audit/run-<N>/` with the
  next unused `<N>`. Use a folder inside the repository only if the person chose it and version control ignores it.
- **Profile**: `quick` (one hunting pass, one coverage review, one verifier per candidate; small targets or re-runs),
  `standard` (default, every step as written) or `deep` (units split by subsystem and lifecycle, coverage reviews
  repeated until clean, separate verifiers for steps 7 and 9, a second pass over units earlier runs covered).
- **Scope**: whole repository, named paths, one subsystem, one domain, or the diff between two refs. Everything outside a
  scoped run is `out_of_scope`, never `covered`. Quick and scoped runs present themselves as partial.
- **Budget** (optional): the maximum number of reviewer passes. Reserve passes for the coverage reviews and for
  validation (one or two per expected candidate) before hunting, and never spend them on hunting. Never exceed a set
  budget silently; if validation cannot be funded, stop hunting, validate what you can and mark the run incomplete.
  Read earlier runs first (see "Repeat runs").

Profiles change breadth and redundancy, never the evidence bar. One coordinator owns the shared files
(`architecture.md`, `coverage-ledger.json`, `findings.json`, `REPORT.md`, `FINDINGS-DETAIL.md`, `NEEDS-VALIDATION.md`).
Hunters and verifiers return structured results and never edit shared files.

### 2. Map the system (reconnaissance)

Answer four questions from source only, with repository-relative `file:line` references. Contact nothing, run nothing.

1. **Product, stack, local operation**: product type, users, operators and trust-sensitive actions; languages,
   frameworks, build system, runtimes and deployment models visible in the repository; entry points and subsystem
   boundaries; offline build and test commands and what they write; comparable software or protocol if the source shows
   one; missing toolchains that limit local checks.
2. **Principals, authority, controls**: every lower-trust principal and what it may do by design; authentication or peer
   identity at each entry; per-resource authorisation and tenant or owner scope; process, browser, CI, plugin,
   model/tool, device or IPC authority; privilege changes, confirmation, revocation, recovery and fallbacks; which
   controls are visible in source and which depend on deployment.
3. **Entry surfaces, copies, sinks**: every place external or lower-trust input enters (HTTP and browser, RPC and
   messages, files and archives, CLI, environment and config, plugins, dependencies and CI, cloud events, model context
   and tool arguments, deep links and webviews, local IPC). Follow each through transformations, stored or derived
   copies and security-relevant sinks. Note parallel paths to the same effect.
4. **Local execution and deployment visibility**: small offline tests or fixtures usable with dummy data; commands that
   would fetch, publish, spend or touch shared state (forbidden for this run); deployed controls the source cannot show;
   whether every sandbox control from the safety rules is available.

Write `architecture.md`, about 1,000 words at most: product, principals and protected resources; the comparable baseline
if any (to calibrate effort and severity, never to dismiss a demonstrated finding); stack and offline build limits; entry
surfaces and key source-to-sink paths; trust boundaries with the strongest visible control on each; starting paths;
prior-run gaps; which domain lenses apply and the boundary that requires each. Pick a lens because reconnaissance found
its trust boundary, not because a dependency name appears.

### 3. Write the coverage plan

Create `coverage-ledger.json` (a JSON array; a Markdown table is fine for small runs) with one **unit** per material
combination of entry surface x trust boundary x subsystem x attack class. The quick profile uses one "all in-scope
subsystems" value; the deep profile adds lifecycle mode.

```json
{
  "coverage_id": "api/routes/invoices.ts#GET /invoices/:id::api/authz.ts#requireOwner::api::Access control",
  "surface": "GET /invoices/:id", "boundary": "owner check", "subsystem": "api", "attack_class": "Access control",
  "starting_paths": ["api/routes/invoices.ts"],
  "status": "planned", "owner": null, "reviewed_paths": [], "checks": [], "fingerprints": [], "unresolved": []
}
```

- Build `coverage_id` from stable source references (path plus route, symbol or class name), never from line numbers,
  pass number, reviewer, verdict or severity. Reject duplicate IDs.
- Status: `planned` -> `in_progress` -> `covered` (paths and checks, nothing found), `candidate` (has fingerprints) or
  `blocked` (partial review plus an exact blocker); else `deferred`, `out_of_scope` or `not_applicable` with a reason.
  A unit closes only through the paths and checks in a hunter's result; "auth reviewed" in prose is not coverage.
- Order the work: unauthenticated and lowest-trust surfaces first; then boundaries that protect the most valuable
  resources (credentials, cross-tenant data, code execution, release authority); then prior gaps and changed source; then
  classes that usually yield findings for this kind of target. Break ties by `coverage_id`.

### 4. Hunt each unit

Give each unit, or a few closely related units in one subsystem, to one hunter: a separate assistant session if your
setup allows it, otherwise work through them yourself one at a time. A hunter brief contains `architecture.md`, the
assigned units, the full text of their attack classes and lens (copied, not just named), the hunting method and
candidate gate below, the already-confirmed root causes to skip, and the result format.

**Hunting method**

- Read the code at depth. Follow each assigned input through parsing, identity, authorisation, normalisation, state,
  derived copies and the final sink. Read sibling, legacy, batch, retry, cancellation, migration and error paths that
  produce the same effect. Compare sibling controls for equivalence, not mere presence, and compare what one component
  guarantees with what the next one assumes.
- Work from a concrete invariant:
  1. Name the lower-trust principal and its starting capability.
  2. Name the accepted value, action, state transition or resource selector.
  3. Locate the control that should reject, bind, isolate, limit or revoke it.
  4. Trace the exact source path after that decision.
  5. Stop at the smallest affected dummy record, wrong return value, integrity effect or local shared effect.
  6. State a source-level change and a regression case that enforce the invariant.
- Depth bound: trace only paths that can reach the assigned boundary or that it relies on. Stop as soon as the invariant
  is settled either way and record the result.
- Test sad paths and disagreements where the interface accepts them: absent, empty, zero, negative, maximum,
  over-limit, duplicate, mixed encoding, stale, revoked, reordered, concurrent, half-migrated, failed dependency,
  rollback. Compare canonicalisation and units at every parser or policy handoff. For a multi-step issue, prove each
  output as a prerequisite; never assume a later boundary.
- When a high or critical candidate shows a reusable root cause, search the assigned units for lexical, structural
  and logical variants; establish each variant's conditions and impact on its own.
- Use the narrowest local check that settles the claim (an existing unit test, a minimal harness, a dummy-tenant call, a
  small malformed fixture, a deterministic race schedule, a locally rendered policy), and only under the safety rules.
- A deployment, browser, provider, broker, OS, proxy, package, secret or identity fact outside source proves nothing
  either way. If it is decisive, make the lead needs-validation and name the exact missing observation.

**Hunter result**: one JSON object, no prose around it.

```json
{
  "units": [{
    "coverage_id": "...", "disposition": "covered|candidate|blocked",
    "reviewed_paths": ["repo/relative/path"],
    "checks": [{"invariant": "...", "method": "source|local", "result": "...", "artifact": null}],
    "fingerprints": [], "unresolved": []
  }],
  "candidates": [],
  "hardening": ["concrete non-finding note"],
  "uncovered": [{"surface": "...", "boundary": "...", "subsystem": "...", "attack_class": "...",
                 "starting_paths": ["..."], "reason": "why this needs its own unit"}]
}
```

Every assigned unit appears exactly once. Candidates follow "Findings records", with `proposed_verdict` for `verdict`.
A malformed result leaves the unit `planned`. `uncovered` entries become new units; keep `hardening` for the report.

### 5. Apply the candidate gate

1. A candidate needs a complete source trace and evidence for its root cause, including the strongest visible control.
2. A proposed confirmed finding also needs a bounded local observed result, meaningful impact across a stated boundary,
   complete conditions and no visible preventing layer.
3. Do not strengthen a crash into code execution, ordinary work into shared availability loss, or a same-principal
   action into privilege gain.
4. If a required fact is neither in source nor locally observable, use needs-validation with exact blockers, no severity.
5. A missing best practice with no affected principal or resource is a hardening note, not a finding. A candidate that
   source disproves is rejected, not needs-validation.
6. Give each root cause one stable fingerprint, such as `api:invoices:missing-owner-check`, without line, pass, reviewer,
   severity or verdict. Use it in every state and every run. An empty candidate list is a valid result.

Consolidate by fingerprint, then by root cause: one root cause reachable through several paths is one candidate with the
strongest trace; independent missing controls get separate fingerprints.

### 6. Review coverage

After each hunting pass, a fresh reviewer (a new session, or a person, who did not hunt) reads `architecture.md`, the
ledger and the candidate list, checks the source, and returns:

```json
{"missing_units": [{"surface": "...", "boundary": "...", "subsystem": "...", "attack_class": "...",
                    "starting_paths": ["..."], "reason": "source-backed gap"}],
 "reassign_ids": ["unit that did not really close"], "stop": false}
```

It looks for unmapped entry points, unchecked parallel paths, missing lifecycle modes, lenses without a unit,
unjustified exclusions, units closed without paths or checks, and prior gaps. It proposes coverage, not findings. Add
accepted units and hunt again; a reassigned unit keeps its old evidence in an `attempts` list and restarts with a fresh
owner. In `standard` and `deep`, once a review finds nothing, run one more distinct review; coverage is complete only
when that finds nothing too. In `quick`, record the single review's results as `deferred`. Any early stop marks
untouched units `deferred` and is disclosed in the report.

### 7. Validate every candidate independently

Give each unique candidate to a fresh verifier who did not hunt it. The verifier gets the candidate, its linked checks,
the architecture facts needed, the rules of the relevant lens, the safety rules and the record format, never another
verifier's conclusion. Brief:

```text
You did not write this candidate. Try to refute it from repository source and bounded local evidence.
1. Verify every trace and evidence file, line, scope and description. The first entry must be a real lower-trust
   entry point; the last must be the claimed sink or boundary effect.
2. Reconstruct the strongest source-visible validation, identity, authorisation, normalisation, lifecycle,
   framework and containment controls on the path.
3. For a proposed confirmed finding, reproduce the minimum observed result yourself when possible. Do not infer
   a stronger result or continue past it.
4. Check that likelihood, impact, confidence and the proposed fix match only what the evidence shows.
5. For a proposed needs-validation lead, decide whether the blocker is really outside source and local observation.
   If source refutes the trace, reject it. Otherwise make the local and owner-observed plans exact and harmless.
6. Keep the fingerprint unless you found a genuinely different root cause.
Return one JSON object: {"decision": "confirmed|needs_validation|rejected", "record": {...}}
```

Promote a lead to confirmed only after the verifier established the full path and observed result itself. Demote to
needs-validation when a specific deployment or runtime fact stays unknown; reject when source, local behaviour, a visible
control, missing impact or an impossible prerequisite refutes the claim. Needs-validation is never a parking place for a
speculative idea. Discard a malformed answer and re-run it with a fresh verifier; do not repair it.

### 8. Write `findings.json`

Write all independently decided records, sorted by fingerprint, in the format under "Findings records". Check each one
against its verdict's rules: required fields present, forbidden fields absent, trace starts at `entrypoint` and ends at
`sink`, overall severity no higher than impact. A well-formed file proves format, not truth.

### 9. Verify the final records with fresh eyes

One more fresh reviewer per final confirmed or needs-validation record checks the record itself, not the hunter's prose:

- **Confirmed**: every path and line; the real entry interface and exact input; every condition and preventing layer;
  the affected principal and demonstrated impact; likelihood, impact and overall severity kept apart; whether the fix
  enforces the invariant instead of moving trust elsewhere.
- **Needs-validation**: the path is real and supports only the claimed root cause; each blocker is decisive and not
  answerable locally; a concrete boundary and result are named; the plan is exact and sends no traffic to a deployment.

The reviewer answers `{"decision": "verified"}` or `{"decision": "replace", "reason": "...", "record": {...}}`. A
replacement that promotes the verdict or materially changes root cause, trace, input, observed result, impact or
severity needs yet another independent reviewer before you apply it. If that is impossible, remove the record from
`findings.json`, keep it as an unresolved candidate and mark the run incomplete. In `quick` runs steps 7 and 9 merge
into one verifier; never skip independent review of a confirmed record.

### 10. Write the reports

Only after step 9, derive the prose from the final records, the ledger and the hardening notes. Prose never changes a
verdict, severity, blocker or impact (see "Report"). The run ends in exactly one of two states: everything written and
every record verified (`complete`), or `incomplete` with its exact reason at the top of the report. Never stop silently.

## Severity

Only confirmed findings get a severity. Rate likelihood and impact from the demonstrated conditions and result; overall
severity never exceeds demonstrated impact.

- **critical**: an unauthenticated actor gains code execution, full data-store access or takeover of arbitrary accounts.
- **high**: an actor fully defeats an explicit security control with real consequences: authentication bypass,
  cross-tenant read or write, stored script execution affecting other users, authenticated code execution, an
  unauthenticated remote stop of a shared service.
- **medium**: a real boundary violation with limited blast radius, uncommon preconditions or a narrow set of resources.
- **low**: disclosure of non-secret internals, or an effect that needs sustained effort for minimal gain.
- **informational**: confirmed but minimal impact, mainly useful as a prerequisite inside a larger finding.

High or medium? Does the result fully defeat an explicit control for an action with real consequences, or only weaken
it? If you cannot state the concrete damage, the severity is lower than it feels. For each confirmed finding, name the
invariant the code must enforce and the narrowest change that enforces it at the last trusted decision point, plus a
regression test. Prefer specific repository-relative changes over generic advice.

## Attack classes

Pick the classes that fit the target, split big codebases by subsystem, and add target-specific classes. Use the
ordinary classes everywhere; add a domain lens only where reconnaissance found its boundary.

### Ordinary classes

**Injection**: trace untrusted input to a dangerous sink. Web: SQL, HTML, shell, templates, file paths, redirects,
deserialisation. Libraries: any function processing caller data without validation (buffers, parsers, format strings).
CLIs: shell command construction, path handling, environment interpolation. Services: query construction, message
serialisation, logs, LDAP, XPath. Look past direct paths: data stored safely and later used in a dangerous context by
other code; injection through field names, keys, headers and metadata, not just values; injection into secondary systems
(logs, caches, search indexes, analytics).

**Access control**: not whether a check exists, but whether it checks the right permission for the right resource by
the right mechanism. Is there a path to the same state change with a weaker check? Can a body field override what the
permission system restricts? Are there endpoints with authentication but no authorisation? Does one resource have
several access paths with inconsistent checks? Do bulk, batch, export and import enforce per-item permissions?

**Resource and file handling**: path traversal (symlinks, encoded sequences, null bytes); SSRF (redirects, DNS
rebinding, URL parser differences); unsafe deserialisation, archive extraction (zip slip), temp files; memory safety
where it applies; races between check and use on files (TOCTOU).

**Cryptography and secrets**: weak randomness for tokens, keys and nonces; hardcoded secrets, or secrets in logs, errors,
URLs or client responses; broken key derivation, missing HMAC verification, nonce reuse; timing side channels in secret
comparison; ECB mode, unauthenticated encryption, static IVs; error paths that fall back to no crypto.

**Business logic** (scanners cannot find these, and they are often high impact): skipping, reversing or replaying steps
of a workflow, and partial failure without rollback; check-then-act races with business impact (double spend, double
approval, lost update); negative, zero, overflowing or imprecise quantities and string/number coercion; a restriction on
one operation bypassed by another with the same effect; data trusted because "we validated it on the way in" when another
path wrote it; expiry, scheduling, rate windows, clock skew and time zones at exact boundaries; security posture when
config is missing, a flag is off, a dependency is down or a migration is half done.

**Feature abuse and data leakage**: export or backup that includes data above the caller's level, other users' data, or
deleted and draft content; import or restore that overwrites, skips validation or writes where the user cannot; search,
filter or sort as an oracle for hidden data; enumeration through different errors, timings, sizes or status codes (also
in password reset, invite and sign-up flows); preview tokens and drafts leaking through search, feeds, sitemaps, listings
or cache headers; notification, webhook and callback URLs as SSRF.

**Chained vulnerabilities and trust gaps**: map what a low-privilege principal can read, write, invoke and keep, then
connect only concrete outputs to later trust decisions; compare what component A guarantees with what B assumes
(truncation, coercion, normalisation, tenant scope); second-order use (a field name becomes a JSON path, a slug a file
path, a stored string a URL, regex, template or policy); capabilities that grow after delegation, refresh, caching, role
change or composition; setup, migration, soft-delete, revocation and cache-expiry windows; undelete, restore, rollback
and cancel that skip current ownership and authorisation.

**Wildcard** (find what the other classes miss): read code that looks boring or unrelated to security. What is the
strangest code and why does it exist? What feels half-finished or bolted on? Which API calls are possible but never made
by the client? Which routes, parameters, headers or flags are undocumented? What happens when features not designed
together are mixed? Are there reverted security fixes, commented-out checks or removed secrets in the history? Which
valid-account actions affect other users, shared integrity, availability or the operator's costs? Which irreversible
actions are not bound to the final principal, action and resource? Which environment assumptions does the code make
(local database, accurate clock, trustworthy DNS, case-sensitive file system)? Which edge cases do the tests skip? If a
comment explains why something is safe, verify it. Read anything named `temp`, `hack` or `legacy` closely.

**Obvious things** (be thorough and literal: check every item and report each result):

- Hardcoded passwords, API keys, tokens, private keys (search for `password`, `secret`, `apikey`, `token`, `Bearer`,
  `-----BEGIN`, common default passwords); TODO, FIXME or HACK comments about security (`TODO: add auth`).
- Debug or dev mode that an environment variable, query parameter or header can switch on in production; test or seed
  credentials that work in production; unprotected `/debug`, `/admin`, `/test`, `/status`, `/metrics`, `/env`, `/config`.
- Committed `.env`, `credentials.json`, `*.pem`, `*.key`; a `.gitignore` that misses secrets, uploads or local config.
- Unpinned dependencies and known CVEs in the lockfiles.
- `eval`, `exec`, `child_process`, `Function()`, `vm.runInContext` or dynamic `import()` with dynamic input.
- CORS `*`, or credentials with a wildcard or reflected origin; cookies without `HttpOnly`, `Secure`, `SameSite`.
- Open redirects through parameters such as `redirect`, `return`, `next`, `url`, `goto`, `continue`.
- Plain-HTTP endpoints; stack traces, internal paths or SQL errors in production responses.

A flag is not a finding: a cookie without `HttpOnly` matters only if it holds something sensitive and scripts do not need
to read it by design. Trace the impact before reporting.

### Domain lenses

Each lens adds discipline and classes for one kind of boundary. In every lens, confirm only with source evidence plus a
bounded local test, and use needs-validation when the decisive fact lives in a deployment, provider, device or runtime
you cannot observe.

- **Native, binary and kernel** (C and C++, unsafe Rust, parsers, FFI, JITs, loaders, firmware). Re-derive every bound
  and lifetime from attacker input and all callers, against the worst accepted case. A crash proves a defect only when
  realistic untrusted input reaches it; never infer code execution from a label. Validate with sanitizers, deterministic
  concurrency tests and existing fuzz targets, then stop. Classes: out-of-bounds access; integer overflow, truncation,
  signedness; uninitialised data; use-after-free, double free; type confusion; refcount and shared-state races;
  deadlock; FFI length, layout and unwind mismatches; library search order; unsigned artifacts; malformed binary
  metadata; JIT consistency; teardown; kernel user-copy bounds, double fetch; under-authorised privileged interfaces.
- **AI, LLM and agents** (chat, retrieval, memory, tool calling, MCP servers and clients). Prompt injection alone is not
  a finding: require content that reaches another principal's context, uses authority the requester lacks, discloses
  data they cannot read, or drives a sink they cannot reach. Model output, memory, tool descriptions and tool-server
  responses are untrusted input. A guardrail prompt is not a boundary; count only deterministic checks, scoped
  authorisation, isolation and constrained credentials. Authorisation and action binding are separate controls.
  Classes: indirect injection via retrieved content; cross-session or cross-tenant context bleed; memory poisoning; role
  confusion; tool-argument injection into a sink; excessive agency, confused deputy; approval not bound to the exact
  action; schema/dispatcher disagreement; unbounded loops; trust inherited by delegated agents and tool servers;
  tool-server identity confusion; tool metadata as policy; insecure output rendering; context leaks.
- **HTTP protocol and identity** (web apps, APIs, proxies, CDNs, sessions, JWT, OAuth/OIDC, SAML, MFA, passkeys, API
  keys, mTLS). Framing and cache findings need two components that read the same request or key differently, with the
  exact value on each side. For every credential find the verification and every binding: issuer, audience, origin,
  client, session, principal, resource, assurance, expiry, one-time use. Host, Forwarded, Origin, Referer, redirect
  targets and callback state are trust decisions. A missing header, cookie flag, MFA prompt or rate limit alone is not
  a finding. Classes: request smuggling; cache poisoning and deception; host-header trust; header injection; CSRF;
  session fixation and invalidation; cookie scope; JWT claim binding; OAuth/OIDC callback binding; SAML assertion
  binding; MFA downgrade, step-up bypass; WebAuthn checks; account-linking collisions; password reset and recovery;
  API-key scope and exposure; mTLS identity confusion; certificate fallback.
- **Client side and browser** (single-page apps, extensions, webviews, service workers, storage, postMessage, CORS,
  WebSockets). Name a controllable source and an executing or disclosing sink. Impact must reach a victim's session,
  another origin or shared persistence; self-injection is not a finding. Framework escaping, same-origin policy, CSP,
  COOP/CORP and service-worker scope are real controls to verify first. Classes: DOM XSS; DOM clobbering; prototype
  pollution with a gadget; postMessage origin trust; cross-site WebSocket use; credentialed CORS; service-worker scope
  and cache confusion; storage disclosure; XS-Leaks; opener leaks; clickjacking; navigation confusion.
- **Supply chain and release** (dependencies, generated code, CI, signing, updates, plugins). A mutable or vulnerable
  dependency alone is not a finding: show who can influence resolution, which build consumes it and which boundary
  follows. Follow integrity across every handoff up to the update consumer. CI configuration is authorisation code:
  which event triggers it, whose code runs, which secrets and tokens exist, what it may publish. A checksum fetched from
  the same untrusted place as the artifact proves nothing. Classes: dependency and namespace confusion; mutable build
  inputs; codegen provenance; build-context inclusion; untrusted code in a privileged workflow; workflow expression
  injection; cache and artifact trust mixing; automation identity overreach; build-to-release substitution;
  signing-policy gaps; update metadata and rollback; plugin trust expansion.
- **Cloud and deployment** (IAM, infrastructure as code, containers, Kubernetes, serverless, ingress). Do not infer live
  exposure from a manifest alone; establish which environment consumes it and which overlays change it. Map each
  workload identity to concrete operations. A secret reference is not a disclosure. Classes: workload identity
  overreach; cross-account role confusion; authorisation delegated to cloud metadata; reachable management planes;
  trusted-proxy and mesh identity bypass; metadata-service reachability; host capability exposure; admission gaps;
  label trust; control precedence drift; secrets shared across workloads; credential renewal fallback; signed-URL
  policy; event-source identity; edge and runtime mismatch.
- **Protocols, RPC and messaging** (gRPC, GraphQL transports, Protobuf, queues, brokers, webhooks, streams). "Internal"
  is not authentication: name the peer identity at every hop and how it becomes the application principal. Schema
  validation proves shape, not provenance, authority or ordering. Classes: framing and canonicalisation disagreement;
  union, enum and default confusion; envelope versus payload identity; interceptor and method-path gaps; per-item and
  streaming authorisation; reply correlation; topic scope; dead-letter disclosure; untrusted producer as control plane;
  duplicate delivery and idempotency; stale or out-of-order messages; acknowledge and commit ordering.
- **Resource exhaustion and availability**. Require an input-to-cost path, a missing effective bound, and impact on
  another user, a shared service or the operator's spend. Check body, message and file caps, concurrency, queues,
  deadlines and quotas before calling a path unbounded. Never stress-test; use asymptotic analysis and tiny fixtures.
  Classes: superlinear parsing or regex; decompression bombs; query amplification; unbounded buffering; handle leaks;
  work that survives cancellation; pre-authentication work; quota accounting gaps; worker starvation; reachable fatal
  error or deadlock; retry storms and fail-open; poison records; unsafe recovery.
- **Data isolation and lifecycle** (multi-tenant stores, caches, search, exports, backups, migrations, deletion). A
  tenant field on a record is not isolation: find the query, key, path or row policy that enforces it on each read and
  write. Trace derived copies (search, cache, analytics, export, previews, logs, replicas, backups). Classes: missing
  tenant or owner enforcement; composite-key collision; policy versus query disagreement; signed-reference overreach;
  index and cache ACL drift; logs and analytics as other readers; aggregate oracles; export, import, restore and
  migration scope; soft-delete bypass; stale derived copies; retention overrun; restore that revives invalid state.
- **Desktop, mobile and local IPC** (native apps, deep links, webview bridges, exported components, helpers, daemons).
  Name the realistic attacker: another app, another OS user, a sandboxed child, an untrusted document, a remote origin.
  Paths, process names, bundle IDs and claimed sender fields are not peer authentication. The bridge or helper must
  authorise each operation and final resource after parsing. Classes: deep-link ambiguity; account handoff confusion;
  file-open authority; webview origin to bridge confusion; over-broad bridges; IPC peer authentication; exported
  component overreach; privileged helper as confused deputy; install and update path trust; local file TOCTOU;
  credential-store boundary; logout and account-switch leakage.

## Findings records

Every record has `verdict`, `fingerprint`, `title`, `description` and repository-relative paths. `trace` is an ordered
list of `{kind, file, line, scope, description}` with `kind` running `entrypoint` -> `propagation` ... -> `sink` (a
single-entry trace uses `entrypoint` or `sink`). `evidence` is a list of `{file, line, description}`.

- **confirmed**: `root_cause`, `intended_behavior`, `trace`, `evidence`, `conditions` (list of `{kind, description}`,
  kinds such as authentication_level, authorization_role, user_interaction, system_configuration, data_state,
  timing_dependency), `execution` (`attacker_perspective`, `payloads`, `instructions`, `observed_result`, in the target's
  own interface: HTTP request, CLI call, library call, message, file fixture, rendered policy), `remediation`
  (`strategy`, optional `code_changes`), `severity` (`likelihood` and `impact`, each `{score, reason}`, plus
  `overall_severity`), `confidence` (`{score, reason}`). No blockers, validation plan or reason.
- **needs_validation**: `claimed_root_cause`, `trace`, `evidence`, non-empty `blockers`, and `validation_plan` with
  `local` and/or `deployment` (an owner-observed check, never audit traffic to a live system). No severity or fix.
- **rejected**: `claimed_root_cause`, `trace`, `evidence`, `reason`, so later runs do not repeat the claim.

## Report

`REPORT.md` contains, in this order:

1. Profile, scope, budget used against planned, source ref, the statement that execution was sandboxed and limited to
   source and local checks, prior runs used, deferred and out-of-scope coverage. Quick, scoped, budget-limited or
   incomplete runs say plainly that they are partial, and list unvalidated candidates without calling them findings.
2. A short summary of the security posture.
3. A confirmed-findings table: severity, title, affected boundary, one-line observed result.
4. Each confirmed finding: source location, lower-trust principal, bounded reproduction in the target's own interface,
   conditions, actual result, impact, priority rationale, smallest source fix.
5. A separate NEEDS VALIDATION table: title, trace, exact blocker, local next step, owner-observed check. No severity.
6. Hardening notes and good patterns, kept apart from findings.
7. Coverage summary from the ledger: covered, candidate, blocked, deferred counts, exclusions, final review result.

`FINDINGS-DETAIL.md` holds, per confirmed medium, high or critical finding: ordered trace and evidence, dummy attacker
and affected dummy resource, exact input and bounded steps, observed output and the invariant it proves, conditions and
containment, fix and regression case. `NEEDS-VALIDATION.md` holds, per lead: trace, evidence, exact blocker, affected
boundary and each resolution plan, with no live-test instructions and no assumed deployment facts. A clean run may have
zero confirmed findings: say so, state the remaining limits, and do not invent low findings.

## Repeat runs

Runs add up: in the source authors' own test runs, one run found roughly half of what repeated runs found in total.
Before planning, read every earlier ledger and `findings.json` for the repository:

- Compare current source with every prior record and unit; an old commit id alone does not prove a path unchanged.
- Carry a prior confirmed record forward (same fingerprint, re-verified in step 7) only if its source and conditions are
  unchanged, and skip only that root cause while hunting. If the source changed, plan a revalidation unit instead.
- Prior needs-validation, deferred, blocked, out-of-scope and changed-source units become current work. A prior
  rejection suppresses only that exact unchanged claim, never coverage of its unit.
- A prior quick or scoped run counts only for its recorded evidence, never "the rest is fine". No prior ledger: say so.

## Red flags

1. Checklist deviations presented as vulnerabilities.
2. Defence-in-depth advice with no reachable boundary violation (if layer A stops the attack, missing B is hardening).
3. Live or shared-environment testing where bounded local evidence was not enough.
4. Guessing provider, proxy, browser, identity or deployment behaviour that is not in source.
5. Treating intended same-principal authority or self-impact as crossing a boundary, or reporting a stronger effect
   than the one observed.
6. Prose-only hunter results that cannot be deduplicated or verified.
7. Re-reporting carried confirmed records, or using them as examples that anchor the hunt.
8. Giving a severity to needs-validation leads.
9. Writing the report before independent verification, or letting the prose and the JSON disagree.

---
Adapted from security-audit by Cloudflare, Inc. (https://github.com/cloudflare/security-audit-skill/blob/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/skills/security-audit/SKILL.md), MIT.
Changes: merged SKILL.md and its 14 companion files into one file, condensed the domain files into short lenses, replaced the Node validators and file-descriptor promotion procedure with written checks, generalised delegated agents to separate sessions or reviewers. See SOURCE.md.
