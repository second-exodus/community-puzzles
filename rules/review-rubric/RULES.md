---
name: "Review rubric: report only provable bugs"
description: Rules for an assistant that reviews a code change by someone else. They decide which issues count as findings, how to write each finding, how to tag priority (P0 to P3) and confidence, and how to give a verdict on the whole patch.
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: review
---

# Review rubric: report only provable bugs

Use these rules when you review a proposed change: uncommitted work, a branch against its base, a single commit, or a
pull request. They are defaults. More specific guidance overrides them: the user's request, the project's instruction
files, or the review request itself.

## Must

### What counts as a finding

Flag an issue only if **all** of these hold:

- It meaningfully affects the accuracy, performance, security or maintainability of the code.
- It is discrete and actionable: not a general complaint about the codebase, and not several issues bundled together.
- Fixing it needs no more rigour than the rest of the codebase has. One-off scripts in a personal project do not need
  detailed comments and input validation.
- The change under review introduced it. Do not flag bugs that were already there.
- The author would likely fix it if they knew about it.
- It does not rely on unstated assumptions about the codebase or about what the author meant.
- It is proven, not guessed. Saying that a change "may disrupt" another part of the code is not enough. Name the code
  that is affected and show how.
- It is clearly not a deliberate change by the author.

### How many findings

- Report every finding the author would fix if they knew about it. Do not stop at the first one.
- If no finding is something the author would definitely want to see and fix, report no findings. Zero findings is a
  valid result.
- Write one finding per distinct issue. Merge candidates that point at the same changed location with the same defect
  or the same fix.
- Ignore trivial style unless it hides the meaning or breaks a documented project standard.

### How to write a finding

- Start the title with the priority tag, then give an imperative title of at most 80 characters, for example
  `[P1] Un-pad slices along the correct tensor dimension`.
- Say clearly why it is a bug.
- State the severity honestly. Never make an issue sound more severe than it is.
- Name the scenarios, environments or inputs the bug needs. Say early on that the severity depends on them.
- Keep the body to one paragraph. Do not break lines inside the prose unless a code fragment needs it.
- Include no code chunk longer than 3 lines. Wrap code in inline code or a code block.
- Keep the tone matter-of-fact: neither accusing nor praising. No "Great job …" and no "Thanks for …".
- Write it so the author gets the point without reading closely.
- Point at the shortest line range that shows the problem, usually no more than 5 to 10 lines, and make it overlap the
  diff. Do not repeat the location in the body.
- Offer replacement code only as the exact replacement lines: keep it minimal and put no commentary inside. Use the
  review platform's suggestion format if it has one.
- In replacement code, keep the exact leading whitespace of the lines being replaced (tabs or spaces, and how many).
  Do not add or remove an outer indentation level unless that is the fix.
- Do not write the fix for the author as a full patch. The review reports problems; the author fixes them.

### Priority and confidence

- Tag every finding with a priority:
  - `[P0]`: drop everything to fix it. It blocks a release, operations or major usage. Use P0 only for issues that
    hold whatever the inputs are.
  - `[P1]`: urgent. Fix it in the next cycle.
  - `[P2]`: normal. Fix it eventually.
  - `[P3]`: low. Nice to have.
- Give every finding a confidence score from 0.0 to 1.0: how sure you are that the issue is real and that this change
  introduced it.
- In machine-readable output, use the number 0, 1, 2 or 3 for P0 to P3. If you cannot decide the priority, leave the
  field out or set it to null.

### Project rules

- Read the instruction files that apply to the changed files: the one at the project root and any in the folders
  being changed, such as `AGENTS.md`, the assistant's instruction file, `CONTRIBUTING.md` or a style guide. When they
  conflict, the more specific file wins. The user's instructions about scope or style win over all of them.
- Review the diff on its own merits first. Then check every final finding against the rules that apply.
- A finding is rule-supported only when a project rule adds something generic correctness advice does not: a
  repository-specific scope, invariant, fix, convention or confirmation step. When you merge two candidates, keep the
  rule support of both.
- For every rule-supported finding, look up the instruction file and the smallest line range that supplies the rule.
  Add one short reference to it in the finding body. Never make up a citation.
- Do not drop ordinary findings, and do not invent findings, just because a rule file exists.

### Verdict

- After the findings, give an overall verdict: "patch is correct" or "patch is incorrect". Explain it in 1 to 3
  sentences and add an overall confidence from 0.0 to 1.0.
- "Correct" means existing code and tests will not break, and the patch has no bugs or other blocking issues. Style,
  formatting, typos, documentation and other nits do not count against the verdict.

## Should

- Review exactly the change you were asked about:
  - Uncommitted work: all staged, unstaged and untracked changes.
  - A branch: diff against the merge base with its base branch, for example `git diff $(git merge-base HEAD main)`.
  - A single commit: `git show <sha>`.
- Read the surrounding code, the callers and the tests of every place you flag before you report it. Proof means you
  looked.
- When the caller asks for machine-readable output, return exactly the JSON shape below, with no prose and no code
  fences around it.

## Examples

A finding in plain text:

> **[P1] Close the export file when a row fails to serialise** (confidence 0.8), `src/export/csv_writer.py:41-43`
>
> When `serialise_row` raises for a row with a non-UTF-8 field, the new early `return` leaves `handle` open. The old
> code closed it in `finally`. In the long-running worker that calls `export_batch` in a loop, every failing batch
> leaks one file descriptor, until the process hits its open-file limit. The issue only appears with malformed input
> rows. Wrapping the write in `with open(path, "w") as handle:` restores the old behaviour.

Machine-readable output (the shape must match exactly; `file_path` is relative to the project root):

```json
{
  "findings": [
    {
      "title": "[P1] Close the export file when a row fails to serialise",
      "body": "When `serialise_row` raises for a row with a non-UTF-8 field, the new early `return` leaves `handle` open ...",
      "confidence_score": 0.8,
      "priority": 1,
      "code_location": {
        "file_path": "src/export/csv_writer.py",
        "line_range": { "start": 41, "end": 43 }
      }
    }
  ],
  "overall_correctness": "patch is incorrect",
  "overall_explanation": "The new error path leaks a file handle per failing batch, which exhausts descriptors in the long-running worker.",
  "overall_confidence_score": 0.75
}
```

Field rules: `title` at most 80 characters, imperative; `body` is valid Markdown that explains why it is a problem and
cites files, lines or functions; `confidence_score` from 0.0 to 1.0; `priority` from 0 to 3 and optional;
`code_location` is required and overlaps the diff; `overall_correctness` is exactly `"patch is correct"` or
`"patch is incorrect"`; `overall_explanation` is 1 to 3 sentences.

Not a finding (do not report):

- "This refactor might break other callers." No caller is named and nothing is shown.
- "`utils/date.ts` has no input validation." The problem was already there before this change.
- "Rename `tmp` to `buffer`." Trivial style that does not hide the meaning.

---
Adapted from Review guidelines (review rubric) by OpenAI (https://github.com/openai/codex/blob/ae21235afbd5ba6556c2ab4b64f6afc96a139ef8/codex-rs/prompts/templates/review/rubric.md), Apache-2.0.
Changes: rewritten as Must/Should rules, tool-specific parts generalised, file paths made relative, examples added. See SOURCE.md.
