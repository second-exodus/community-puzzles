---
name: "Memory bank"
description: Gives the assistant a memory across sessions. A folder of plain Markdown files about the project that it reads completely at the start of every task and updates at the end, so work continues where it stopped. Works with the phrases "initialize memory bank", "update memory bank" and "read the memory bank".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: beginner
category: start
---

# Memory bank

An assistant's memory resets completely between sessions. This is not a limitation to hide; it is the reason to keep
perfect notes. After each reset the assistant relies **entirely** on the memory bank to understand the project and
continue the work. The memory bank is a folder of ordinary Markdown files in the project, so the person and every
assistant can read and edit it.

**How to use this rule:** add this file to the instructions your assistant loads for this project (for example,
link it from the project's `AGENTS.md`). Then say "initialize memory bank" once.

## The files

```text
memory-bank/
├── projectbrief.md     # foundation: requirements, goals, scope
├── productContext.md   # why the project exists, how it should work for users
├── systemPatterns.md   # architecture and patterns
├── techContext.md      # technologies, setup, constraints
├── activeContext.md    # current focus, recent changes, next steps
└── progress.md         # what works, what is left, known issues
```

The files build on each other: `projectbrief.md` shapes `productContext.md`, `systemPatterns.md` and
`techContext.md`, and those three feed `activeContext.md` and `progress.md`.

| File | Contains |
|------|----------|
| `projectbrief.md` | Core requirements and goals. Created first. The source of truth for the project's scope. |
| `productContext.md` | Why the project exists, the problems it solves, how it should work, user experience goals. |
| `systemPatterns.md` | System architecture, key technical decisions, design patterns in use, how components relate, critical implementation paths. |
| `techContext.md` | Technologies used, development setup, technical constraints, dependencies, tool usage patterns. |
| `activeContext.md` | Current focus, recent changes, next steps, active decisions, important patterns and preferences, learnings. Changes most often. |
| `progress.md` | What works, what is left to build, current status, known issues, how project decisions evolved. |

## Must

- Read **all** files in `memory-bank/` at the start of **every** task, before planning or changing anything. This is
  not optional, even for a task that looks small.
- If `memory-bank/` is missing or incomplete, say so and offer to initialise it; do not work as if it were there.
- On "initialize memory bank": create the folder and the six core files from what you can learn from the project
  (README, manifests, code, docs) and from the person. Ask the person for the goals and scope you cannot read from
  the project, and mark guesses as guesses.
- Treat `projectbrief.md` as the source of truth for scope. When another file contradicts it, point out the
  conflict and ask the person which one is right; change the brief only with their agreement.
- Update the memory bank when you discover a new project pattern, after implementing a significant change, when
  the context needs clarification, and whenever the person says "update memory bank".
- On "update memory bank": review **every** file, even those that seem unchanged, and bring each one up to date.
  Focus on `activeContext.md` and `progress.md`, which track the current state.
- Before a task ends, update at least `activeContext.md` (what changed, what is next) and `progress.md` (what now
  works, what is left, new known issues).
- When the conversation is getting long and close to the assistant's context limit, update the memory bank first,
  then suggest continuing in a fresh conversation that starts with "read the memory bank".
- On "read the memory bank" (or "follow your instructions"): read all files and continue where the last session
  stopped.
- Write facts in plain Markdown that a person can read: decisions with their reason, not chat transcripts.
- Never write secrets, passwords, tokens, keys or personal data into the memory bank.

## Should

- Start with a basic project brief and let the structure grow with the project.
- Create additional files or subfolders inside `memory-bank/` when they help organise complex feature
  documentation, integration specifications, API documentation, testing strategies or deployment procedures, and
  mention each one in `activeContext.md` or `systemPatterns.md` so it gets read.
- Let the assistant draft the initial files, then have the person read and correct them.
- Review `progress.md` when resuming work after a break.
- Update after significant milestones or changes of direction; during active development at least every few
  sessions.
- Keep each file short and current: replace outdated statements instead of adding contradictions, and use absolute
  dates (`2026-11-24`), not "yesterday".
- Keep the memory bank in version control with the code, so collaborators and other assistants share the same
  memory.
- Keep the README for humans; the memory bank is the structured, frequently changing context for the assistant
  (current focus, progress), which a README does not cover.

## Examples

Start of a task:

```text
1. Read every file in memory-bank/.
2. Check: is the brief clear, is the current focus clear? If not, ask.
3. Plan the task from what activeContext.md and progress.md say.
4. Do the task.
5. Update activeContext.md and progress.md (and any other file the task changed).
```

A typical `activeContext.md`:

```markdown
# Active context (updated 2026-11-24)

## Current focus
Password reset by email (see progress.md, milestone 3).

## Recent changes
- Added `POST /auth/reset-request`; sends a link valid for 30 minutes.
- Decided: reset tokens are stored hashed (reason: a leaked database must not allow resets).

## Next steps
1. Build the "set new password" page.
2. Add a rate limit: 3 reset requests per hour per email.

## Preferences and learnings
- The person prefers small pull requests, one feature each.
- Integration tests need the local mail catcher running: `docker compose up mail`.
```

Phrases the person can use:

- "initialize memory bank": create the folder and the six core files.
- "read the memory bank": read everything and continue where the last session stopped.
- "update memory bank": review and update every file, for example before ending a long session.

---
Adapted from Memory Bank by Cline Bot Inc. (https://github.com/cline/cline/blob/34c104e6fc49781cda4adcd73ffdccd8f029fef9/docs/best-practices/memory-bank.mdx), Apache-2.0.
Changes: rewritten as tool-neutral rules (Must, Should, Examples), removed product names, commands and settings, added rules on conflicts, secrets and dates and an example. See SOURCE.md.
