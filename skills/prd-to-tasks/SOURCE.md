# Source

- Original: AI Dev Tasks, the prompts `create-prd.md` and `generate-tasks.md` and the workflow in `README.md`:
  - https://github.com/snarktank/ai-dev-tasks/blob/efbffaac10e68c94e14aaa587c79b7d5015b5ebd/create-prd.md
  - https://github.com/snarktank/ai-dev-tasks/blob/efbffaac10e68c94e14aaa587c79b7d5015b5ebd/generate-tasks.md
  - https://github.com/snarktank/ai-dev-tasks/blob/efbffaac10e68c94e14aaa587c79b7d5015b5ebd/README.md
- Repository: snarktank/ai-dev-tasks, commit efbffaac10e68c94e14aaa587c79b7d5015b5ebd, read on 2026-11-24
- Author: Ryan Carson (GitHub account snarktank, owner of the repository; the licence file names no copyright holder)
- Licence: Apache-2.0 (full text in LICENSE; the repository has no NOTICE file)

## Changes
This is the statement of changes required by section 4(b) of the Apache License 2.0. The files were modified as
follows:
- Merged the two prompts and the step-by-step workflow from the README into one skill with three parts: write the
  PRD, generate the task list, work through the tasks.
- Rewrote the process sections as numbered steps under Goal and Steps; kept the PRD structure (nine sections), the
  clarifying-question rules (3 to 5 questions, numbered with lettered options), the two-phase task generation with
  the "Go" pause, task 0.0 "Create feature branch", the output format and the check-off instructions.
- Replaced `@file` tagging with "read the files the person points to"; replaced the fixed test command
  (`npx jest`) with "the project's test command, read from the project"; paths `/tasks/` became `tasks/` from
  the project root.
- Added, in our own words: a look at the project before asking questions, a "Something else" option, rules for
  working one sub-task at a time (tests before ticking a parent task, add missed work as new sub-tasks), a
  hand-over checklist, and a short illustrated example (`example/output.md`).
- Shortened the README tips into three lines for the person; removed images, links to videos and podcasts, and
  tool names.
- Front matter for the community format added.
