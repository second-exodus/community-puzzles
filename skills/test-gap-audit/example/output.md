> Illustration only: an invented report for a fictional Node.js shop, showing the shape of the output.

**Test Gap Audit: POST /orders and refunds (scoped)**

No code changed. I reviewed `src/routes/orders.ts`, `src/services/refunds.ts`, their tests and the repo's Vitest conventions. Ran the two related test files (green) and the coverage helper. P0s found: 1.

1. **P0: Refund amount is never tested against the captured amount.**
   Gap: `createRefund` accepts any `amount`; nothing proves a refund above the captured payment is rejected.
   Current coverage: `refunds.test.ts` only covers a full refund of a captured order.
   Evidence: code `src/services/refunds.ts:42` (`export async function createRefund`); tests `test/refunds.test.ts:12`.
   Suggested test: unit test in `test/refunds.test.ts` - "rejects a refund larger than the captured amount": capture 50.00, refund 50.01, expect `RefundExceedsCaptureError` and no call to the payment client.

2. **P1: No authorisation test for POST /orders/:id/refund.**
   Gap: the route checks `order.ownerId` against the session user, but no test sends another user's session.
   Current coverage: `test/orders.route.test.ts:30` posts only as the owner.
   Evidence: code `src/routes/orders.ts:88` (`if (order.ownerId !== session.userId)`); tests `test/orders.route.test.ts:30`.
   Suggested test: route test "returns 404 when refunding another user's order", assert status 404 and that no refund row exists.

3. **P2: Idempotency key is mocked away.**
   Gap: `test/orders.route.test.ts` mocks `idempotencyStore`, so a repeated POST with the same key is never exercised.
   Current coverage: the mock returns `undefined` for every key.
   Evidence: tests `test/orders.route.test.ts:8` (`vi.mock('../src/lib/idempotencyStore')`).
   Confidence: high.
   Suggested test: integration test with the in-memory store - two identical POSTs with one key create one order and return the same id.

**Suggested Test Plan**
- Refund above captured amount (P0), then cross-user refund (P1), then idempotent POST (P2).

**Existing Coverage Worth Keeping**
- `test/orders.route.test.ts:45` - validation of empty carts, asserts status and error body.

**Checks Run**
- `npx vitest run test/refunds.test.ts test/orders.route.test.ts`: 2 files, 9 tests passed.
- `python3 <skill-folder>/scripts/coverage_map.py --top 10`: 18 source files, 14 matched, 4 unmatched; `src/services/refunds.ts` is not among them; top unmatched `src/lib/currency.ts` (confirmed by search: only used in e2e tests).

**Not Tested**
- Payment provider sandbox: needs credentials, not available.
