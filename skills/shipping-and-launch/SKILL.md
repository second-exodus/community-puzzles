---
name: shipping-and-launch
description: Prepares a production launch end to end - runs the pre-launch checklist, plans a staged rollout behind a feature flag, puts monitoring and a written rollback plan in place, and ends with an evidence-based go/no-go verdict. Triggered by "pre-launch checklist", "are we ready to ship", "go/no-go", "plan the rollout", "rollback plan".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: [devops, dev]
category: release
---

# Shipping and Launch

## Goal

Ship with confidence. The goal is not just to deploy - it is to deploy safely, with monitoring in place, a rollback
plan ready, and a clear understanding of what success looks like. Every launch should be **reversible, observable and
incremental**.

Use this skill when:

- a feature goes to production for the first time, or a significant change reaches users
- data or infrastructure is migrated
- a beta or early-access programme opens
- anyone asks "what must be in place before we ship?" or "is this a go?"
- any deployment carries risk (all of them do)

The result is a written **go / no-go verdict** with blockers, accepted risks, the rollback plan and the monitoring
that will watch the launch.

## Steps

1. **Collect the launch facts.** Write down what ships, to whom, when, who owns the rollback, and what success looks
   like. Read the real state instead of trusting summaries: run the test suite and the build, read the last CI run,
   check whether staging was smoke-tested *after the last relevant change*, look at the dashboards and alerts that
   exist today, list feature flags and pending database migrations.
2. **Confirm the Definition of Done for every change in the release** (see "Before the checklist" below). Work that
   was never run, has no failing-then-passing test, or skipped review is not done, whatever the ticket says.
3. **Run the pre-launch checklist** (next section). Mark each item `pass`, `fail` or `n/a` and name the evidence
   (command output, link, file). Skip sections that truly do not apply (no UI → no accessibility section) and say so.
4. **Choose how the change is released.** Prefer a feature flag that is deployed OFF and switched on in stages
   (see "Feature flags"). If no flag is possible, plan a canary or a blue/green switch instead of a big-bang deploy.
5. **Write the rollback plan before the deploy** (template below): trigger conditions, exact steps or commands,
   database considerations, owner, expected time to roll back. A rollback plan written "after launch" does not count.
6. **Put feature-specific monitoring in place.** General error logs are not enough: add the metrics and alerts that
   would show *this* feature failing (for a checkout: payment failures, duplicate charges, confirmation latency).
   Confirm someone is watching during the first hour.
7. **Check the error budget gate** (see "Error budget release gate"). An exhausted budget is a no-go for feature work.
8. **Give the go / no-go verdict** in the format under "Output". Every failed gate is a blocker or an explicitly
   accepted risk with an owner. Pressure from a deadline or a senior person does not turn a failed gate green; if the
   answer is no-go, list the concrete steps that lead to a later GO.
9. **Roll out in stages** with the thresholds table. Advance only when every metric is green; hold on yellow; roll
   back on red.
10. **Verify after launch** (first hour checklist), then **clean up**: remove the flag and the dead code path within
    two weeks of full rollout, and record what you learned.

## Before the checklist: Definition of Done

A release is only as good as the changes in it. Each change must already meet its own acceptance criteria **and**
this standing bar:

- [ ] Verified at runtime, not just compiled or type-checked
- [ ] New behaviour covered by tests that fail without the change and pass with it; existing tests still pass
- [ ] Edge cases and error paths handled, not just the happy path
- [ ] No dead code, leftover debug output or commented-out blocks; changes scoped to the task
- [ ] Migrations, config changes and feature flags accounted for; backward compatibility considered for public APIs
- [ ] Public interfaces and user-facing behaviour documented
- [ ] Security implications reviewed for untrusted input, auth and data handling
- [ ] A person reviewed and approved the change before merge or deploy

## The pre-launch checklist

### Code quality

- [ ] All tests pass (unit, integration, end-to-end)
- [ ] Build succeeds with no warnings
- [ ] Lint and type checking pass
- [ ] Code reviewed and approved
- [ ] No TODO comments that should be resolved before launch
- [ ] No debugging statements (`console.log`, `print`, `dbg!` …) in production code
- [ ] Error handling covers expected failure modes

### Security

- [ ] No secrets in code or version control
- [ ] The ecosystem's dependency audit (`npm audit`, `pip-audit`, `cargo audit`, …) shows no critical or high
      vulnerabilities
- [ ] Input validation on all user-facing endpoints
- [ ] Authentication and authorization checks in place
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Rate limiting on authentication endpoints
- [ ] CORS restricted to specific origins (no wildcard)

### Performance

- [ ] Core Web Vitals within "Good" thresholds (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1)
- [ ] No N+1 queries in critical paths
- [ ] Images optimised (compression, responsive sizes, lazy loading below the fold)
- [ ] Bundle size within budget
- [ ] Database queries have appropriate indexes
- [ ] Caching configured for static assets and repeated queries

### Accessibility (for anything with a user interface)

- [ ] Keyboard navigation works for all interactive elements
- [ ] A screen reader can convey page content and structure
- [ ] Colour contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text and UI components)
- [ ] Focus management correct for modals and dynamic content
- [ ] Error messages are descriptive and associated with their form fields
- [ ] No accessibility warnings in an automated checker (for example axe-core or Lighthouse)

### Infrastructure

- [ ] Environment variables set in production
- [ ] Database migrations applied, or ready to apply, and tested on staging
- [ ] DNS and TLS certificates configured
- [ ] CDN configured for static assets
- [ ] Logging and error reporting configured
- [ ] Health check endpoint exists and responds
- [ ] Production configuration lives in code or config files, not in someone's memory

### Documentation and communication

- [ ] README updated with any new setup requirements
- [ ] API documentation current
- [ ] Decision records written for any architectural decisions
- [ ] Changelog updated
- [ ] User-facing documentation updated (if applicable)
- [ ] Support and on-call have the launch runbook and know the launch time

## Feature flags

Ship behind feature flags to decouple **deployment** from **release**:

```typescript
// Example in TypeScript/React - the same pattern works in any stack
const flags = await getFeatureFlags(userId);

if (flags.taskSharing) {
  // New feature: task sharing
  return <TaskSharingPanel task={task} />;
}

// Default: existing behaviour
return null;
```

Flag lifecycle:

```
1. DEPLOY with flag OFF   → code is in production but inactive
2. ENABLE for team/beta   → internal testing in the production environment
3. GRADUAL ROLLOUT        → 5% → 25% → 50% → 100% of users
4. MONITOR at each stage  → error rates, performance, user feedback
5. CLEAN UP               → remove the flag and the dead code path after full rollout
```

Rules:

- Every feature flag has an owner and an expiry date.
- Clean up flags within two weeks of full rollout.
- Do not nest feature flags (it creates exponential combinations).
- Test both flag states (on and off) in CI.

## Staged rollout

### Sequence

```
1. DEPLOY to staging
   └── full test suite in the staging environment
   └── manual smoke test of critical flows

2. DEPLOY to production (flag OFF)
   └── verify the deployment succeeded (health check)
   └── check error monitoring (no new errors)

3. ENABLE for the team (flag ON for internal users)
   └── the team uses the feature in production
   └── 24-hour monitoring window

4. CANARY (flag ON for 5% of users)
   └── monitor error rates, latency, user behaviour
   └── compare canary against baseline
   └── 24-48 hour monitoring window
   └── advance only if every threshold below is green

5. GRADUAL increase (25% → 50% → 100%)
   └── same monitoring at each step
   └── able to roll back to the previous percentage at any point

6. FULL rollout (flag ON for everyone)
   └── monitor for one week
   └── clean up the flag
```

### Decision thresholds

| Metric | Advance (green) | Hold and investigate (yellow) | Roll back (red) |
|--------|-----------------|-------------------------------|-----------------|
| Error rate | Within 10% of baseline | 10-100% above baseline | More than 2x baseline |
| P95 latency | Within 20% of baseline | 20-50% above baseline | More than 50% above baseline |
| Client errors | No new error types | New errors in < 0.1% of sessions | New errors in > 0.1% of sessions |
| Business metrics | Neutral or positive | Decline < 5% (may be noise) | Decline > 5% |

### Roll back immediately if

- the error rate rises above 2x baseline
- P95 latency rises by more than 50%
- user-reported issues spike
- data integrity issues are detected
- a security vulnerability is discovered

## Monitoring and observability

What to watch:

```
Application:     error rate (total and per endpoint), response time (p50, p95, p99),
                 request volume, active users, key business metrics (conversion, engagement)
Infrastructure:  CPU and memory, database connection pool, disk space, network latency,
                 queue depth (if any)
Client:          Core Web Vitals (LCP, INP, CLS), JavaScript errors,
                 API error rates seen from the client, page load time
```

Report errors with enough context to act on, and never leak internals to users:

```typescript
// Example: server-side error handler (Express-style)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  reportError(err, { method: req.method, url: req.url, userId: req.user?.id });

  // Do not expose internals to users
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
});
```

On the client, wrap risky UI in an error boundary (or your framework's equivalent) that reports the error with the
component stack, user id and page, and shows a fallback with a retry.

### Post-launch verification (first hour)

1. Health endpoint returns 200.
2. Error monitoring shows no new error types.
3. Latency shows no regression.
4. The critical user flow works when you try it by hand.
5. Logs are flowing and readable.
6. The rollback mechanism works (dry run if possible).

## Error budget release gate

The service's error budget - the share of requests or time the SLO allows to fail - decides whether it is safe to
ship. Use it as an objective gate, not a negotiation:

```
Budget remaining > 20%  →  ship normally; monitor closely
Budget remaining 0-20%  →  slow rollouts only; no high-risk changes
Budget exhausted        →  freeze feature work; focus entirely on reliability
Budget resets           →  resume normal pace; keep the fix that recovered it
```

A high burn rate during a canary (spending budget faster than the baseline pace) is a **hold** signal - treat it like
an elevated error rate, even when the individual thresholds are green.

## Rollback plan template

```markdown
## Rollback plan for [feature/release]

### Trigger conditions
- Error rate > 2x baseline
- P95 latency > [X] ms
- User reports of [specific issue]

### Rollback steps
1. Disable the feature flag (if there is one)
   OR deploy the previous version: `git revert <commit> && git push` (or redeploy the last good build)
2. Verify the rollback: health check, error monitoring
3. Communicate: tell the team and support that the release was rolled back

### Database considerations
- Migration [X] has a rollback: <verified command or runbook link>
- Data written by the new feature: [kept / cleaned up]

### Owner and timing
- Rollback owner: [name], reachable during the launch window
- Feature flag: < 1 minute · redeploy previous version: < 5 minutes · database rollback: < 15 minutes
```

## Output

Answer with this structure (an illustration is in `example/output.md`):

```markdown
# Launch decision: [feature] - GO | NO-GO | HOLD

## Blockers (must be fixed before GO)
- [failed gate] - evidence: [command/link] - owner: [name]

## Accepted risks (owner signed off)
- [risk] - why acceptable - mitigation

## Checklist summary
Code quality ✓ · Security ✓ · Performance ✗ (1) · Accessibility n/a · Infrastructure ✓ · Docs ✗ (1)

## Rollout and rollback
- Release mechanism: [flag name / canary / blue-green]
- Rollback plan: [link or inline], owner [name], time to roll back [minutes]
- Monitoring: [dashboards and alerts that watch this feature]

## Path to GO (only for NO-GO or HOLD)
1. [concrete step] → re-check [gate]
```

## Common rationalisations

| Rationalisation | Reality |
|---|---|
| "It works in staging, it'll work in production" | Production has different data, traffic and edge cases. Monitor after deploy. |
| "We don't need a feature flag for this" | Every feature benefits from a kill switch. Even "simple" changes break things. |
| "Monitoring is overhead" / "We'll add it later" | Without it you learn about problems from user complaints. Add it before launch. |
| "Rolling back is admitting failure" | Rolling back is responsible engineering. Shipping a broken feature is the failure. |
| "The error rate looks fine, keep going" | Check the burn rate, not just the current rate. Fast budget burn is a hold signal. |
| "The date can't move, mark it GO" | A deadline does not fix a failing test. Say no-go and show the shortest path to GO. |

## Red flags

- Deploying without a rollback plan
- No monitoring or error reporting in production
- Big-bang releases (everything at once, no staging)
- Feature flags with no expiry or owner
- Nobody watching the deploy for the first hour
- Production configuration done by memory, not code
- "It's Friday afternoon, let's ship it"
- Error budget exhausted but feature work continues unchanged

## Verification

Before deploying:

- [ ] Pre-launch checklist completed (every section green or explicitly accepted)
- [ ] Feature flag configured (if applicable)
- [ ] Rollback plan written, with owner
- [ ] Monitoring dashboards and feature-specific alerts set up
- [ ] Team, support and on-call notified of the deployment

After deploying:

- [ ] Health check returns 200
- [ ] Error rate and latency are normal
- [ ] Critical user flow works
- [ ] Logs are flowing
- [ ] Rollback tested or verified ready

For every shipped service:

- [ ] Error budget policy in place: you know what to do when the budget drops below 20% and when it is exhausted

---
Adapted from "Shipping and Launch" by Addy Osmani (https://github.com/addyosmani/agent-skills/blob/e997ac5b9a74eab332d5e9793bb38a38c8cfdd74/skills/shipping-and-launch/SKILL.md), MIT.
Changes: restructured into Goal/Steps with a go/no-go output, folded in the shared Definition of Done, removed links to other skills. See SOURCE.md.
