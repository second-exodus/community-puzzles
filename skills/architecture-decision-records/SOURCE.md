# Source

- Original: Architecture Decision Records (`architecture-decision-records`), https://github.com/wshobson/agents/blob/c96b5f6552dba32e4492307493ee613581430715/plugins/documentation-generation/skills/architecture-decision-records/SKILL.md,
  with https://github.com/wshobson/agents/blob/c96b5f6552dba32e4492307493ee613581430715/plugins/documentation-generation/skills/architecture-decision-records/references/decision-templates.md and https://github.com/wshobson/agents/blob/c96b5f6552dba32e4492307493ee613581430715/plugins/documentation-generation/skills/architecture-decision-records/references/deprecation-rfc-templates.md
- Repository: wshobson/agents, commit c96b5f6552dba32e4492307493ee613581430715, read on 2026-11-24
- Author: Seth Hobson (copyright holder named in the repository licence)
- Licence: MIT (full text in LICENSE; the source folder has no licence of its own, so the repository licence applies)

## Changes
- Merged the skill and its two reference files (decision templates; deprecation and RFC templates) into one
  self-contained SKILL.md of under 500 lines.
- Added the sections Goal, Steps (check need, find the ADR folder, gather context, pick format, draft as Proposed,
  review, link and index, hand over), Rules and Red flags; turned the original do's and don'ts into Rules.
- Added that the assistant drafts with status Proposed and never accepts a decision on behalf of the people who own it.
- Made the adr-tools commands optional and removed the operating-system-specific install command.
- Fixed the broken code fences in the RFC template; replaced the "@name" deciders with plain names; changed
  "Submit PR" to "open a pull or merge request" and the benchmark path to a project-relative path.
- Drew "Rejected" as a branch from "Proposed" in the lifecycle diagram (the original arrow sat under "Accepted").
- Kept the example templates and their reference links otherwise as in the original, with small wording edits
  (for example "IDE support" became "editor support").
