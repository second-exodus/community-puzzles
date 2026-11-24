# Source

- Original: GitHub Release Skill, https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/skills/github-release/SKILL.md
- Also used: https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/skills/github-release/references/semver-rules.md and https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/skills/github-release/references/commit-classification.md
- Repository: github/awesome-copilot, commit f10fdb8b2660ce85c98f220b2f1ca24653768a5c, read on 2026-11-24
- Author: GitHub, Inc. (and the contributors of github/awesome-copilot)
- Licence: MIT (full text in LICENSE; the skill folder has no licence of its own, so the repository licence applies)

## Changes
- Front matter rewritten (triggers, status, runs-with, for, category); sections renamed to Goal and Steps, with a numbered step overview before the detailed steps.
- Merged the two reference files (SemVer rules, commit classification) into the skill as condensed sections, so the puzzle is one file.
- The default branch is detected with `gh repo view` instead of assuming `main`.
- Added: bump the version in a version file (`package.json`, `pyproject.toml`, …) in the release commit; move entries from an `## [Unreleased]` section; Deprecated mapping.
- Added one confirmation before the first push; the release branch is pushed once, after the commit.
- The PR body is always passed with `--body-file` in both shells (the original used inline `--body` for bash).
- Tags are annotated (`git tag -a`); the hand-over names `gh release create --verify-tag` as an option.
- Reconciled "when in doubt prefer MAJOR" (code evidence) with "never guess breaking from a commit message".
- Removed duplicated PowerShell blocks except where the syntax differs; fixed garbled arrow characters and the "IA" typo; removed emoji.
- Added an illustrative example (`example/output.md`) and a Limitations note for monorepos and registries.
