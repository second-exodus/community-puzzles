---
name: code-review-and-quality
description: Reviews a code change on five axes (correctness, readability, architecture, security, performance), labels every finding by severity and ends with a clear approve or request-changes verdict. Works for code written by you, another assistant or a person. Triggered by "review this PR", "review my changes", "code review", "is this ready to merge", "check this diff".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: review/style
---

# Code Review and Quality

## Goal

Review every change before it is merged, with no exceptions. Cover five axes: correctness, readability, architecture,
security and performance. Label each finding so the author knows what is required and what is optional.

**The approval standard:** approve a change when it definitely improves the overall health of the code, even if it
is not perfect. Perfect code does not exist; the goal is continuous improvement. Do not block a change because it is
not exactly how you would have written it. If it improves the codebase and follows the project's conventions,
approve it.

Use this skill:

- before merging any pull request or change;
- after finishing a feature;
- when another assistant, model or person wrote code you need to evaluate;
- when refactoring existing code;
- after any bug fix (review the fix and its regression test);
- when asked to review a diff or a pull request, even when the diff is pasted inline and looks quick to read.

## Steps

1. **Understand the context.** Before reading code, find out the intent:
   - What is this change trying to do?
   - Which spec or task does it implement?
   - Which change in behaviour is expected?
2. **Review the tests first.** Tests show intent and coverage:
   - Are there tests for the change?
   - Do they test behaviour, not implementation details?
   - Are edge cases covered? Do the tests have descriptive names?
   - Would the tests catch a regression if the code changed? Answer this by experiment, not by reading: invert one
     condition the change adds (drop a negation, swap `&&` for `||`), run the tests, then restore the file from a
     copy. If a mutation stays green, that is a finding: name the missing test case.
3. **Review the implementation.** Walk through each changed file with the five axes below:
   correctness (does it do what the test says?), readability (can I follow it without help?), architecture (does it
   fit the system?), security (any vulnerabilities?), performance (any bottlenecks?). Read the whole file when the
   diff alone does not show whether the change makes sense.
4. **Check and label the findings.**
   - Before reporting a finding, check it against the callers, guards and tests that reach the changed code. Drop it
     if they rule it out.
   - Label defects that already exist in the base separately from regressions this change introduces.
   - Zero findings is a valid result. Do not invent one.
   - Give every comment a severity label (see "Severity labels").
   - Lead with what matters: correctness and security first, then structural regressions and missed simplifications,
     then everything else. A few high-conviction comments beat a long list. If you have one structural problem and
     ten nits, the structural problem *is* the review.
   - For a structural problem, propose the move, not just the problem (see "Structural remedies").
5. **Verify the verification.** Check the author's story:
   - Which tests were run? Did the build pass?
   - Was the change tested by hand? Are there screenshots for UI changes, or a before/after comparison?
   - Before you run tests or probes yourself, make sure the checkout is clean and on the reviewed revision
     (`git status --short` is empty and `git rev-parse HEAD` matches the head of the change). Name that revision in
     the review. A working copy can hold uncommitted edits from another session, so evidence from it may describe
     code that is not in the change.
6. **Write the review** with the checklist under "Output" and end with a verdict: approve or request changes.
7. **After a refactor or implementation change, check for dead code** (see "Dead code hygiene") and ask before
   deleting anything.

## The five axes

### 1. Correctness

Does the code do what it claims to do?

- Does it match the spec or task requirements?
- Are edge cases handled (null, empty, boundary values)?
- Are error paths handled, not just the happy path?
- Does it pass all tests? Do the tests actually test the right things?
- Are there off-by-one errors, race conditions or inconsistent state?

### 2. Readability and simplicity

Can another engineer (or assistant) understand this code without the author explaining it?

- Are names descriptive and consistent with project conventions? (No `temp`, `data`, `result` without context.)
- Is the control flow straightforward (no nested ternaries, no deep callbacks)?
- Is the code organised logically (related code grouped, clear module boundaries)?
- Are there "clever" tricks that should be simplified?
- **Could this be done in fewer lines?** (1000 lines where 100 would do is a failure.)
- **Do the abstractions earn their complexity?** (Don't generalise before the third use case.)
- Would comments clarify intent that is not obvious? (But don't comment obvious code.)
- Are there dead-code artefacts: no-op variables (`_unused`), backwards-compatibility shims, `// removed` comments?
- **Is a new conditional bolted onto an unrelated flow?** That is a design smell, not a nit. Push the logic into its
  own helper, state or policy instead of tangling an existing path.
- **Do repeated conditionals on the same shape appear?** They signal a missing model or dispatcher. A "temporary"
  branch usually becomes permanent debt.

### 3. Architecture

Does the change fit the system's design?

- Does it follow existing patterns or introduce a new one? If new, is it justified?
- Does it keep module boundaries clean?
- Is there duplicated code that should be shared?
- Do dependencies flow in the right direction (no circular dependencies)?
- Is the level of abstraction right (not over-engineered, not too coupled)?
- **Does this refactor reduce complexity or just move it?** Count the concepts a reader must hold to follow the
  change. If a "cleaner" version leaves that count unchanged, it is not cleaner. Prefer the restructuring that makes
  whole branches, modes or layers disappear over one that re-centralises the same logic. Prefer deleting an
  abstraction to polishing it.
- **Is feature-specific logic leaking into a shared or general-purpose module?** Keep logic in the layer that owns
  it, reuse the existing canonical helper instead of a near-duplicate, and do not normalise architectural drift.
- **Are type boundaries explicit?** Question needless `any`/`unknown`/optional types, casts and silent fallbacks that
  paper over an unclear invariant. Making the boundary explicit often simplifies the surrounding control flow.

### 4. Security

Does the change introduce vulnerabilities? (For a deep, security-only pass over a risky change, run a dedicated
security review as well.)

- Is user input validated and sanitised?
- Are secrets kept out of code, logs and version control?
- Is authentication and authorisation checked where needed?
- Are SQL queries parameterised (no string concatenation)?
- Are outputs encoded to prevent XSS?
- Do dependencies come from trusted sources, with no known vulnerabilities?
- Is data from external sources (APIs, logs, user content, config files) treated as untrusted?
- Are external data flows validated at system boundaries before they are used in logic or rendering?

### 5. Performance

Does the change introduce performance problems?

- Any N+1 query patterns?
- Any unbounded loops or unconstrained data fetching?
- Any synchronous operations that should be asynchronous?
- Any unnecessary re-renders in UI components?
- Any list endpoints without pagination?
- Any large objects created in hot paths?

## Severity labels

Label every comment so the author knows what is required and what is optional:

| Prefix | Meaning | Author action |
|--------|---------|---------------|
| *(no prefix)* | Required change | Must address before merge |
| **Critical:** | Blocks merge | Security vulnerability, data loss, broken functionality |
| **Nit:** | Minor, optional | Author may ignore: formatting, style preferences |
| **Optional:** / **Consider:** | Suggestion | Worth considering but not required |
| **FYI** | Information only | No action needed; context for the future |

This keeps authors from treating all feedback as mandatory and wasting time on optional suggestions.

## Structural remedies

When you flag a structural problem, propose the move, not just the problem. A review that only says "this is
complex" leaves the author guessing. Name a restructuring:

- **Replace a chain of conditionals** with a typed model or an explicit dispatcher.
- **Collapse duplicate branches** into one clearer flow.
- **Separate orchestration from business logic** so each reads on its own.
- **Move feature-specific logic** out of a shared module into the package that owns the concept.
- **Reuse the canonical helper** instead of a home-made near-duplicate.
- **Make a type boundary explicit** so downstream branching disappears.
- **Delete a pass-through wrapper** that adds indirection without clarifying the API.
- **Extract a helper, or split a large file** into focused modules.

Prefer the remedy that removes moving pieces over one that spreads the same complexity around.

## Change sizing

Small, focused changes are easier to review, faster to merge and safer to deploy:

```
~100 lines changed   → Good. Reviewable in one sitting.
~300 lines changed   → Acceptable if it is a single logical change.
~1000 lines changed  → Too large. Split it.
```

**Watch file size, not just diff size.** A small diff can still push a file past a healthy size. Around 1000 *total*
lines in one file (different from the ~1000 *changed* lines above) is a common warning sign, not a hard cap. When a
change materially grows an already large file, ask whether to extract helpers, subcomponents or modules *first*.
Decompose, then add.

**What counts as "one change":** one self-contained modification that addresses one thing, includes its tests and
keeps the system working after it is merged. One part of a feature, not the whole feature.

**Splitting a change that is too large:**

| Strategy | How | When |
|----------|-----|------|
| **Stack** | Submit a small change, start the next one on top of it | Sequential dependencies |
| **By file group** | Separate changes for groups that need different reviewers | Cross-cutting concerns |
| **Horizontal** | Shared code and stubs first, then the consumers | Layered architecture |
| **Vertical** | Smaller full-stack slices of the feature | Feature work |

**When large changes are acceptable:** deleting whole files and automated refactoring, where the reviewer only needs
to check the intent, not every line.

**Separate refactoring from feature work.** A change that refactors existing code and adds new behaviour is two
changes; submit them separately. Small cleanups (renaming a variable) can stay in at the reviewer's discretion.

## Change descriptions

Every change needs a description that stands on its own in the version history.

- **First line:** short, imperative, standalone. "Delete the FizzBuzz RPC", not "Deleting the FizzBuzz RPC". Someone
  searching the history must understand the change without reading the diff.
- **Body:** what is changing and why. Include context, decisions and reasoning that the code does not show. Link bug
  numbers, benchmark results or design docs where relevant. Admit the approach's shortcomings when there are some.
- **Anti-patterns:** "Fix bug", "Fix build", "Add patch", "Moving code from A to B", "Phase 1", "Add convenience
  functions".

## Second-reviewer pattern

Have a different reviewer look at the change than the one who wrote it:

```
Assistant session A writes the code
    │
    ▼
A second session (ideally a different model) or a person reviews correctness and architecture
    │
    ▼
Session A addresses the feedback
    │
    ▼
A person makes the final call
```

Different models and different people have different blind spots. Example request for the second reviewer:

```
Review this code change for correctness, security, and adherence to
our project conventions. The spec says [X]. The change should [Y].
Flag any issues as Critical, Required, Optional, or Nit.
```

## Dead code hygiene

After any refactoring or implementation change, look for orphaned code:

1. Find code that is now unreachable or unused.
2. List it explicitly.
3. **Ask before deleting:** "Should I remove these now-unused elements: [list]?"

Don't leave dead code lying around; it confuses future readers and assistants. But don't silently delete things you
are not sure about. When in doubt, ask.

```
DEAD CODE IDENTIFIED:
- formatLegacyDate() in src/utils/date.ts — replaced by formatDate()
- OldTaskCard component in src/components/ — replaced by TaskCard
- LEGACY_API_URL constant in src/config.ts — no remaining references
→ Safe to remove these?
```

## Review speed

Slow reviews block whole teams. Switching context to review costs less than the waiting it imposes on others.

- **Respond within one business day.** That is the maximum, not the target.
- **Ideal cadence:** respond shortly after a request arrives, unless you are deep in focused work. A typical change
  should get through several review rounds in one day.
- **Prefer fast individual responses** to a quick final approval. Quick feedback reduces frustration even if several
  rounds are needed.
- **Large changes:** ask the author to split them instead of reviewing one huge change.

## Handling disagreements

Settle review disputes in this order:

1. **Technical facts and data** override opinions and preferences.
2. **Style guides** are the final authority on style.
3. **Software design** is judged on engineering principles, not personal preference.
4. **Consistency with the codebase** is acceptable if it does not lower overall code health.

**Don't accept "I'll clean it up later."** Deferred cleanup rarely happens. Require the cleanup before merge unless
it is a genuine emergency. If surrounding issues cannot be fixed in this change, require a ticket assigned to the
author.

## Honesty in review

Whether the code was written by you, another assistant or a person:

- **Don't rubber-stamp.** "LGTM" without evidence of review helps no one.
- **Don't soften real issues.** Calling a bug that will hit production "a minor concern" is dishonest.
- **Quantify problems when you can.** "This N+1 query adds about 50 ms per item in the list" beats "this could be
  slow".
- **Push back on approaches with clear problems.** Sycophancy is a failure mode in reviews. If the implementation has
  issues, say so directly and propose alternatives.
- **Accept being overruled gracefully.** If the author has the full context and disagrees, defer to their judgement.
  Comment on the code, not the person.

## Dependency discipline

Reviewing dependencies is part of code review.

**Before adding any dependency:**

1. Does the existing stack already solve this? (Often it does.)
2. How large is the dependency? (Check the bundle or install size.)
3. Is it actively maintained? (Check the last commit and open issues.)
4. Does it have known vulnerabilities? (Run the ecosystem's audit tool, for example `npm audit`, `pip-audit` or
   `cargo audit`.)
5. What is its licence? (It must be compatible with the project.)

**Rule:** prefer the standard library and existing utilities to new dependencies. Every dependency is a liability.

**Upgrading an existing dependency** is a code change like any other. The riskiest upgrades are the ones merged in
bulk with a message like "bump deps". Review them with the same discipline:

1. **Read the changelog, not just the version number.** Semver is a promise the maintainer may not have kept: a
   "patch" can change behaviour. For a major bump, read the migration notes and find what breaks.
2. **One dependency per change.** Upgrade and merge them one at a time (or in small related groups). When a bulk bump
   breaks the build, you no longer know which package did it.
3. **Let the tests decide.** The upgrade is verified by a green test suite before *and* after, not by "it installed".
   If coverage around the dependency's behaviour is thin, that gap is the real finding: add a test first.
4. **Mind the transitive graph.** Most installed packages are ones nobody chose directly. Review the lockfile diff,
   not just the manifest; one direct bump can pull in dozens of indirect changes.
5. **Keep the lockfile honest.** Commit it, review its diff and never edit it by hand. The lockfile is what actually
   pins what ships.

## Output

Write the review with this checklist:

```markdown
## Review: [change title]   (reviewed revision: <commit>)

### Context
- [ ] I understand what this change does and why

### Correctness
- [ ] Change matches spec/task requirements
- [ ] Edge cases handled
- [ ] Error paths handled
- [ ] Tests cover the change adequately

### Readability
- [ ] Names are clear and consistent
- [ ] Logic is straightforward
- [ ] No unnecessary complexity

### Architecture
- [ ] Follows existing patterns
- [ ] No unnecessary coupling or dependencies
- [ ] Appropriate abstraction level
- [ ] Refactors reduce complexity rather than relocate it
- [ ] No feature logic in shared modules; file stays within a healthy size

### Security
- [ ] No secrets in code
- [ ] Input validated at boundaries
- [ ] No injection vulnerabilities
- [ ] Auth checks in place
- [ ] External data sources treated as untrusted

### Performance
- [ ] No N+1 patterns
- [ ] No unbounded operations
- [ ] Pagination on list endpoints

### Verification
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Manual verification done (if applicable)

### Findings (most important first, each with its severity label)
- Critical: …
- …

### Verdict
- [ ] **Approve**: ready to merge
- [ ] **Request changes**: issues must be addressed
```

## Common rationalisations

| Rationalisation | Reality |
|---|---|
| "It works, that's good enough" | Working code that is unreadable, insecure or architecturally wrong creates debt that compounds. |
| "I wrote it, so I know it's correct" | Authors are blind to their own assumptions. Every change benefits from another set of eyes. |
| "We'll clean it up later" | Later never comes. The review is the quality gate; use it. Require cleanup before merge, not after. |
| "AI-generated code is probably fine" | AI code needs more scrutiny, not less. It is confident and plausible, even when wrong. |
| "The tests pass, so it's good" | Tests are necessary but not sufficient. They don't catch architecture problems, security issues or readability concerns. |
| "The refactor makes it cleaner" | Moving complexity is not reducing it. If the reader still holds the same number of concepts, the structure did not improve. |
| "It's only a small addition to this file" | Small diffs still push files past a healthy size and bolt branches onto unrelated flows. Judge the resulting structure, not the diff size. |
| "It's just a version bump" | A bump is a behaviour change you didn't write. Read the changelog; semver doesn't guarantee no breakage. |
| "I'll upgrade everything in one PR to save time" | A bulk bump that breaks the build hides which package did it. One dependency per change keeps cause and revert clean. |

## Red flags

- Changes merged without any review.
- A review that only checks whether the tests pass and ignores the other axes.
- "LGTM" without evidence of actual review.
- Security-sensitive changes without a security-focused review.
- Pull requests that are "too big to review properly" (split them).
- Bug-fix changes without a regression test.
- Review comments without severity labels, so it is unclear what is required and what is optional.
- Accepting "I'll fix it later". It never happens.
- A refactor that moves code around without reducing the number of concepts a reader must hold.
- A change that grows an already large file instead of decomposing it.
- New conditionals scattered into unrelated code paths (a missing abstraction).
- A home-made helper that duplicates an existing canonical one, or feature logic placed in a shared module.
- A bulk "bump dependencies" change with no changelog review and no per-package isolation.
- A lockfile change that is hand-edited, uncommitted or merged without reviewing its diff.

## Verification

After the review is done:

- [ ] All Critical issues are resolved.
- [ ] All Required (no prefix) changes are resolved or explicitly deferred with a reason.
- [ ] Tests pass.
- [ ] The build succeeds.
- [ ] The verification story is written down (what changed, how it was verified).
- [ ] Dependency upgrades were checked against their changelog, isolated per package, verified by a green test suite,
      and their lockfile diff was reviewed.

**Presumptive blockers.** For each of these, point it out and propose the simpler design. Escalate to Required only
when the change actively makes the structure worse:

- a refactor that moves complexity instead of reducing it;
- a change that pushes a file past the size limit with no decomposition;
- feature logic added to a shared module;
- a near-duplicate of an existing canonical helper;
- a silent fallback that hides an unclear invariant.

---
Adapted from Code Review and Quality by Addy Osmani (https://github.com/addyosmani/agent-skills/blob/e997ac5b9a74eab332d5e9793bb38a38c8cfdd74/skills/code-review-and-quality/SKILL.md), MIT.
Changes: restructured into Goal/Steps, links to the source repo's other skills removed, tool-specific wording generalised. See SOURCE.md.
