# Source

- Original: Test-Driven Development (TDD), https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/test-driven-development/SKILL.md
  and its companion reference Writing Good Tests, https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/test-driven-development/writing-good-tests.md
- Repository: obra/superpowers, commit 22f0b463e7a5e579904dd6211a520321035526f7, read on 2026-11-24
- Author: Jesse Vincent
- Licence: MIT (full text in LICENSE)

## Changes
- Restructured into the sections Goal and Steps; the red-green-refactor phases became numbered steps.
- Folded the essentials of `writing-good-tests.md` (name the break, exercise the real thing, gate functions,
  mutation check, warning signs) into SKILL.md, so the puzzle is a single file.
- Replaced the Graphviz cycle diagram with a plain-text diagram.
- Removed references to other skills of the source collection and to a vendor-specific skill-loading mechanism;
  "your human partner" became "the person you work for".
- Test commands are given as examples for several ecosystems instead of only `npm test`.
- Shortened the over-engineered GREEN example and the red-flags list to their essentials; merged the
  "Debugging integration" section into the bug-fix example.
- Renamed one module in a mock example (`MCPServerManager` to `ServerManager`) to keep it neutral.
- Added front matter for this collection (status draft, runs-with, for, category).
