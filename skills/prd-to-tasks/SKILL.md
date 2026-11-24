---
name: prd-to-tasks
description: Takes a feature idea through three small steps, first a short Product Requirements Document (PRD) written after a few clarifying questions, then a task list of parent tasks and sub-tasks, then the build itself, one sub-task at a time with a check-off and a review after each. Triggered by "write a PRD", "create a PRD for", "generate tasks from this PRD", "turn this PRD into tasks", "start on task 1.1".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: tasks
---

# PRD to Tasks

## Goal

Build a feature with an assistant without handing it one huge request. Instead:

1. **Define the scope** in a PRD: what is built, for whom and why. Clear enough for a junior developer.
2. **Plan** by breaking the PRD into a task list with parent tasks and small sub-tasks.
3. **Build step by step**: one sub-task at a time, checked off in the file, with a pause for the person to review.

The person stays in control at three points: they answer the clarifying questions, they say "Go" before the
sub-tasks are written, and they review each finished sub-task.

## Steps

### Part 1: Write the PRD

1. **Read the request.** The person describes the feature, often briefly. If they point to files, read them. Look
   at the project too (README, the code around the feature) so you do not ask what is already answered there.
2. **Ask clarifying questions before writing anything.** Ask only the 3 to 5 most important ones, about the
   **what** and the **why**, not the how (the developer works that out). Ask only where the answer cannot
   reasonably be inferred and would clearly change the PRD. Typical gaps:
   - **Problem and goal:** what problem does this solve for the user?
   - **Core functionality:** what are the key actions a user must be able to do?
   - **Scope:** what should this feature explicitly *not* do?
   - **Success:** how will we know it works?
   - also, where relevant: who the target user is, which data is shown or changed, design or mockups to follow,
     edge cases and error states.
3. **Format the questions for a quick reply.** Number the questions (1, 2, 3 …) and give lettered options (A, B, C,
   D …) so the person can answer with "1A, 2C, 3B" (see the example below). Add a "Something else: …" option
   where none of yours may fit. Then wait for the answers.
4. **Write the PRD** with the structure below, using the request and the answers. Write for a **junior
   developer**: explicit, unambiguous, no unexplained jargon, enough detail to understand the purpose and the core
   logic.
5. **Save it** as `tasks/prd-<feature-name>.md` from the project root (create the `tasks/` folder if needed), with
   the feature name in kebab-case.
6. **Do not start implementing.** Show the person where the PRD is and ask them to read it. Improve it with their
   feedback before going on.

### Part 2: Generate the task list

1. **Read the requirements**: the PRD (or another feature description the person points to). Analyse the
   functional requirements, the user stories and the scope.
2. **Look at the codebase** to see what already exists: architecture, conventions, components, utilities and test
   setup you can reuse, and the files the feature will touch.
3. **Write the parent tasks first.** Usually about 5 high-level tasks. Always start with **task 0.0 "Create
   feature branch"** unless the person says they do not want a branch. Save them in the task file and show them,
   then say: "I have generated the high-level tasks based on your requirements. Ready to generate the sub-tasks?
   Respond with 'Go' to proceed."
4. **Wait for "Go".** This pause makes sure the high-level plan matches what the person expects before you go into
   detail. If they change the parent tasks, update them first.
5. **Break each parent task into sub-tasks.** Small, concrete, in a logical order, together covering everything the
   requirements imply. A parent task that is purely structural or configuration may need no sub-tasks.
6. **List the relevant files**: every file that will probably be created or changed, each with one line on why,
   and its test file next to it where there is one.
7. **Add notes** for the implementer: where tests live in this project and the exact command to run them (read it
   from the project, for example the scripts in the package manifest or the CI configuration).
8. **Save the task list** as `tasks/tasks-<feature-name>.md` using the output format below. Use the same
   `<feature-name>` as the PRD (a PRD `prd-user-profile-editing.md` gives `tasks-user-profile-editing.md`).

### Part 3: Work through the tasks

1. Start only when the person says so, with the sub-task they name (usually "Please start on task 1.1").
2. Do **one sub-task**, then stop: change its `- [ ]` to `- [x]` in the task file, say in two or three lines what
   you did and how you checked it, and ask the person to review before the next sub-task.
3. When all sub-tasks of a parent task are done: run the project's tests (and linters if it has them), fix what
   fails, then tick the parent task. Do not tick anything whose check failed.
4. Update the task file after **every** sub-task, not only at the end of a parent task, and add any new file you
   created to **Relevant Files**.
5. If you find work the list missed, add it as a new sub-task and tell the person, instead of doing it silently.
6. If a sub-task turns out bigger or different than planned, stop and ask instead of improvising a large change.

## PRD structure

1. **Introduction / overview:** the feature and the problem it solves, in a few sentences. State the goal.
2. **Goals:** specific, measurable objectives.
3. **User stories:** "As a <user>, I want <action> so that <benefit>."
4. **Functional requirements:** numbered, each one clear and testable, for example "1. The system must allow users
   to upload a profile picture."
5. **Non-goals (out of scope):** what this feature will not include.
6. **Design considerations (optional):** mockups, UI and UX requirements, components or styles to reuse.
7. **Technical considerations (optional):** known constraints, dependencies, suggestions (for example "Should
   integrate with the existing auth module").
8. **Success metrics:** how success is measured (for example "Reduce support tickets about X by 50%").
9. **Open questions:** anything still unclear.

## Clarifying questions: example format

```text
1. What is the primary goal of this feature?
   A. Improve the onboarding experience
   B. Increase user retention
   C. Reduce support burden
   D. Something else: ...

2. Who is the target user?
   A. New users only
   B. Existing users only
   C. All users
   D. Admin users only

3. What should happen when the upload fails?
   A. Show an error and keep the old picture
   B. Retry automatically once, then show an error
   C. Something else: ...
```

## Task list output format

```markdown
## Relevant Files

- `path/to/file1.ts` - Why this file matters (e.g. main component for this feature).
- `path/to/file1.test.ts` - Unit tests for `file1.ts`.
- `path/to/api/route.ts` - Why (e.g. API route handler for the form data).
- `path/to/api/route.test.ts` - Unit tests for `route.ts`.

### Notes

- Unit tests sit next to the code they test (e.g. `MyComponent.tsx` and `MyComponent.test.tsx`).
- Run the tests with `<the project's test command> [optional/path/to/test/file]`.

## Instructions for Completing Tasks

As you complete each task, check it off in this file by changing `- [ ]` to `- [x]`.
Update the file after each sub-task, not only after a whole parent task.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and check out a new branch for this feature (e.g. `git checkout -b feature/<feature-name>`)
- [ ] 1.0 <Parent task title>
  - [ ] 1.1 <Sub-task>
  - [ ] 1.2 <Sub-task>
- [ ] 2.0 <Parent task title>
  - [ ] 2.1 <Sub-task>
- [ ] 3.0 <Parent task title (may need no sub-tasks if purely structural or configuration)>
```

## Checks before you hand over

- The PRD has all nine sections (optional ones may say "none"), and every functional requirement is numbered and
  testable.
- Non-goals are written down; nothing in the task list builds a non-goal.
- Every functional requirement in the PRD is covered by at least one sub-task.
- Each sub-task is small enough to review in one sitting and names what to change, not just "implement feature".
- The test command in the notes really exists in this project.

## Tips for the person

- **Be specific.** The more context in your first description and your answers, the better the PRD.
- **Point to the right file.** When you ask for the task list, name the PRD file exactly.
- **Stay in the loop.** Review each sub-task. If the assistant struggles, rephrase the request or split the task
  further.

## Example

See `example/output.md` for a short PRD and the task list made from it.

---
Adapted from create-prd.md and generate-tasks.md by Ryan Carson (https://github.com/snarktank/ai-dev-tasks/tree/efbffaac10e68c94e14aaa587c79b7d5015b5ebd), Apache-2.0.
Changes: merged both prompts and the README workflow into one skill with three parts, generalised file tagging and the test command, added checks and an example. See SOURCE.md.
