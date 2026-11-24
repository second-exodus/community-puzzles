# Source

- Original: Changelog Automation, https://github.com/wshobson/agents/blob/c96b5f6552dba32e4492307493ee613581430715/plugins/documentation-generation/skills/changelog-automation/SKILL.md and its reference file https://github.com/wshobson/agents/blob/c96b5f6552dba32e4492307493ee613581430715/plugins/documentation-generation/skills/changelog-automation/references/details.md
- Repository: wshobson/agents, commit c96b5f6552dba32e4492307493ee613581430715, read on 2026-11-24
- Author: Seth Hobson
- Licence: MIT (full text in LICENSE; the skill folder has no licence of its own, so the repository licence applies)

## Changes
- Front matter rewritten (triggers, status, runs-with, for, category); sections renamed to Goal and Steps, with a nine-step procedure (inspect, one-off notes, choose a tool, agree, enforce, configure, CI, dry run, human notes).
- Rejoined the content: at this commit the original SKILL.md and references/details.md split the text in the middle of a code block, so the Keep a Changelog example and the internal release-notes template were broken. Both are whole again.
- Added a "Choosing a tool" table by goal and language, and a one-off path for writing notes for a single release by hand.
- Replaced the deprecated `standard-version` with its maintained fork `commit-and-tag-version` (same `.versionrc`); removed the placeholder `prebump`/`postbump` echo scripts.
- Fixed the CI workflow: the two jobs no longer both run on manual dispatch, the release step no longer references an undefined step output (`steps.version.outputs.tag`) or a missing `RELEASE_NOTES.md`; it now uses `gh release create --generate-notes`. Updated action majors and Node version (`lts/*`).
- Updated the git-cliff config to the 2.x format (`[remote.github]`, `commit.remote.pr_number`), mapped commit types to Keep a Changelog sections, and replaced the non-existent `--dry-run` flag with `--unreleased` preview and `--bumped-version`.
- Removed the `[tool.commitizen.customize]` block, which has no effect with `cz_conventional_commits`; added `cz bump --dry-run`.
- Added install commands for the semantic-release plugins, a note on branch protection, a commitlint CI range check and the PR-title check for squash merges.
- Clarified the type table (refactor and revert entries), how to route Deprecated and Security, and the "don't hand-edit" rule.
- Release-notes templates rewritten as plain Markdown skeletons; emoji removed; reviewer trailer without an @-mention.
