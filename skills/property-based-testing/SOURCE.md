# Source

- Original: Property-Based Testing, https://github.com/trailofbits/skills/blob/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/property-based-testing/skills/property-based-testing/SKILL.md
  with its references https://github.com/trailofbits/skills/blob/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/property-based-testing/skills/property-based-testing/references/generating.md, https://github.com/trailofbits/skills/blob/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/property-based-testing/skills/property-based-testing/references/refactoring.md,
  https://github.com/trailofbits/skills/blob/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/property-based-testing/skills/property-based-testing/references/reviewing.md, https://github.com/trailofbits/skills/blob/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/property-based-testing/skills/property-based-testing/references/interpreting-failures.md and https://github.com/trailofbits/skills/blob/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/property-based-testing/skills/property-based-testing/references/libraries.md
- Repository: trailofbits/skills, commit 149d7b21f4067765b82e67029730b42d228ef4b4, read on 2026-11-24
- Author: Trail of Bits (plugin author named in the plugin manifest: Henrik Brodin)
- Licence: CC-BY-SA-4.0 (full text in LICENSE)
- Licence: https://creativecommons.org/licenses/by-sa/4.0/

This adaptation is itself licensed under the Creative Commons Attribution-ShareAlike 4.0 International
licence (CC BY-SA 4.0). If you share it or a further adaptation of it, keep this attribution, state your
changes and use the same licence. It is provided as is, without warranties (see section 5 of the licence).

## Changes
- Added the sections Goal and Steps (write / review / triage workflow) in front of the original guidance.
- Folded the five reference files (generating, refactoring, reviewing, interpreting failures, libraries) into
  SKILL.md as sections, so the puzzle is a single file; the original's "where to look next" routing table was
  replaced by these sections.
- Shortened code examples in the refactoring section (patterns 2 to 5 described in prose with the key
  signatures) and merged the vacuous and reimplementation examples into the review table.
- Removed tool-specific front matter fields and wording; replaced the sentence naming the maintainer of
  Echidna and Medusa and the tutorial link with a neutral description of both tools.
- Moved "introducing a library to a project that lacks it" into step 2.
- Added front matter for this collection (status draft, runs-with, for, category).
