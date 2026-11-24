> Illustration only: what this skill produces for a fictional checkout launch planned for tomorrow.

# Launch decision: Checkout v2 - NO-GO

## Blockers (must be fixed before GO)
- End-to-end checkout test fails on payment confirmation timeout - evidence: CI run #4812, job `e2e` - owner: Lena
- Staging smoke test not run since the last payment-provider change - evidence: staging log, last run 6 days ago - owner: Lena
- No rollback owner and no rollback commands written down - evidence: release ticket has no rollback section - owner: Tomás
- No alerts for payment failures or duplicate charges; only request rate and latency exist - evidence: monitoring config - owner: Priya
- Support and on-call have not received the launch runbook - owner: Tomás

## Accepted risks (owner signed off)
- None. The sponsor asked for GO despite the failing end-to-end test; a deadline does not turn a failed gate green.

## Checklist summary
Code quality ✗ (1) · Security ✓ · Performance ✓ · Accessibility ✓ · Infrastructure ✗ (2) · Docs ✗ (1)

## Rollout and rollback
- Release mechanism: flag `checkout_v2`, can be switched off without a deploy
- Database: additive nullable column, migration tested on staging - no rollback needed for the schema
- Rollback plan: missing (blocker above)
- Monitoring: request rate and latency dashboards exist; payment-specific alerts missing (blocker above)

## Path to GO
1. Fix the confirmation timeout and get the end-to-end test green → re-run CI.
2. Run the staging smoke test against the current payment provider → record the result in the ticket.
3. Write the rollback plan (flag off < 1 min, owner Tomás, reachable during launch) → review with on-call.
4. Add alerts for payment failure rate and duplicate charges → trigger each once on staging.
5. Send the runbook to support and on-call.
6. Re-run this check. Earliest realistic GO: day after tomorrow, flag ON for staff first, then 5% canary.
