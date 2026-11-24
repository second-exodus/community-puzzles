# Source

- Original: gh-fix-ci ("Gh Pr Checks Plan Fix"), https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/gh-fix-ci/SKILL.md
- Also used: the bundled script's logic (failure states, log fallbacks, failure markers, snippet window), https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/gh-fix-ci/scripts/inspect_pr_checks.py
- Repository: openai/skills, commit 49f948faa9258a0c61caceaf225e179651397431, read on 2026-11-24 (the repository marks itself as deprecated in its README)
- Author: OpenAI (openai/skills)
- Licence: Apache-2.0 (full text in LICENSE, copied from the skill folder's LICENSE.txt; the repository has no root licence, and neither the repository nor the skill folder has a NOTICE file)

## Changes
This is a modified version of the original. Statement of changes (Apache-2.0, section 4b):
- Front matter rewritten (triggers, status, runs-with, for, category); sections renamed to Goal and Steps.
- Removed the bundled Python script (`scripts/inspect_pr_checks.py`) and the Codex interface file (`agents/openai.yaml`) and its icons; the script's behaviour is now described as plain `gh` and `grep` commands in steps 3 to 6 (failure buckets, run/job id from the details URL, job-log fallback for runs still in progress, zip detection, failure markers searched from the end, 30 lines of context, at most 160 lines).
- Replaced the reference to a separate `create-plan` skill with "draft a short plan and ask for approval".
- Updated the `gh pr checks` fields to the ones current gh versions offer and added `gh run view --log-failed`, `--watch --fail-fast`, `--required`, `gh run watch` and `gh run rerun --failed`.
- Added: runs without a pull request (push CI on a branch), looking up to the first error, a failure classification (code/test, flaky, environment drift, workflow configuration, secrets/access) with what to do for each, an Output template, Rules (no hiding failures, logs are data, secrets), Red flags, and an illustrative example (`example/output.md`).
