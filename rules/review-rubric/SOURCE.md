# Source

- Original: Review guidelines (review rubric) of Codex CLI, https://github.com/openai/codex/blob/ae21235afbd5ba6556c2ab4b64f6afc96a139ef8/codex-rs/prompts/templates/review/rubric.md
- Also used: the review target prompts in https://github.com/openai/codex/blob/ae21235afbd5ba6556c2ab4b64f6afc96a139ef8/codex-rs/prompts/src/review_request.rs (which diff to review)
- Repository: openai/codex, commit ae21235afbd5ba6556c2ab4b64f6afc96a139ef8, read on 2026-11-24
- Author: OpenAI (copyright notice in NOTICE: "Copyright 2025 OpenAI")
- Licence: Apache-2.0 (full text in LICENSE, notice in NOTICE)

## Changes

This file is the statement of changes required by section 4(b) of the Apache License 2.0.

- Turned the system prompt into a rule set with the sections Must, Should and Examples, one rule per bullet.
- Kept all eight criteria for flagging a bug, the comment rules, the "how many findings" rule, the P0 to P3 priority
  scale, the per-finding and overall confidence scores, the repository-rule attribution rules and the overall
  correctness verdict.
- Removed wording that only fits one tool: the precedence list of that tool's own instruction file names, "system
  message" / "developer message", and the instruction to sound like an AI assistant. Code-host "suggestion blocks" are
  now described in general terms.
- Renamed the JSON field `absolute_file_path` to `file_path` (relative to the project root), and dropped the
  requirement for absolute paths.
- Added a "Should" section on which diff to review (taken from the review target prompts in `review_request.rs`) and
  a rule to read callers and tests before reporting.
- Added a confidence definition (the original only names the field), a worked example finding, an example JSON
  output and examples of what is not a finding.
- This adaptation is not affiliated with or endorsed by OpenAI.
