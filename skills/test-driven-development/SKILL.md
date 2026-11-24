---
name: test-driven-development
description: Builds every feature, bug fix and behaviour change test-first with red-green-refactor - write one failing test, watch it fail for the right reason, write the minimal code to pass, then clean up - and keeps the tests honest (no mirror assertions, no testing of mocks). Triggered by "tdd", "test first", "write the test first", "red green refactor", "implement this feature", "fix this bug".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: test
category: tests/unit
---

# Test-Driven Development

## Goal

Write the test first. Watch it fail. Write the minimal code to pass.

**Core principle:** if you did not watch the test fail, you do not know whether it tests the right thing.

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Wrote code before the test? Delete it and start over. Do not keep it as "reference", do not "adapt" it while
writing tests, do not look at it. Delete means delete. Implement fresh from the tests.

Violating the letter of these rules is violating their spirit.

**Use it always for:** new features, bug fixes, refactoring, behaviour changes.

**Exceptions (only with the agreement of the person you work for):** throwaway prototypes, generated code,
configuration files. Thinking "skip TDD just this once"? Stop. That is a rationalisation.

## Steps

The cycle, repeated for every behaviour:

```
RED (write failing test) -> verify it fails correctly --wrong failure--> back to RED
        |
        v
GREEN (minimal code) -> verify it passes, whole suite green --fails--> back to GREEN
        |
        v
REFACTOR (clean up, stay green) -> next behaviour -> RED
```

1. **Name the break before you write the test body.** Answer: *which production change would make this test
   fail, and is that change a bug or a deliberate decision?* If you cannot name one, redesign the test around an
   observable behaviour. If only a deliberate decision (a constant, exact wording) could fail it, it is a change
   detector: test the behaviour that depends on the decision instead.

2. **RED - write one minimal failing test** that shows what should happen. One behaviour, a clear name, real
   code (no mocks unless unavoidable). Derive the expected value by hand, never with the code under test.

   Good - clear name, real behaviour, one thing:
   ```typescript
   test('retries failed operations 3 times', async () => {
     let attempts = 0;
     const operation = () => {
       attempts++;
       if (attempts < 3) throw new Error('fail');
       return 'success';
     };

     const result = await retryOperation(operation);

     expect(result).toBe('success');
     expect(attempts).toBe(3);
   });
   ```

   Bad - vague name, tests the mock, not the code:
   ```typescript
   test('retry works', async () => {
     const mock = jest.fn()
       .mockRejectedValueOnce(new Error())
       .mockRejectedValueOnce(new Error())
       .mockResolvedValueOnce('success');
     await retryOperation(mock);
     expect(mock).toHaveBeenCalledTimes(3);
   });
   ```

3. **Verify RED - watch it fail. Mandatory, never skip.** Run just this test with the project's test command
   (for example `npm test path/to/retry.test.ts`, `pytest tests/test_retry.py`, `go test ./retry -run TestRetry`).
   Confirm:
   - the test *fails* (an assertion fails; it does not crash with an error),
   - the failure message is the one you expected,
   - it fails because the feature is missing, not because of a typo.

   Test passes already? You are testing existing behaviour - fix the test. Test errors? Fix the error and re-run
   until it fails correctly.

4. **GREEN - write the simplest code that passes the test.** Do not add features, options or refactor other
   code beyond what the test demands.

   Good - just enough:
   ```typescript
   async function retryOperation<T>(fn: () => Promise<T>): Promise<T> {
     for (let i = 0; i < 3; i++) {
       try {
         return await fn();
       } catch (e) {
         if (i === 2) throw e;
       }
     }
     throw new Error('unreachable');
   }
   ```

   Bad - over-engineered (YAGNI): adding `maxRetries`, `backoff: 'linear' | 'exponential'` and `onRetry`
   options that no test asked for.

5. **Verify GREEN - watch it pass. Mandatory.** Run the test again, then run the **project's whole test
   suite** (bare `pytest`, `npm test`, `cargo test` - whatever the repo uses), even if your task named only one
   test file. A scope given in the task bounds the deliverable, not your verification. Confirm:
   - the new test passes,
   - all other tests still pass,
   - the output is clean (no errors, no new warnings).

   Test fails? Fix the code, not the test. Other tests fail? Fix them now. Any failure the full run shows -
   including one you did not cause - goes into your report by name. A red test you saw scroll past and did not
   mention is a report falsified by omission.

6. **REFACTOR - only after green.** Remove duplication, improve names, extract helpers. Keep the tests green
   and add no behaviour.

7. **Repeat** with the next failing test for the next behaviour.

8. **Before you call the work done**, run the mutation check and the verification checklist below. If you
   cannot tick every box, you skipped TDD - start over.

## Writing good tests

A test exists to catch a specific break. Two principles govern everything:

```
1. Every test names the break it catches
2. Every test exercises the real thing
```

Strict TDD produces both naturally: a test written first and watched failing against real code has already
proven it can fail, and only earns a mock when the real dependency proves slow or external.

### Principle 1: name the break

- **Derive expectations independently.** Use literals and hand-checked fixtures; table-driven tests with
  literal expected values are the preferred shape. An expectation computed by the code under test - or its
  helpers - passes no matter what that code does:
  ```typescript
  // Bad - mirror assertion: the same builder computes both sides, always true
  const expected = buildSearchQuery({ tag: 'urgent' });
  expect(buildSearchQuery({ tag: 'urgent' })).toBe(expected);

  // Good - hand-derived literal
  expect(buildSearchQuery({ tag: 'urgent' })).toBe('tag:"urgent"');
  ```
- **No change detectors.** If only intentional decisions can fail a test - a constant's value, exact message
  wording, private structure - it fires on redesign and sleeps through bugs. Not `expect(MAX_RETRIES).toBe(5)`
  but "a failing call is retried 5 times and the 6th attempt never happens".
- **Behaviour, not text.** Asserting that a script or config contains an exact line proves only that the
  source is the source. Run scripts against controlled inputs and assert outputs, side effects or exit codes.
  Instructions for AI assistants are tested by how an assistant behaves with them; prose for humans earns no
  test at all.
- **Your code, not the framework.** Test the contract your code makes at its boundaries - the route you
  register, the query you emit, the payload you produce. Asserting that your router calls a registered handler
  is the framework's test, not yours. When upstream behaviour genuinely surprised you, write one narrow
  characterisation test naming the assumption. Constructors, getters, constants and trivial forwarding earn
  tests only when they validate, normalise, default, derive, enforce or cause side effects.

Gate before writing the test body:
```
Name the production change that would make this test fail.
  Cannot name one            -> redesign around an observable behaviour
  "The source text changed"  -> run the artifact and assert its effects
  Only intentional decisions -> change detector; test the behaviour that depends on the decision
Confirm the expected value is derived without the code under test.
  It reuses the code's logic or helpers -> replace it with a literal or hand-checked fixture
```

### Principle 2: exercise the real thing

- **The mock earns no assertions.** A mock assertion passes when the mock is present and fails when it is
  absent - it says nothing about the component. Assert the real component's behaviour; if the mock is what you
  are checking, unmock it or delete the assertion.
  ```typescript
  expect(screen.getByRole('navigation')).toBeInTheDocument();   // Good - real behaviour
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument(); // Bad - mock existence
  ```
  The question to ask: "Are we testing the behaviour of a mock?"
- **Mock at the right level.** Learn every side effect of the real method before replacing it; mock the slow
  or external operation and keep what the test depends on real. When unsure, run the test against the real
  implementation first and observe what actually needs to happen.
  ```typescript
  // Bad - the mock swallows the config write that duplicate detection reads
  vi.mock('ToolCatalog', () => ({ discoverAndCacheTools: vi.fn().mockResolvedValue(undefined) }));
  // Good - mock only the slow server startup; the config write stays real
  vi.mock('ServerManager');
  ```
- **Make doubles specific.** When arguments, call counts or ordering are part of the contract, assert them - a
  fake that accepts anything verifies nothing. Give each branch (success, error, malformed) its own fixture.
- **Mirror real data completely.** Mock the complete structure as it exists in reality, not just the fields
  your test reads. Partial mocks fail silently when downstream code reads an omitted field.
- **Production classes carry production methods only.** Cleanup that only tests need lives in test
  utilities, never as a `destroy()` on the production class.
- **Prefer real components over complex mocks.** When mock setup outgrows the test logic, switch to an
  integration test with real components. Ask: "Do we need to be using a mock here?"

Gate before adding a mock or test helper:
```
List the real method's side effects; keep the ones the test depends on real -
mock the slow/external level below them.
Mock responses mirror the complete real structure.
A method only tests call lives in test utilities, not production.
About to assert on the mock itself? Unmock it or delete the assertion.
```

### The mutation check

Before finishing, mentally mutate the production code; at least one test must fail for each realistic
mutation:

- wrong constant or argument,
- wrong branch handler,
- missing state change or side effect,
- empty or default return,
- missing validation for zero, empty, null, unauthorised or malformed input.

A mutation nothing catches marks the behaviour as unprotected - or the test as tautological.

Ship the tests the behaviour needs and only those: trivial code and human prose earn none, and a test written
just to satisfy process costs maintenance forever.

### Warning signs in a test

- Setup and assertion share the same object, guaranteeing equality.
- The test can fail only through a crash or a missing selector.
- It fails on every intentional change, never on accidental breakage.
- Expected values are hidden behind loops, builders or helpers.
- It greps source text, or asserts a removed symbol stays removed.
- It would still matter if only the framework remained.
- It exists for coverage and checks no side effect or outcome.
- An assertion checks a `*-mock` test id, or fails if you remove the mock.
- A method is called only from test files.
- Mock setup is more than half the test, or nobody can explain why the mock is needed.
- Mocking "just to be safe".

## Common rationalisations

| Excuse | Reality |
|--------|---------|
| "Too simple to test" | Simple code breaks. The test takes 30 seconds. |
| "I'll test after" | Tests written after pass immediately - which proves nothing. You never watched them fail, so you never proved they can catch the bug. |
| "Tests after achieve the same goals" | Tests-after answer "what does this do?"; tests-first answer "what should this do?" Tests written after are biased by the code - you verify the cases you remembered, not the ones you would have discovered. |
| "Already manually tested" | Ad hoc, no record, cannot be re-run when the code changes. "Worked when I tried it" is not comprehensive. |
| "Deleting X hours of work is wasteful" | Sunk cost. The real choice: rewrite with TDD (high confidence) or bolt tests on after (low confidence). Keeping code you cannot trust is the waste. |
| "Keep it as reference, write tests first" | You will adapt it. That is testing after. Delete means delete. |
| "Need to explore first" | Fine. Throw the exploration away, then start with TDD. |
| "Hard to test = design unclear" | Listen to the test. Hard to test means hard to use. |
| "TDD will slow me down" | TDD catches bugs before commit, prevents regressions and lets you refactor without fear. Shortcuts mean debugging in production. |
| "Existing code has no tests" | You are improving it. Add tests for the existing code. |

## Red flags - stop and start over

- Code before test, or tests added "later".
- A test passes immediately, or you cannot explain why it failed.
- "I already manually tested it", "it's about spirit, not ritual", "this is different because...".
- "Keep as reference", "adapt the existing code", "already spent X hours".
- "TDD is dogmatic, I'm being pragmatic", "just this once".

All of these mean: delete the code, start over with TDD.

## Example: bug fix

Bug: an empty email is accepted.

RED:
```typescript
test('rejects empty email', async () => {
  const result = await submitForm({ email: '' });
  expect(result.error).toBe('Email required');
});
```

Verify RED:
```
$ npm test
FAIL: expected 'Email required', got undefined
```

GREEN:
```typescript
function submitForm(data: FormData) {
  if (!data.email?.trim()) {
    return { error: 'Email required' };
  }
  // ...
}
```

Verify GREEN: `npm test` -> PASS (whole suite). REFACTOR: extract validation for several fields if needed.

Every bug follows this path: write a failing test that reproduces it, then fix. The test proves the fix and
prevents the regression. Never fix a bug without a test.

## When stuck

| Problem | Solution |
|---------|----------|
| Don't know how to test it | Write the wished-for API. Write the assertion first. Ask the person you work for. |
| Test too complicated | Design too complicated. Simplify the interface. |
| Must mock everything | Code too coupled. Use dependency injection. |
| Test setup is huge | Extract helpers. Still complex? Simplify the design. |

## Verification checklist

- [ ] Every new function or method has a test.
- [ ] Watched each test fail before implementing.
- [ ] Each test failed for the expected reason (feature missing, not a typo).
- [ ] Wrote minimal code to pass each test.
- [ ] The whole project suite passes; any failure is named in the report.
- [ ] Output is clean (no errors, no warnings).
- [ ] Tests use real code (mocks only if unavoidable) and hand-derived expected values.
- [ ] Edge cases and errors are covered; the mutation check finds no unprotected behaviour.

```
Production code -> a test exists and failed first
Otherwise       -> not TDD
```

No exceptions without the agreement of the person you work for.

---
Adapted from Test-Driven Development (TDD) by Jesse Vincent (https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/test-driven-development/SKILL.md), MIT.
Changes: folded the companion "Writing Good Tests" reference into this file, restructured into Goal/Steps, replaced the graph diagram with text, removed tool-specific references. See SOURCE.md.
