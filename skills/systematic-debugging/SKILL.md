---
name: systematic-debugging
description: Finds the root cause of a bug, test failure or unexpected behaviour before any fix is proposed - four phases (investigate, compare patterns, test one hypothesis, fix with a failing test) plus backward tracing, defence in depth and condition-based waiting for flaky tests. Triggered by "debug this", "why does this fail", "test is failing", "flaky test", "fix this bug", "it doesn't work".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: tests
---

# Systematic Debugging

## Goal

Find the root cause before attempting any fix. Symptom fixes are failure.

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you have not completed Phase 1, you cannot propose fixes. Violating the letter of this process is violating
the spirit of debugging.

Use it for any technical issue: test failures, production bugs, unexpected behaviour, performance problems,
build failures, integration issues. Use it **especially** when you are under time pressure, when "one quick
fix" seems obvious, when you have already tried several fixes, or when you do not fully understand the issue.
Do not skip it because the issue seems simple (simple bugs have root causes too) or because someone wants it
fixed now (systematic is faster than thrashing).

## Steps

Complete each phase before moving to the next.

### Phase 1 - Root cause investigation

1. **Read the error messages carefully.** Do not skip errors or warnings; they often contain the exact
   answer. Read stack traces completely. Note line numbers, file paths, error codes.
2. **Reproduce it consistently.** What are the exact steps? Does it happen every time? If it is not
   reproducible, gather more data - do not guess.
3. **Check recent changes.** What changed that could cause this? Look at the diff and recent commits, new
   dependencies, config changes, environment differences.
4. **Gather evidence across component boundaries** when the system has several components
   (CI -> build -> signing, API -> service -> database). Before proposing a fix, instrument every boundary:
   ```
   For EACH component boundary:
     - log what data enters the component
     - log what data leaves the component
     - verify environment and config propagation
     - check the state at each layer
   Run once to gather evidence showing WHERE it breaks,
   then analyse the evidence to find the failing component,
   then investigate that specific component.
   ```
   Example for a signing pipeline:
   ```bash
   # Layer 1: workflow
   echo "IDENTITY: $([ -n "${IDENTITY:-}" ] && echo SET || echo UNSET)"
   # Layer 2: build script
   printenv IDENTITY >/dev/null 2>&1 && echo "IDENTITY in environment" || echo "IDENTITY not in environment"
   # Layer 3: signing script
   security list-keychains; security find-identity -v
   # Layer 4: the actual signing
   codesign --sign "$IDENTITY" --verbose=4 "$APP"
   ```
   This shows which layer fails (secrets reach the workflow, but not the build).
5. **Trace the data flow backwards** when the error appears deep in the call stack - see
   "Root cause tracing" below. Where does the bad value come from? What called this with the bad value? Keep
   tracing up until you find the source. Fix at the source, not at the symptom.

### Phase 2 - Pattern analysis

1. **Find working examples:** similar code in the same codebase that works.
2. **Compare against references:** if you are implementing a pattern, read the reference implementation
   completely - every line, no skimming.
3. **List every difference** between working and broken, however small. Do not assume "that can't matter".
4. **Understand the dependencies:** which components, settings, config and environment does it need, and
   what does it assume?

### Phase 3 - Hypothesis and testing

1. **Form a single hypothesis.** Write it down: "I think X is the root cause because Y." Be specific.
2. **Test it minimally:** the smallest possible change, one variable at a time.
3. **Verify before continuing.** It worked -> Phase 4. It did not -> form a *new* hypothesis. Do not stack
   more fixes on top.
4. **When you do not know,** say "I don't understand X". Do not pretend. Ask for help or research more.

### Phase 4 - Implementation

1. **Create a failing test case first:** the simplest reproduction, automated if possible, a one-off script
   if there is no test framework. You must have it before fixing. Write it red-green style: watch it fail
   for the right reason.
2. **Implement a single fix** that addresses the root cause. One change at a time. No "while I'm here"
   improvements, no bundled refactoring.
3. **Verify the fix yourself before claiming success:** the new test passes, the rest of the suite still
   passes, and the original symptom is actually gone.
4. **If the fix does not work:** stop and count how many fixes you have tried. Fewer than 3 -> return to
   Phase 1 with the new information. **3 or more -> stop and question the architecture** (next step). Do not
   attempt fix number 4 without that discussion.
5. **If 3+ fixes failed, question the architecture.** Signs of an architectural problem: each fix reveals new
   shared state or coupling somewhere else, fixes need "massive refactoring", each fix creates new symptoms
   elsewhere. Ask: is this pattern fundamentally sound? Are we sticking with it through sheer inertia? Discuss
   it with the person you work for before attempting more fixes. This is not a failed hypothesis - it is a
   wrong architecture.

### When the process finds "no root cause"

If the investigation shows the issue is truly environmental, timing-dependent or external: document what you
investigated, implement appropriate handling (retry, timeout, clear error message) and add logging or
monitoring for next time. But 95% of "no root cause" cases are incomplete investigation.

## Root cause tracing

Bugs often surface deep in the call stack (git init in the wrong directory, a file created in the wrong place,
a database opened with the wrong path). The instinct is to fix where the error appears. That treats a symptom.
Trace backwards through the call chain until you find the original trigger, then fix it there.

1. **Observe the symptom:** `Error: git init failed in ~/project/packages/core`
2. **Find the immediate cause:** `await execFileAsync('git', ['init'], { cwd: projectDir });`
3. **Ask what called it:** `WorktreeManager.createSessionWorktree` <- `Session.initializeWorkspace` <-
   `Session.create` <- a test calling `Project.create`.
4. **Keep tracing up - what value was passed?** `projectDir = ''`. An empty `cwd` resolves to the current
   working directory: the source tree.
5. **Find the original trigger:** the test read `context.tempDir` at top level, before the setup hook had
   filled it, so it was still `''`.

Fix: `tempDir` became a getter that throws when read before setup - plus validation at the other layers
(see defence in depth).

When you cannot trace by reading, add instrumentation **before** the dangerous operation:
```typescript
async function gitInit(directory: string) {
  console.error('DEBUG git init:', {
    directory, cwd: process.cwd(), nodeEnv: process.env.NODE_ENV, stack: new Error().stack,
  });
  await execFileAsync('git', ['init'], { cwd: directory });
}
```
Run and filter: `npm test 2>&1 | grep 'DEBUG git init'`. In tests, write to stderr directly - a logger may
be silenced. Include context (directory, cwd, environment, timestamps) and the full stack, then look for test
file names, the triggering line and the repeating pattern.

**Which test pollutes?** When something appears during a test run (a stray file, a `.git` folder, leftover
state) and you do not know which test creates it, bisect: run the test files one at a time and stop at the
first one after which the pollution exists.
```bash
POLLUTION=packages/core/.git   # the file or folder that should not appear
for f in $(find src -name '*.test.ts' | sort); do
  [ -e "$POLLUTION" ] && { echo "already present before $f - remove it and restart"; break; }
  npm test "$f" > /dev/null 2>&1 || true   # the project's command for running one test file
  [ -e "$POLLUTION" ] && { echo "FOUND POLLUTER: $f"; ls -la "$POLLUTION"; break; }
done
```
Then run that one test alone and read its code.

## Defence in depth

After you find the root cause of a bug caused by invalid data, one check at one place feels sufficient - but
other code paths, refactoring or mocks can bypass it. Validate at every layer the data passes through and make
the bug structurally impossible:

1. **Entry point validation** - reject obviously invalid input at the API boundary (empty, missing, wrong
   type, does not exist).
2. **Business logic validation** - check the data makes sense for this operation.
3. **Environment guards** - refuse dangerous operations in specific contexts, for example: during tests,
   refuse `git init` outside the temp directory.
4. **Debug instrumentation** - log context and stack before the dangerous operation, for forensics.

Map every checkpoint the data passes, add the check at each, then test each layer: try to bypass layer 1 and
verify layer 2 catches it. In the example above all four layers were needed - different code paths bypassed
the entry check, mocks bypassed the business check, and platform differences needed the environment guard.

## Condition-based waiting (flaky tests)

Flaky tests often guess at timing with fixed delays: they pass on a fast machine and fail under load or in CI.
Wait for the condition you actually care about instead.

```typescript
// Bad - guessing at timing
await new Promise(r => setTimeout(r, 50));
expect(getResult()).toBeDefined();

// Good - wait for the condition
await waitFor(() => getResult() !== undefined, 'result to be set');
expect(getResult()).toBeDefined();
```

```typescript
async function waitFor<T>(
  condition: () => T | undefined | null | false,
  description: string,
  timeoutMs = 5000,
): Promise<T> {
  const start = Date.now();
  while (true) {
    const result = condition();          // read fresh state inside the loop
    if (result) return result;
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timeout waiting for ${description} after ${timeoutMs}ms`);
    }
    await new Promise(r => setTimeout(r, 10)); // poll every 10 ms, not every 1 ms
  }
}
```

Always include a timeout with a clear message, and never cache state before the loop. A fixed delay is right
only when you test timing itself (debounce, throttle, ticks): first wait for the triggering condition, then
wait a duration derived from the known timing, and write a comment explaining why.

## Red flags - stop and return to Phase 1

- "Quick fix for now, investigate later."
- "Just try changing X and see if it works." / "Add several changes, then run the tests."
- "Skip the test, I'll verify manually."
- "It's probably X, let me fix that." / "I don't fully understand, but this might work."
- "The pattern says X, but I'll adapt it differently."
- Listing fixes before any investigation; proposing solutions before tracing the data flow.
- "One more fix attempt" after 2 or more failed ones; each fix reveals a new problem somewhere else.

Signals from the person you work for that you are doing it wrong: "Is that not happening?" (you assumed
without verifying), "Will it show us...?" (you should have gathered evidence), "Stop guessing", "Think harder
about this" (question the fundamentals), "We're stuck?" (your approach is not working). When you hear them:
stop and return to Phase 1.

## Common rationalisations

| Excuse | Reality |
|--------|---------|
| "Issue is simple, no process needed" | Simple issues have root causes too. The process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is faster than guess-and-check thrashing. |
| "Just try this first, then investigate" | The first fix sets the pattern. Do it right from the start. |
| "I'll write the test after the fix works" | Untested fixes don't stick. A test first proves it. |
| "Several fixes at once saves time" | You cannot isolate what worked, and it causes new bugs. |
| "The reference is too long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely. |
| "I see the problem, let me fix it" | Seeing symptoms is not understanding the root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures mean an architectural problem. Question the pattern. |

## Quick reference

| Phase | Key activities | Done when |
|-------|---------------|-----------|
| 1. Root cause | Read errors, reproduce, check changes, gather evidence, trace backwards | You understand WHAT and WHY |
| 2. Pattern | Find working examples, compare, list differences | Differences identified |
| 3. Hypothesis | One theory, smallest test | Confirmed, or a new hypothesis |
| 4. Implementation | Failing test, single fix, verify | Bug resolved, suite green |

---
Adapted from Systematic Debugging by Jesse Vincent (https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/systematic-debugging/SKILL.md), MIT.
Changes: folded the three technique files and the test-polluter script into this file, restructured into Goal/Steps, removed references to other skills and assistant-specific wording. See SOURCE.md.
