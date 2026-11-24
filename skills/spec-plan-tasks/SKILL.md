---
name: spec-plan-tasks
description: Turns a feature request into three gated documents, a spec (what and why), a plan (how) and a task list (ordered, checkable steps with file paths), and lets no stage start before the previous one passes its gate. Triggered by "spec this feature", "write a spec", "spec, plan and tasks", "plan this feature", "break the plan into tasks".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: tasks
---

# Spec, Plan, Tasks

## Goal

Get from a loose feature description to a task list that another developer, or another assistant session, can
carry out without guessing. Three stages, each closed by a gate:

1. **Spec**: what users need and why. No technology.
2. **Plan**: how it will be built. Technical context, research decisions, data model, interfaces, a validation guide.
3. **Tasks**: numbered, checkable tasks grouped by user story, each with an exact file path.

A stage that fails its gate goes back, not forward. Implementation starts only after the task list passes its gate
and the person says go.

Use it for a new feature or a significant change with more than a handful of steps, or whenever several people or
sessions need the same picture of "done". Skip it for a one-line fix; do the fix and say what you did.

## Files

All documents for one feature live in one folder:

```text
specs/<NNN>-<short-name>/
├── spec.md                     # Stage 1
├── checklists/requirements.md  # Stage 1 quality gate
├── plan.md                     # Stage 2
├── research.md                 # Stage 2, phase 0
├── data-model.md               # Stage 2, phase 1 (if data is involved)
├── contracts/                  # Stage 2, phase 1 (if the feature exposes interfaces)
├── quickstart.md               # Stage 2, phase 1
└── tasks.md                    # Stage 3
```

- `<NNN>` is the next free three-digit number in `specs/` (or a `YYYYMMDD-HHMMSS` timestamp if the project already
  numbers that way). If the project keeps specs somewhere else, use that place.
- `<short-name>` is 2 to 4 words in kebab-case, action-noun where possible, keeping technical terms:
  "I want to add user authentication" → `user-auth`; "Implement OAuth2 integration for the API" →
  `oauth2-api-integration`; "Fix payment processing timeout bug" → `fix-payment-timeout`.
- One feature per folder. The folder name and the git branch name are independent; the person decides the branch.
- **Project principles:** if the project has a principles file (architecture rules, a constitution, `AGENTS.md`,
  a contributing guide), read it at the start of every stage. Its rules are gates.

## Steps

### Stage 1: Specify (what and why)

1. Read the feature description. If it is empty, stop and ask for one.
2. Extract the key concepts: actors, actions, data, constraints.
3. For each unclear point, make an informed guess from the context and common practice and write it under
   **Assumptions**. Mark it `[NEEDS CLARIFICATION: <specific question>]` only if the choice significantly changes
   scope or user experience, several reasonable readings lead to different results, and no reasonable default
   exists. **At most 3 markers in total**, ranked by impact: scope > security/privacy > user experience >
   technical details.
4. Write `spec.md` from the spec template below. Fill **User Scenarios** first: prioritised user stories (P1, P2,
   P3 …), each independently testable, so that implementing only that story still delivers a usable slice. If you
   cannot describe a single user flow, stop and say so.
5. Write **Functional Requirements** (`FR-001` …), each testable. Then **Success Criteria** (`SC-001` …):
   measurable, technology-agnostic, checkable without knowing the implementation. Add **Key Entities** if data is
   involved. Delete optional sections that do not apply; never leave "N/A".
6. Write `checklists/requirements.md` with the spec quality checklist below and check the spec against every item.
   For each failure, quote the spec passage, fix the spec and check again, at most 3 rounds. If items still fail,
   write them in the checklist notes and warn the person.
7. If `[NEEDS CLARIFICATION]` markers remain, ask all of them together in one message (format below), wait for the
   answers, write them into the spec and run the checklist again.
8. Optional but recommended: run the **ambiguity scan** below. If the person skips it, say that the risk of rework
   later goes up.

**Gate 1: the spec is ready when** every checklist item passes, no marker remains, and the person has read the spec.

### Stage 2: Plan (how)

1. Read `spec.md` and the project principles.
2. Fill the **Technical Context** of `plan.md`: language and version, main dependencies, storage, testing, target
   platform, project type, performance goals, constraints, scale. Write `NEEDS CLARIFICATION` for anything you do
   not know. Do not invent it.
3. **Principles check (gate before research):** list every rule from the principles file that this plan touches and
   whether the plan follows it. A violation is allowed only with a row in **Complexity Tracking**: what is needed,
   why, and why the simpler alternative was rejected. An unjustified violation stops the plan.
4. **Phase 0, research.** Turn every `NEEDS CLARIFICATION` into a research question, every dependency into "best
   practice for X in this domain", every integration into "pattern for X". Answer them by reading the code, the
   documentation or the web, and write `research.md` with one entry per decision:
   - **Decision:** what was chosen
   - **Rationale:** why
   - **Alternatives considered:** what else, and why not

   No `NEEDS CLARIFICATION` may survive phase 0.
5. **Phase 1, design.**
   - `data-model.md`: the entities from the spec with fields, relationships, validation rules taken from the
     requirements, and state transitions. This file is the single source for field constraints (length, required,
     allowed values).
   - `contracts/`: the interfaces the feature exposes to users or other systems, in the form that fits the
     project: public API of a library, command schema of a CLI, endpoints of a web service, grammar of a parser,
     UI contract of an app. Skip for purely internal work.
   - `quickstart.md`: runnable scenarios that prove the feature works end to end, with prerequisites, setup and run
     commands and the expected result. Link to contracts and data model instead of copying them. No implementation
     code here.
6. Fill **Project Structure** with the real directories this feature touches, delete the layout options that do
   not apply, and write one line on the structure decision.
7. Run the principles check again against the finished design.

**Gate 2: the plan is ready when** no `NEEDS CLARIFICATION` remains, the principles check passes (or every
violation is justified), and every functional requirement in the spec is visibly covered by the design.

### Stage 3: Tasks (ordered steps)

1. Read `plan.md` and `spec.md` (both required) and whatever exists of `data-model.md`, `contracts/`,
   `research.md` and `quickstart.md`. Not every feature has every document; work with what is there.
2. Build `tasks.md` from the tasks template below, organised **by user story**:
   - **Phase 1, Setup:** project initialisation shared by everything.
   - **Phase 2, Foundational:** blocking prerequisites. No story work starts before this phase is done.
   - **Phase 3 and later:** one phase per user story, in priority order. Each phase states the story goal and its
     independent test. Inside a story: tests (if requested) → models → services → endpoints or UI → integration.
   - **Final phase, Polish:** cross-cutting work such as docs, clean-up, performance, security hardening, and
     running the `quickstart.md` scenarios.
3. Map the design to the stories. Each contract and each entity goes to the story that needs it; an entity used by
   several stories goes to the earliest of them or to Setup. A task that implements a constrained field cites it as
   `data-model.md` `Entity.field` instead of copying the constraint, and never contradicts it.
4. Write test tasks **only** if the spec or the person asks for tests or test-first work. Then the tests come first
   in each story and must fail before the implementation starts.
5. Write every task in the strict task format below. Mark `[P]` only when the task touches other files than every
   unfinished task it could run beside.
6. Add the dependency section (phase order, story order), one parallel example per story, and the implementation
   strategy: MVP first (Setup + Foundational + story P1, then stop and validate), then one story at a time.
7. Check Gate 3 and report: the path to `tasks.md`, total task count, tasks per story, parallel opportunities, the
   independent test of each story, and the suggested MVP scope.

**Gate 3: the task list is ready when** every task follows the format, every story has all the tasks it needs and
can be tested on its own, every functional requirement maps to at least one task, and each task can be done from
the feature's documents alone, without copying those documents into the task.

Then stop. Implementation starts when the person says so. Work phase by phase, tick each task (`- [x]`) as soon as
it is done, and stop at every checkpoint to validate the story before going on.

## Spec quality checklist

Write this into `checklists/requirements.md` and tick items only when they truly pass.

```markdown
# Specification Quality Checklist: <feature name>

**Created**: <date> · **Feature**: [spec.md](../spec.md)

## Content quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

## Requirement completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Success criteria are technology-agnostic
- [ ] All acceptance scenarios are defined
- [ ] Edge cases are identified
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

## Feature readiness
- [ ] All functional requirements have clear acceptance criteria
- [ ] User scenarios cover the primary flows
- [ ] Feature meets the measurable outcomes in Success Criteria
- [ ] No implementation details leak into the specification

## Notes
- <failing items and what was done about them>
```

## Clarification questions

**After Stage 1, step 7:** ask all open markers (at most 3) in one message, numbered Q1 to Q3, each like this:

```markdown
## Question 1: <topic>

**Context**: <quote the spec passage>
**What we need to know**: <the question from the marker>

| Option | Answer | Implications |
|--------|--------|--------------|
| A | <first answer> | <what it means for the feature> |
| B | <second answer> | <what it means for the feature> |
| C | <third answer> | <what it means for the feature> |
| Custom | Your own answer | <how to give it> |
```

The person answers in one line, for example "Q1: A, Q2: Custom - only admins, Q3: B".

**Ambiguity scan (Stage 1, step 8):** rate each area Clear, Partial or Missing:

- Functional scope: core goals, explicit out-of-scope, user roles
- Domain and data: entities, identity and uniqueness rules, lifecycle and states, data volume
- Interaction: critical journeys, error, empty and loading states, accessibility, localisation
- Quality attributes: performance, scalability, reliability, observability, security and privacy, compliance
- Integrations: external services and their failure modes, import and export formats
- Edge cases: negative scenarios, rate limits, conflicts such as concurrent edits
- Constraints and trade-offs, terminology (one term per concept), testable acceptance criteria
- Placeholders: TODOs and vague adjectives ("robust", "intuitive") with no number behind them

Then ask **at most 5 questions, one at a time**, only where the answer changes architecture, data, tasks, tests,
user experience, operations or compliance. Each question starts with `**Question:**`, is a full question ending in
`?`, is followed by one "why it matters" sentence and your recommended option with a reason, then 2 to 5 options in
a table or a short-answer format (5 words at most). Record each answer at once in the spec under
`## Clarifications` → `### Session YYYY-MM-DD` as `- Q: <question> → A: <answer>`, and apply it to the right section
(requirement, user story, entity, success criterion, edge case). Replace any statement the answer makes wrong; leave
no contradiction. Stop when the critical gaps are closed, the person says "done", or 5 questions are asked.

## Writing rules for the spec

- Write **what** users need and **why**. Leave out **how**: no tech stack, APIs or code structure. The reader is a
  business stakeholder, not a developer.
- Think like a tester: every vague requirement must fail the "testable and unambiguous" check.
- Use reasonable defaults instead of asking, and write them under Assumptions. Typical defaults: data retention
  as usual in the domain, performance as users expect from this kind of app, user-friendly error messages with a
  fallback, standard session-based or OAuth2 login for web apps, the integration style the project already uses.
- Worth a question only when no default exists: scope boundaries, user types and permissions with conflicting
  readings, security or compliance requirements with legal or financial weight.
- Success criteria are measurable, technology-agnostic, user-focused and checkable without the code.
  - Good: "Users can complete checkout in under 3 minutes", "95% of searches return results in under 1 second",
    "Task completion rate improves by 40%".
  - Bad: "API response time is under 200ms" (say "users see results instantly"), "Database handles 1000 TPS",
    "React components render efficiently", "Redis cache hit rate above 80%".

## Task format

Every task follows exactly this pattern:

```text
- [ ] <TaskID> [P] [Story] Description with exact file path
```

- **Checkbox** `- [ ]` always first.
- **TaskID** `T001`, `T002` … in execution order.
- **[P]** only if the task can run in parallel (other files, no dependency on an unfinished task).
- **[Story]** `[US1]`, `[US2]` … required in user story phases; never in Setup, Foundational or Polish.
- **Description** a clear action with the exact file path.

Right: `- [ ] T001 Create project structure per implementation plan`,
`- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`,
`- [ ] T012 [P] [US1] Create User model in src/models/user.py`.
Wrong: `- [ ] Create User model` (no ID, no story), `T001 [US1] Create model` (no checkbox),
`- [ ] [US1] Create User model` (no ID), `- [ ] T001 [US1] Create model` (no file path).

## Templates

### spec.md

```markdown
# Feature Specification: <feature name>

**Created**: <date> · **Status**: Draft · **Input**: "<the person's description>"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - <title> (Priority: P1)
<the journey in plain language>
**Why this priority**: <value, and why it comes first>
**Independent Test**: <how to test this story alone, and what value it delivers>
**Acceptance Scenarios**:
1. **Given** <state>, **When** <action>, **Then** <outcome>

### User Story 2 - <title> (Priority: P2)
…

### Edge Cases
- What happens when <boundary condition>?
- How does the system handle <error scenario>?

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST <capability>
- **FR-002**: Users MUST be able to <interaction>
- **FR-003**: System MUST authenticate users via [NEEDS CLARIFICATION: email/password, SSO or OAuth?]

### Key Entities *(if data is involved)*
- **<Entity>**: <what it represents, key attributes, relationships; no implementation>

## Success Criteria *(mandatory)*
- **SC-001**: <measurable outcome, e.g. "Users create an account in under 2 minutes">

## Assumptions
- <default chosen where the description was silent>
```

### plan.md

```markdown
# Implementation Plan: <feature name>

**Date**: <date> · **Spec**: [spec.md](./spec.md)

## Summary
<main requirement + technical approach from research>

## Technical Context
**Language/Version**: … **Primary Dependencies**: … **Storage**: … **Testing**: …
**Target Platform**: … **Project Type**: … **Performance Goals**: … **Constraints**: … **Scale/Scope**: …
(write NEEDS CLARIFICATION where unknown)

## Principles Check
*Gate: must pass before phase 0, check again after phase 1.*
- <rule> → follows / violates (see Complexity Tracking)

## Project Structure
<real directory tree for this feature; layout options that do not apply are deleted>
**Structure Decision**: <one line>

## Complexity Tracking *(only if a principle is violated)*
| Violation | Why needed | Simpler alternative rejected because |
|-----------|------------|--------------------------------------|
```

### tasks.md

```markdown
# Tasks: <feature name>

**Input**: specs/<NNN>-<short-name>/ · **Tests**: <included / not requested>

## Phase 1: Setup
- [ ] T001 Create project structure per implementation plan

## Phase 2: Foundational (blocks all stories)
- [ ] T002 <blocking prerequisite with file path>
**Checkpoint**: foundation ready, stories can start

## Phase 3: User Story 1 - <title> (P1) MVP
**Goal**: <what this story delivers> · **Independent Test**: <how to verify it alone>
- [ ] T003 [P] [US1] <task with file path>
**Checkpoint**: story 1 works and is tested on its own

## Phase N: Polish
- [ ] T0XX Run the quickstart.md scenarios

## Dependencies & Execution Order
<phase order, story order, what may run in parallel>

## Implementation Strategy
MVP = Setup + Foundational + US1 → stop and validate → add US2 → validate → …
```

## Red flags

| Thought | Reality |
|---------|---------|
| "I'll pick the framework in the spec, it saves time" | The spec is technology-free. Tech goes into the plan. |
| "I'll mark everything unclear" | At most 3 markers. Guess the rest and write the guess under Assumptions. |
| "The plan can carry a few open questions" | Phase 0 resolves every NEEDS CLARIFICATION before design starts. |
| "Tests for everything, to be safe" | Test tasks only when the spec or the person asks for them. |
| "Tasks by layer: all models, then all services" | Tasks by user story, so each story ships and tests on its own. |
| "The list is done, I'll start coding" | Gate 3, then the person says go. |

---
Adapted from Spec Kit command and document templates (specify, clarify, plan, tasks) by GitHub, Inc. (https://github.com/github/spec-kit/tree/4d7cb8e524189369f00376df6284246d3cc4434a/templates), MIT.
Changes: merged the specify, clarify, plan and tasks commands into one gated skill, replaced scripts, hooks and slash commands with plain steps, condensed the templates. See SOURCE.md.
