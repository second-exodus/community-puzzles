# Source

- Original: Test Gap Audit (test-gap-audit), https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/skills/test-gap-audit/SKILL.md
  with the helper https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/skills/test-gap-audit/scripts/coverage_map.py
- Repository: github/awesome-copilot, commit f10fdb8b2660ce85c98f220b2f1ca24653768a5c, read on 2026-11-24
- Author: specialone0007 (contributor of the skill to the repository); copyright holder in the repository
  licence: GitHub, Inc.
- Licence: MIT (full text in LICENSE; the skill folder has no licence file of its own, its front matter says
  `license: MIT`)

Chosen over the other testing items of the repository (pytest-coverage, the QA agent, breakdown-test) because
it is the only one built for finding untested behaviour and missing tests across any stack, with a severity
rubric, strict evidence rules and a read-only helper.

## Changes
- Restructured into the sections Goal, Steps, Rules, Severity rubric, Evidence standards, Output and After the
  audit; the discovery workflow became the numbered steps, the "Inputs" section moved into Goal.
- Shortened the front matter description and added trigger phrases; added this collection's front matter
  (status draft, runs-with, for, category).
- Removed the "Related Skills" section (it pointed to a sibling skill and an external repository).
- Generalised the "Agent Portability Notes" into one rule (continue without test execution and say so) and one
  sentence in Output (inline review comments only where the environment supports them); removed the mention of
  host-specific tool kinds.
- Described the helper's path as relative to the skill folder and added its `--repo` / `--no-git-root` use
  for one package of a monorepo.
- Added `example/output.md`, an illustrative report written for this collection (not from the original).
- `scripts/coverage_map.py` is included unchanged.
