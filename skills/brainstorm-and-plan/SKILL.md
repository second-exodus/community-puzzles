---
name: brainstorm-and-plan
description: Finds out what the person actually wants before anything is built. Brainstorms the design with them one question at a time, lays out the approaches, gets a written design approved, then writes an implementation plan of small test-first tasks that an engineer new to the code can follow. Triggered by "brainstorm this", "let's design this", "help me think this through", "write an implementation plan", "plan this before we build".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: tasks
---

# Brainstorm and Plan

## Goal

You are very good at building. You build what you believe the person wants, and that belief is usually thinner than
it feels. People often have not finished working out what they want; good questions help them think it through.
When you understand the why, you make the hundred decisions they never mention the way they would have made them.

This skill has two parts with one hard gate between them:

1. **Brainstorm** with the person until there is a design doc they approve.
2. **Plan**: turn the approved design into an implementation plan an engineer can follow without going back to them.

Nothing gets built until the person approves the design doc. Reading and exploring are always fine.

## Steps

### Part 1: Brainstorm the design

1. **Ask yourself what you actually know** about what they want, and why.
   - Everything that matters is in the request ("make the icon cornflower blue"): this is a quick, clear task. Do
     it, say what you did, and stop using this skill.
   - Something non-trivial is missing: start the conversation.
2. **Look before you ask.** In an existing project, or when they gave you context (a spec, a plan, a handoff, files
   they pointed at, earlier conversation), read what they referred to and the code or material it connects to.
   Keep reading until you can explain how the relevant parts work today and what this change would touch. Never ask
   what the project or their context already answers, and never reopen what they already decided.
3. **Write the first message.** Move the work forward with one of these:
   - **They already said what they want** (a spec, a plan, a detailed request): about 200 words in total. Echo the
     request in your own words (what, for whom, why, as far as they said), add what you found that bears on it,
     and say plainly if you found something that changes the request or how it must be built (a constraint, a
     conflict, a cheaper path). End with one line inviting corrections. If they have not said why they want it,
     ask about that: one open question, nothing to pick from. If they did, and something still open would change
     what gets built, ask about the biggest one. If nothing is open and there is one sensible way, end with the
     short design (approach, one line on why the others do not fit, the design in a few lines) and ask them to
     approve it.
   - **They have not:** ask one open question, in their words, about the biggest unsettled thing, and say what the
     answer would change. For "a website for my bakery": "If it's mostly for people deciding whether to stop by,
     I'd lead with hours and what's in the case today; taking orders is a different site. What do you want someone
     to do when they land on it?"
   - **Ending:** if they asked for brainstorming or a design discussion, end there. If they did not, add one light
     line: "Or if you'd rather I just dive in, say so." If they take that offer, state any big how-it-gets-made
     choice (platform, language, medium) in one plain line and do the work the normal way. The gate ends with it.
4. **Hold the conversation.** Ask a question only when the answer would change what gets built and neither the
   request nor the project answers it. Otherwise state your call and your reason as a proposal they can correct.
   Process steps are always your call (writing things up, where files go, looking further): do them and say so.
   - Ask **one question at a time**, in plain language just a little above their level. Match their vocabulary;
     never use process jargon or quote this skill.
   - **Get them describing.** Until you know why they want it, ask open questions with no example answers; their
     own words carry intent your options cannot. Once you know why, sketch the named choices concretely, with what
     each trades off and which you would pick. When they say "just guess" or "what do you think?", propose
     something concrete.
   - **How it gets made.** Someone who raises the how or asks about trade-offs wants the options with your pick.
     Someone who talks about outcomes is handing you the how: make those calls and state each in one line. Build on
     what existing work already uses. A choice you made goes into the design as your call, never as something they
     agreed to.
   - **Ground to cover** (territory, not a script; never read it out as questions): what kind of thing this is and
     what makes it special; why now and what success looks like; goals, non-goals and anti-goals (what would make
     it a failure even if it technically works); prior art they loved or hated; what exists now and what they
     tried; the details they care about.
   - **Make every question specific** and build it on their last answer or on something you found, so it helps them
     think through a consequence they may have missed ("Voting closes before the meeting, and two members joined
     this month. Does someone who joins mid-round get a vote?"). A proposal they can correct, plus your reason,
     often beats a question.
   - **Do recon.** Once you have some grounding and looking further would help, go look (their code, files, data,
     the web) and say what you looked for and what you found.
5. **Play it back as you go.** As soon as you understand one part (who it serves, how one piece behaves), describe
   it back in about 200 to 300 words, then go on to the next part. Only what they said goes in as theirs; anything
   you filled in is your proposal, with your reason. End each chunk by asking what is wrong or missing. If the part
   is something they will look at (a page, a screen, a schedule, a printout), put a short text sketch next to it.
6. **Lay out the approaches** in a message of its own, before you write anything up. Come up with several real
   ways to build it, drop the weak ones (and any that work against why they want it or that the existing work rules
   out), and sketch the two or three that remain concretely enough to picture, with their trade-offs. Recommend one
   and say why, then ask which way to go. If they handed you the how, say you will go with your pick. If there is
   truly one sensible way, say so and why the others do not fit.
7. **Size the work** in plain words; they can override it. A **small change** gets a short design doc: what you
   already covered, written down. A **project** gets the full written design. If it grows mid-task, stop, say so and
   step up a size. If it is really several independent projects, say so, agree on an order and brainstorm them one
   at a time.
8. **Write the design doc**, a plain document a talented builder in the domain could plan from without going back
   to the person. Cover: intent and the why; goals, non-goals, anti-goals; constraints; **Approaches** (the two or
   three you considered, their trade-offs, which one they picked and why); the parts of the how they decided, as
   they decided them; what is left to the builder. For a small change, each point gets a line or two. In a code
   repository save it as `docs/specs/YYYY-MM-DD-<topic>-design.md` and commit it; otherwise pick a sensible place and
   say where. The person's preferences override both.
9. **Run the builder check** (projects only). When you say you are writing it up, tell them a reviewer will read it
   first and you may come back once with a few questions. Give the doc to a second assistant session or a colleague
   with the builder check prompt below; if neither is available, read it yourself as that builder would. Sort what
   comes back into three piles:
   - **Answered already** by the conversation or the project: put the answer into the doc.
   - **Minor**, a sensible builder could settle it without changing what gets built: settle it and mark it in the
     doc as your call.
   - **Theirs**, only the person can answer it and the answer changes what gets built: ask these in one message,
     most important first.
   Update the doc, then hand it over with a short list of the calls you made so they can check those while reading.
   That is the only round of questions the check produces.
10. **Get the approval.** The approval covers what they actually read. Once the design doc is approved, go to Part 2
    and nothing else.

### Part 2: Write the implementation plan

Write for an engineer who has not seen this code or this spec. Assume they write idiomatic code in the project's
language once they know the exact interface and the exact test, and that they make a reasonable choice wherever the
plan leaves one open. What they cannot know is what you decided: which files, which names and signatures, which
values from the spec, which tests prove each task. Document those, as bite-sized tasks. DRY. YAGNI. Test first.
Frequent commits.

1. Say that you are writing the implementation plan. Save it as `docs/plans/YYYY-MM-DD-<feature-name>.md` unless the
   person keeps plans elsewhere.
2. **Scope check.** If the design covers several independent subsystems, suggest one plan per subsystem. Each plan
   must produce working, testable software on its own.
3. **Map the files** before defining tasks: which files will be created or changed and what each is responsible
   for. Give each unit one clear responsibility and a well-defined interface. Prefer smaller, focused files; files
   that change together live together; split by responsibility, not by technical layer. In an existing codebase
   follow its patterns, and only split a file you are changing if it has grown unwieldy.
4. **Size the tasks.** A task is the smallest unit that carries its own test cycle and is worth a reviewer's gate.
   Fold setup, configuration, scaffolding and documentation into the task whose deliverable needs them; split only
   where a reviewer could reject one task while approving its neighbour. Each task ends with something testable on
   its own.
5. **Write the plan header** (template below), including the global constraints copied verbatim from the design and
   the **Review focus**: the five inputs or failure modes the design implies but no test covers yet that are most
   likely to bite a real user, one line each, most likely first. The design's silence on an input is not permission
   for that input to break the program. Add the test for each line to the task that owns that code.
6. **Write each task** with the task template below. Each step is one action with a checkable result: write the
   failing test; run it and watch it fail; write the minimal code to pass; run the tests and watch them pass;
   commit.
7. **Put exactly what makes each step unambiguous into it, and nothing more:**
   - a test step: the test name and its assertions as code, with the spec's exact values;
   - a code step: the exact signature (name, parameters, return type), the file, and the values the spec pins. The
     implementer writes the body. Show a body only for an algorithm the signature and tests do not determine, or
     for exact text the spec fixes;
   - a verification step: the command to run and the output that means it passed;
   - a reference to another task: point to that task's Interfaces block instead of repeating its code.

   A plan longer than the code it describes has written the code instead. A line that decides nothing ("TBD",
   "handle edge cases", "add appropriate validation", "write tests for the above", a type no task defines) is the
   opposite failure.
8. **Review the plan yourself** against the design, with fresh eyes, and fix what you find inline:
   - **Coverage:** can you point to a task for every requirement in the design? Add a task for each gap.
   - **Step scan:** every step lets the implementer write exactly one reasonable thing; no step decides nothing and
     no step contains a body the signature and tests already determine.
   - **Type consistency:** names and signatures in later tasks match earlier ones (`clearLayers()` in task 3 but
     `clearFullLayers()` in task 7 is a bug).
   - **Review focus:** each line has its test in the owning task. An empty section means you checked and found
     none, not that you skipped the check.
   - **Proportion:** if code blocks are most of the document, replace bodies with signatures, test names and
     assertions.
9. **Hand it over.** Link the plan and ask the person to review it. If they have not chosen how it should be run,
   offer two ways and recommend one in one sentence (based on how much the tasks depend on each other, how many
   there are, and what a shipped mistake would cost):
   - **Task by task with review:** each task is done in a fresh session, and a fresh reviewer (a second assistant
     session or a person) checks it before the next one starts; one review of the whole branch at the end. Most
     thorough, costs a fresh context per task.
   - **In one go:** one session works through all tasks in order, then one fresh reviewer checks the whole branch.
     Cheapest and fastest, no independent review until the end.

   Wait for their review before any implementation starts.

## Rules

- **Hard gate.** Nothing gets built until the person approves the design doc (the short one for a small change,
  the full one for a project). Building includes writing product code, scaffolding, installing dependencies,
  creating projects and starting implementation. Two exceptions: if they opted out of the questions, the gate goes
  with the brainstorm; a spike they said yes to may be built.
- **Spikes.** Building is like waterfall, only very, very fast, so a quick throwaway build is often the cheapest way
  to learn what they want or whether something works. Offer one when it would help, and get out of the way when
  they just want to spike. Spikes get minimal tests, are labelled throwaway and skip the plan. Bring what the spike
  taught you back into the conversation. Keeping what it produced is a new request that comes back through the gate.
- **Show, don't tell.** When seeing would help more than reading (a screen, a layout, a flow, options that would
  look different, a diagram or timeline), sketch it in a few lines of text. If your environment can show a quick
  mockup page, offer it just in time, in a message of its own: "This might be easier if I show you. Want me to
  put together a quick mockup?" If they decline, stay in text and do not offer again. Requirements, scope and
  trade-offs stay in text.
- **Be clear and concise.** Lead with what matters, give the most important findings first and offer the rest.

## Red flags

| Thought | Reality |
|---------|---------|
| "I'll offer a menu of what they might want" | Options steer. Ask them to describe it first. |
| "I'll fill in sensible defaults" | Good. Say them out loud. A default they never heard is one they could not reject. |
| "I've answered their questions, so I'll write the doc" | Lay out the approaches first, in a message of their own. |
| "I should explain the process first" | Ask your question. The process shows itself. |
| "They said 'sounds good' to the idea" | Approval covers what you showed them. A doc you have not written is not approved. |
| "The spike works, I'll keep building on it" | Keeping it is a new request. Back through the gate. |
| "I'll put the full code in the plan to be safe" | That is a transcript, not a plan. Signatures, tests, values. |
| "Handle edge cases" | Name the input and the expected behaviour, and the test that pins it. |

## Builder check prompt

Give this to a second assistant session or a colleague once the written design exists. Fill in the domain and the
path.

```text
You are a talented <domain, e.g. "software engineer", "event planner">. You've been handed a design document and
asked to put together a plan to build what it describes. You will not be able to talk to the person who wrote it.

Read <path to the design doc>.

Report only the questions you'd still need answered before you could plan this well: places where you'd have to
guess and a wrong guess would matter. For each, give the question and why the answer changes the plan. Rank them
by importance.

Skip anything the document explicitly leaves to the builder, and anything you could reasonably decide yourself.
Skip nitpicks about wording.

If nothing important is left, say "nothing important left".
```

## Plan header template

```markdown
# <Feature name> Implementation Plan

> For the implementer: work through this plan task by task. Steps use checkboxes (`- [ ]`) for tracking.

**Goal:** <one sentence on what this builds>
**Architecture:** <2-3 sentences on the approach>
**Tech stack:** <key technologies and libraries>
**Design:** <path to the approved design doc; the implementer reads both>

## Global constraints
<project-wide requirements from the design (version floors, dependency limits, naming and copy rules, platform
requirements), one line each, exact values copied verbatim. Every task implicitly includes this section.>

## Review focus
<five inputs or failure modes most likely to bite a user that no test covers yet, one line each, with the expected
behaviour, most likely first; each one gets its test in the owning task>

---
```

## Task template

````markdown
### Task N: <component name>

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test_file.py`

**Interfaces:**
- Consumes: <what this task uses from earlier tasks, exact signatures>
- Produces: <what later tasks rely on, exact names, parameter and return types>

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run the test and confirm it fails**
  Run: `pytest tests/path/test_file.py::test_specific_behavior -v`, expected: FAIL with "function not defined"

- [ ] **Step 3: Implement `function(input: InputType) -> ResultType` in `exact/path/to/file.py`**
  One line on the approach when the signature and test leave a choice.

- [ ] **Step 4: Run the test and confirm it passes**
  Run: `pytest tests/path/test_file.py::test_specific_behavior -v`, expected: PASS

- [ ] **Step 5: Commit**
  `git add tests/path/test_file.py exact/path/to/file.py && git commit -m "feat: add specific feature"`
````

---
Adapted from the skills brainstorming and writing-plans by Jesse Vincent (https://github.com/obra/superpowers/tree/22f0b463e7a5e579904dd6211a520321035526f7/skills), MIT.
Changes: merged two skills into one with a hard gate, replaced subagents, the browser companion and skill calls with tool-neutral steps, generic paths. See SOURCE.md.
