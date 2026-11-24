> Illustration only: a shortened `REPORT.md` for a made-up project, to show the shape of the output.

# Security audit: invoice-api

**Run**: standard profile, whole repository, commit `4f2c9e1` (clean worktree), no budget set, first run (no prior
ledger). Execution was sandboxed and limited to source review and local checks with dummy data. 3 units deferred (see
Coverage).

## Posture

Authentication is centralised and consistent. Authorisation is checked per route, but one export path and one PDF
renderer bypass the owner check. No secrets in the repository.

## Confirmed findings

| Severity | Title | Boundary | Observed result |
| --- | --- | --- | --- |
| high | Invoice export ignores tenant scope | tenant isolation | Dummy user of tenant B received tenant A's invoices |
| medium | PDF renderer fetches arbitrary URLs from logo field | server-side fetch | Local fixture server received a request from the renderer |

### 1. Invoice export ignores tenant scope (`api:export:missing-tenant-filter`)

- **Where**: `api/routes/export.ts:41` (entry point) -> `api/services/export.ts:88` -> `api/db/invoices.ts:120` (sink:
  query without `tenant_id`).
- **Principal**: any authenticated user of any tenant.
- **Reproduction (local, dummy data)**: seed tenants A and B with the existing test fixture, log in as `user-b`, call
  `GET /export?from=2026-01-01`. Observed: the CSV contains 12 rows with `tenant_id = A`.
- **Conditions**: authenticated; export feature flag on (default in `config/defaults.ts:17`).
- **Impact**: cross-tenant read of invoice data. Likelihood high (one request), impact high.
- **Fix**: pass `ctx.tenantId` into `listInvoices()` and make the parameter required; add a regression test that a
  user of tenant B exporting gets zero rows of tenant A.

## Needs validation

| Title | Trace | Blocker | Local next step | Owner check |
| --- | --- | --- | --- | --- |
| Webhook signature may be skipped behind proxy | `api/webhooks.ts:22` -> `:57` | Whether the proxy strips `X-Signature` is not in the repository | none possible | Confirm in the proxy config that `X-Signature` is forwarded unchanged |

## Hardening notes

- `Set-Cookie` for the CSRF token lacks `SameSite`; the token is not a session credential, so no finding.

## Coverage

42 units: 36 covered, 3 candidate, 0 blocked, 3 deferred (mobile push subsystem, out of time). Final coverage review:
clean. Finding 2 is described in full in `FINDINGS-DETAIL.md`. A second run is recommended for the deferred units.
