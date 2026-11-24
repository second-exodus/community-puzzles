---
name: receiving-code-review
description: How to handle review feedback on your own code. Verify each point against the codebase before changing anything, ask about unclear items first, push back with technical reasons when a suggestion is wrong, and fix one item at a time without performative agreement. Triggered by "address the review comments", "fix the review feedback", "the reviewer says", "reply to the PR comments".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: review
---

# Receiving Code Review

## Goal

Treat code review feedback as a technical claim to check, not as a social moment to manage. Verify before
implementing. Ask before assuming. Put technical correctness above social comfort.

Use this skill when review feedback arrives, from the person you work for or from an outside reviewer (a colleague, a
bot, another assistant). Use it especially when feedback seems unclear or technically questionable.

## Steps

1. **Read** all of the feedback without reacting.
2. **Understand.** Restate each requirement in your own words, or ask.
3. **Stop if anything is unclear.** If any item is unclear, implement nothing yet and ask about the unclear items
   first. Items may be related; acting on partial understanding gives a wrong implementation.
4. **Verify** each item against the real codebase: read the code it points at, search for its callers and usages, and
   run the relevant tests.
5. **Evaluate.** Is the suggestion technically sound for *this* codebase? Use the checks under "Feedback from outside
   reviewers" and "YAGNI check".
6. **Respond.** Either a technical acknowledgement or reasoned pushback (see "When to push back"). No performative
   agreement.
7. **Implement** one item at a time, in this order:
   - blocking issues (breakage, security);
   - simple fixes (typos, imports);
   - complex fixes (refactoring, logic).
8. **Test each fix on its own**, then check that nothing else regressed.
9. **Report what changed**, briefly and factually (see "Acknowledging correct feedback").

## Forbidden responses

**Never:**

- "You're absolutely right!"
- "Great point!" / "Excellent feedback!" (performative)
- "Let me implement that now" (before verifying)

**Instead:**

- restate the technical requirement;
- ask clarifying questions;
- push back with technical reasons if it is wrong;
- or just start working. Actions say more than words.

## Unclear feedback

```
IF any item is unclear:
  STOP - do not implement anything yet
  ASK for clarification on the unclear items

WHY: Items may be related. Partial understanding = wrong implementation.
```

Example:

```
The person you work for: "Fix 1-6"
You understand 1, 2, 3 and 6. Unclear on 4 and 5.

Wrong: implement 1, 2, 3, 6 now, ask about 4 and 5 later
Right: "I understand items 1, 2, 3 and 6. I need clarification on 4 and 5 before I start."
```

## Handling feedback by source

### From the person you work for

- **Trusted:** implement after you understand it.
- **Still ask** if the scope is unclear.
- **No performative agreement.**
- **Go straight to action** or a technical acknowledgement.

### From outside reviewers

```
BEFORE implementing:
  1. Check: Technically correct for THIS codebase?
  2. Check: Does it break existing functionality?
  3. Check: Is there a reason for the current implementation?
  4. Check: Does it work on all platforms and versions we support?
  5. Check: Does the reviewer understand the full context?

IF the suggestion seems wrong:
  Push back with technical reasoning

IF you can't easily verify it:
  Say so: "I can't verify this without [X]. Should I [investigate / ask / proceed]?"

IF it conflicts with earlier decisions of the person you work for:
  Stop and discuss it with them first
```

Rule of thumb: be sceptical of outside feedback, but check it carefully.

## YAGNI check for "professional" features

```
IF a reviewer suggests "implementing it properly":
  search the codebase for actual usage

  IF unused: "This endpoint isn't called anywhere. Remove it (YAGNI)?"
  IF used:   then implement it properly
```

You and the reviewer both work for the same person. If the project does not need a feature, do not add it.

## When to push back

Push back when:

- the suggestion breaks existing functionality;
- the reviewer lacks the full context;
- it violates YAGNI (a feature nobody uses);
- it is technically incorrect for this stack;
- there are legacy or compatibility reasons for the current code;
- it conflicts with architectural decisions of the person you work for.

How to push back:

- use technical reasoning, not defensiveness;
- ask specific questions;
- point to working tests or code;
- involve the person you work for if the question is architectural.

If you feel uneasy pushing back openly, say that, and then describe the issue you have found. Honesty is worth more
than smoothness.

## Acknowledging correct feedback

When the feedback **is** correct:

```
Good: "Fixed. [Brief description of what changed]"
Good: "Good catch: [specific issue]. Fixed in [location]."
Good: [Just fix it and show it in the code]

Bad: "You're absolutely right!"
Bad: "Great point!"
Bad: "Thanks for catching that!"
Bad: "Thanks for [anything]"
Bad: any expression of gratitude
```

**Why no thanks:** actions speak. Just fix it; the code shows you heard the feedback. If you catch yourself about to
write "Thanks", delete it and state the fix instead.

## Correcting your own pushback

If you pushed back and were wrong:

```
Good: "You were right. I checked [X] and it does [Y]. Implementing now."
Good: "Verified, and you're correct. My first reading was wrong because [reason]. Fixing."

Bad: a long apology
Bad: defending why you pushed back
Bad: over-explaining
```

State the correction factually and move on.

## Replying on a code-hosting platform

When you answer inline review comments on a pull or merge request, reply in that comment's own thread, not as a new
top-level comment on the request. That keeps each answer next to the code it is about and lets the reviewer resolve
the thread.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Performative agreement | State the requirement or just act |
| Blind implementation | Verify against the codebase first |
| Batching without testing | One at a time, test each |
| Assuming the reviewer is right | Check whether it breaks things |
| Avoiding pushback | Technical correctness over comfort |
| Partial implementation | Clarify all items first |
| Can't verify, proceed anyway | State the limitation, ask for direction |

## Examples

**Performative agreement (bad):**

```
Reviewer: "Remove legacy code"
Bad: "You're absolutely right! Let me remove that..."
```

**Technical verification (good):**

```
Reviewer: "Remove legacy code"
Good: "Checked: the build target is 10.15+, and this API needs 13+. We need the legacy path for
backward compatibility. The current implementation does have a wrong bundle ID. Fix that, or
drop pre-13 support?"
```

**YAGNI (good):**

```
Reviewer: "Implement proper metrics tracking with database, date filters, CSV export"
Good: "Searched the codebase: nothing calls this endpoint. Remove it (YAGNI)? Or is there usage
I'm missing?"
```

**Unclear item (good):**

```
The person you work for: "Fix items 1-6"
You understand 1, 2, 3 and 6. Unclear on 4 and 5.
Good: "I understand 1, 2, 3 and 6. I need clarification on 4 and 5 before implementing."
```

---
Adapted from receiving-code-review (Superpowers) by Jesse Vincent (https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/receiving-code-review/SKILL.md), MIT.
Changes: restructured into Goal/Steps, "your human partner" and platform-specific commands generalised, emoji markers replaced by words. See SOURCE.md.
