# Source

- Original: Differential Security Review (plugin "differential-review", skill "differential-review"). Files used:
  - https://github.com/trailofbits/skills/blob/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/differential-review/skills/differential-review/SKILL.md
  - https://github.com/trailofbits/skills/blob/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/differential-review/skills/differential-review/methodology.md
  - https://github.com/trailofbits/skills/blob/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/differential-review/skills/differential-review/adversarial.md
  - https://github.com/trailofbits/skills/blob/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/differential-review/skills/differential-review/patterns.md
  - https://github.com/trailofbits/skills/blob/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/differential-review/skills/differential-review/reporting.md
  - https://github.com/trailofbits/skills/blob/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/differential-review/agents/adversarial-modeler.md (phase 5 agent, folded into the skill)
- Repository: trailofbits/skills, commit 149d7b21f4067765b82e67029730b42d228ef4b4, read on 2026-11-24
- Author: Omar Inuwa, Trail of Bits (author named in the plugin README and plugin.json; the repository README says
  "Made by Trail of Bits")
- Licence: CC-BY-SA-4.0 (full text in LICENSE)
- Licence: https://creativecommons.org/licenses/by-sa/4.0/

This adaptation is a derivative work and is licensed under the same licence, CC BY-SA 4.0. It is not affiliated with,
sponsored or endorsed by Trail of Bits or the author.

## Changes

- Merged the five skill files (SKILL, methodology, adversarial, patterns, reporting) and the adversarial-modeler
  agent into one SKILL.md with Goal and Steps (phases 0 to 6 as numbered steps). Shortened by removing repetition
  between the files.
- Removed the integration with other skills of the source repository (`audit-context-building`, `issue-writer`) and
  the list of domain-specific pattern databases. Pre-analysis and phase 4 now describe the manual analysis, which the
  original gives as the fallback.
- Removed tool-specific parts: the plugin/slash-command entry point, the `allowed-tools` list, the instruction to
  dispatch a named agent type, and named file-reading tools. Phase 5 can now be handed to "a second assistant session
  or a security reviewer".
- The baseline is read with `git show <base>:file` or a separate `git worktree` instead of `git checkout`, so the
  working copy is not disturbed. For pull requests, the merge base replaces the `gh pr view` command.
- Report location: the project's working directory or where the user asks. The fallbacks to the desktop and to the
  tool's own skills folder were removed. Emoji severity and status markers became words. The notification template
  became one sentence.
- Removed the time estimates (30 minutes to 8 hours) from the usage examples; they became short "typical scopes".
- Vulnerability patterns condensed into one table. Detection commands extended slightly beyond Solidity (`raise`,
  `throw`, HTTP calls, auth decorators or middleware). The Solidity examples are kept.
- The worked example (removed zero-amount check in `withdraw()`) is shortened, and its illustrative dollar estimate is
  dropped.
