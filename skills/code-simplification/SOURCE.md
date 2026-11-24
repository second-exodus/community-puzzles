# Source

- Original: Code Simplification (`code-simplification`), https://github.com/addyosmani/agent-skills/blob/e997ac5b9a74eab332d5e9793bb38a38c8cfdd74/skills/code-simplification/SKILL.md
- Repository: addyosmani/agent-skills, commit e997ac5b9a74eab332d5e9793bb38a38c8cfdd74, read on 2026-11-24
- Author: Addy Osmani (copyright holder named in the repository licence)
- Licence: MIT (full text in LICENSE; the source folder has no licence of its own, so the repository licence applies)

## Changes
- Turned the overview into Goal and the four-step process into seven numbered Steps (scope, read conventions,
  understand, identify, apply one at a time, verify, report); the detailed sections follow unchanged in substance.
- Removed the introductory note that names another vendor's plugin as inspiration.
- Replaced the vendor-specific instruction file name with "the project's convention files" and "review agent" with
  "reviewer"; "check git blame" became "the version history (for example git blame)".
- Added two behaviour caveats the original examples lacked: removing `async`/`await` changes a synchronous throw
  into a different error path, and the reduce-to-Map example changes the result's shape.
- Marked the prop-drilling case explicitly as "flag, don't change" and asked for it in the report.
- Light wording edits (British spelling of behaviour, contractions spelled out); no sections dropped.
