---
name: code-simplification
description: Simplifies working code for clarity while preserving its exact behaviour, one tested change at a time, following the project's own conventions. Triggered by "simplify this", "clean up this code", "reduce the nesting", "make this more readable", "this function is too complex".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: review/style
---

# Code Simplification

## Goal

Reduce complexity while preserving exact behaviour. The goal is not fewer lines; it is code that is easier to read,
understand, modify and debug. Every simplification must pass one test: "Would a new team member understand this
faster than the original?"

## Steps

1. **Scope it.** Default to the code that was recently changed or that the person pointed to. Do not touch unrelated
   code unless the person asks you to broaden the scope.
2. **Read the conventions.** Read the project's convention files (contributing guide, style guide, the instruction
   file for AI assistants if there is one) and study how neighbouring code handles similar patterns. Simplification
   means more consistent with this codebase, not with your own preferences.
3. **Understand before touching.** Answer the questions in "Chesterton's Fence" below. If you cannot answer them,
   read more context first; you are not ready to simplify.
4. **Identify opportunities.** Scan the code with the tables in "What to look for". Each row is a concrete signal,
   not a vague smell. Skip anything that would only trade one style for another.
5. **Apply changes one at a time.** For each simplification: make the change, run the test suite, keep it if the
   tests pass, revert and reconsider if they fail. Never batch several simplifications into one untested change.
   Keep refactoring separate from feature or bug-fix changes.
6. **Verify the whole.** Compare before and after (see "Verification") and revert any change that did not make the
   code easier to understand. Not every simplification attempt succeeds.
7. **Report.** List each simplification, why behaviour is unchanged, how you checked it (tests, build, linter), and
   any judgment calls you only flagged instead of changing.

## When to use

- After a feature works and tests pass, but the implementation feels heavier than it needs to be
- During code review when readability or complexity issues are flagged
- When you meet deeply nested logic, long functions or unclear names
- When refactoring code written under time pressure
- When consolidating related logic scattered across files
- After merging changes that introduced duplication or inconsistency

**When not to use:**

- The code is already clean and readable; do not simplify for the sake of it
- You do not understand what the code does yet; comprehend before you simplify
- The code is performance-critical and the "simpler" version would be measurably slower
- You are about to rewrite the module entirely; simplifying throwaway code wastes effort

## The five principles

### 1. Preserve behaviour exactly

Do not change what the code does, only how it expresses it. All inputs, outputs, side effects, error behaviour and
edge cases must stay identical. If you are not sure a simplification preserves behaviour, do not make it.

```
ASK BEFORE EVERY CHANGE:
→ Does this produce the same output for every input?
→ Does this keep the same error behaviour?
→ Does this preserve the same side effects and ordering?
→ Do all existing tests still pass without modification?
```

### 2. Follow project conventions

Before simplifying:

```
1. Read the project's convention files
2. Study how neighbouring code handles similar patterns
3. Match the project's style for:
   - Import ordering and module system
   - Function declaration style
   - Naming conventions
   - Error handling patterns
   - Type annotation depth
```

Simplification that breaks project consistency is not simplification; it is churn.

### 3. Prefer clarity over cleverness

Explicit code is better than compact code when the compact version needs a mental pause to parse.

```typescript
// UNCLEAR: Dense ternary chain
const label = isNew ? 'New' : isUpdated ? 'Updated' : isArchived ? 'Archived' : 'Active';

// CLEAR: Readable mapping
function getStatusLabel(item: Item): string {
  if (item.isNew) return 'New';
  if (item.isUpdated) return 'Updated';
  if (item.isArchived) return 'Archived';
  return 'Active';
}
```

```typescript
// UNCLEAR: Chained reduce with inline logic
const result = items.reduce((acc, item) => ({
  ...acc,
  [item.id]: { ...acc[item.id], count: (acc[item.id]?.count ?? 0) + 1 }
}), {});

// CLEAR: Named intermediate step
const countById = new Map<string, number>();
for (const item of items) {
  countById.set(item.id, (countById.get(item.id) ?? 0) + 1);
}
```

Note that the second pair also changes the result's shape (a `Map` of numbers instead of an object of
`{ count }` objects). Make such a change only when you also update every caller, and treat it as a change to verify,
not a pure rewrite.

### 4. Maintain balance

Simplification has a failure mode: over-simplification. Watch for these traps:

- **Inlining too aggressively:** removing a helper that gave a concept a name makes the call site harder to read
- **Combining unrelated logic:** two simple functions merged into one complex function is not simpler
- **Removing "unnecessary" abstraction:** some abstractions exist for extensibility or testability, not complexity
- **Optimising for line count:** fewer lines is not the goal; easier comprehension is

### 5. Scope to what changed

Default to simplifying recently modified code. Avoid drive-by refactors of unrelated code unless explicitly asked
to broaden the scope. Unscoped simplification creates noise in diffs and risks unintended regressions.

## Chesterton's Fence

Before changing or removing anything, understand why it exists. If you see a fence across a road and do not know why
it is there, do not tear it down. First find the reason, then decide whether the reason still applies.

```
BEFORE SIMPLIFYING, ANSWER:
- What is this code's responsibility?
- What calls it? What does it call?
- What are the edge cases and error paths?
- Are there tests that define the expected behaviour?
- Why might it have been written this way? (Performance? Platform constraint? Historical reason?)
- What does the version history (for example git blame) say about the original context?
```

## What to look for

**Structural complexity:**

| Pattern | Signal | Simplification |
|---------|--------|----------------|
| Deep nesting (3+ levels) | Hard to follow control flow | Extract conditions into guard clauses or helper functions |
| Long functions (50+ lines) | Multiple responsibilities | Split into focused functions with descriptive names |
| Nested ternaries | Requires a mental stack to parse | Replace with if/else chains, switch, or lookup objects |
| Boolean parameter flags | `doThing(true, false, true)` | Replace with options objects or separate functions |
| Repeated conditionals | Same `if` check in multiple places | Extract to a well-named predicate function |

**Naming and readability:**

| Pattern | Signal | Simplification |
|---------|--------|----------------|
| Generic names | `data`, `result`, `temp`, `val`, `item` | Rename to describe the content: `userProfile`, `validationErrors` |
| Abbreviated names | `usr`, `cfg`, `btn`, `evt` | Use full words unless the abbreviation is universal (`id`, `url`, `api`) |
| Misleading names | Function named `get` that also mutates state | Rename to reflect actual behaviour |
| Comments explaining "what" | `// increment counter` above `count++` | Delete the comment; the code is clear enough |
| Comments explaining "why" | `// Retry because the API is flaky under load` | Keep these; they carry intent the code cannot express |

**Redundancy:**

| Pattern | Signal | Simplification |
|---------|--------|----------------|
| Duplicated logic | Same 5+ lines in multiple places | Extract to a shared function |
| Dead code | Unreachable branches, unused variables, commented-out blocks | Remove (after confirming it is truly dead) |
| Unnecessary abstractions | Wrapper that adds no value | Inline the wrapper, call the underlying function directly |
| Over-engineered patterns | Factory-for-a-factory, strategy-with-one-strategy | Replace with the simple direct approach |
| Redundant type assertions | Casting to a type that is already inferred | Remove the assertion |

## Applying changes

```
FOR EACH SIMPLIFICATION:
1. Make the change
2. Run the test suite
3. If tests pass → commit (or continue to the next simplification)
4. If tests fail → revert and reconsider
```

If something breaks, you need to know which simplification caused it, so never batch them untested. Submit
refactoring separately from feature or bug-fix work: a pull request that refactors and adds a feature is two pull
requests.

**The rule of 500:** if a refactoring would touch more than 500 lines, invest in automation (codemods, scripted
search-and-replace, AST transforms) rather than making the changes by hand. Manual edits at that scale are
error-prone and exhausting to review.

## Language-specific examples

### TypeScript / JavaScript

```typescript
// SIMPLIFY: Unnecessary async wrapper
// Before
async function getUser(id: string): Promise<User> {
  return await userService.findById(id);
}
// After
function getUser(id: string): Promise<User> {
  return userService.findById(id);
}
// Only safe if findById always returns a promise and never throws synchronously;
// otherwise the error turns from a rejected promise into a thrown exception.

// SIMPLIFY: Verbose conditional assignment
// Before
let displayName: string;
if (user.nickname) {
  displayName = user.nickname;
} else {
  displayName = user.fullName;
}
// After
const displayName = user.nickname || user.fullName;

// SIMPLIFY: Manual array building
// Before
const activeUsers: User[] = [];
for (const user of users) {
  if (user.isActive) {
    activeUsers.push(user);
  }
}
// After
const activeUsers = users.filter((user) => user.isActive);

// SIMPLIFY: Redundant boolean return
// Before
function isValid(input: string): boolean {
  if (input.length > 0 && input.length < 100) {
    return true;
  }
  return false;
}
// After
function isValid(input: string): boolean {
  return input.length > 0 && input.length < 100;
}
```

### Python

```python
# SIMPLIFY: Verbose dictionary building
# Before
result = {}
for item in items:
    result[item.id] = item.name
# After
result = {item.id: item.name for item in items}

# SIMPLIFY: Nested conditionals with early return
# Before
def process(data):
    if data is not None:
        if data.is_valid():
            if data.has_permission():
                return do_work(data)
            else:
                raise PermissionError("No permission")
        else:
            raise ValueError("Invalid data")
    else:
        raise TypeError("Data is None")
# After
def process(data):
    if data is None:
        raise TypeError("Data is None")
    if not data.is_valid():
        raise ValueError("Invalid data")
    if not data.has_permission():
        raise PermissionError("No permission")
    return do_work(data)
```

### React / JSX

```tsx
// SIMPLIFY: Verbose conditional rendering
// Before
function UserBadge({ user }: Props) {
  if (user.isAdmin) {
    return <Badge variant="admin">Admin</Badge>;
  } else {
    return <Badge variant="default">User</Badge>;
  }
}
// After
function UserBadge({ user }: Props) {
  const variant = user.isAdmin ? 'admin' : 'default';
  const label = user.isAdmin ? 'Admin' : 'User';
  return <Badge variant={variant}>{label}</Badge>;
}

// FLAG, DON'T CHANGE: Prop drilling through intermediate components.
// Whether context or composition solves it better is a judgment call; mention it in the report.
```

## Common rationalizations

| Rationalization | Reality |
|---|---|
| "It's working, no need to touch it" | Working code that is hard to read will be hard to fix when it breaks. Simplifying now saves time on every future change. |
| "Fewer lines is always simpler" | A one-line nested ternary is not simpler than a five-line if/else. Simplicity is about comprehension speed, not line count. |
| "I'll just quickly simplify this unrelated code too" | Unscoped simplification creates noisy diffs and risks regressions in code you did not intend to change. Stay focused. |
| "The types make it self-documenting" | Types document structure, not intent. A well-named function explains *why* better than a type signature explains *what*. |
| "This abstraction might be useful later" | Do not preserve speculative abstractions. If it is not used now, it is complexity without value. Remove it and re-add it when needed. |
| "The original author must have had a reason" | Maybe. Check the version history and apply Chesterton's Fence. But accumulated complexity often has no reason; it is the residue of iteration under pressure. |
| "I'll refactor while adding this feature" | Separate refactoring from feature work. Mixed changes are harder to review, revert and understand in history. |

## Red flags

- Simplification that requires modifying tests to pass (you likely changed behaviour)
- "Simplified" code that is longer and harder to follow than the original
- Renaming things to match your preferences rather than project conventions
- Removing error handling because "it makes the code cleaner"
- Simplifying code you do not fully understand
- Batching many simplifications into one large, hard-to-review commit
- Refactoring code outside the scope of the current task without being asked

## Verification

Compare before and after:

```
- Is the simplified version genuinely easier to understand?
- Did you introduce any new patterns inconsistent with the codebase?
- Is the diff clean and reviewable?
- Would a teammate approve this change?
```

After completing a simplification pass:

- [ ] All existing tests pass without modification
- [ ] Build succeeds with no new warnings
- [ ] Linter and formatter pass (no style regressions)
- [ ] Each simplification is a reviewable, incremental change
- [ ] The diff is clean; no unrelated changes mixed in
- [ ] Simplified code follows the project's conventions
- [ ] No error handling was removed or weakened
- [ ] No dead code was left behind (unused imports, unreachable branches)
- [ ] A teammate or reviewer would approve the change as a net improvement

---
Adapted from Code Simplification by Addy Osmani (https://github.com/addyosmani/agent-skills/blob/e997ac5b9a74eab332d5e9793bb38a38c8cfdd74/skills/code-simplification/SKILL.md), MIT.
Changes: added Goal and numbered Steps, generalised assistant-specific file names, added behaviour caveats to two examples. See SOURCE.md.
