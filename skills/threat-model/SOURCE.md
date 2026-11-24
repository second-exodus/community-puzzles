# Source

- Original: security-threat-model, https://github.com/openai/skills/tree/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/security-threat-model
  - https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/security-threat-model/SKILL.md
  - https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/security-threat-model/references/prompt-template.md
  - https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/security-threat-model/references/security-controls-and-assets.md
- Repository: openai/skills, commit 49f948faa9258a0c61caceaf225e179651397431, read on 2026-11-24
- Author: OpenAI (repository owner; the skill was added in commit 5c8f1e26 on 2026-02-02). The licence file names no
  individual copyright holder.
- Licence: Apache-2.0 (full text in LICENSE, copied from the skill folder's `LICENSE.txt`). Neither the skill folder nor
  the repository contains a NOTICE file, so there is none here.

Note: the source repository's README marks it as deprecated in favour of a newer repository. The skill itself and its
Apache-2.0 licence are unchanged at the pinned commit.

## Changes

This is a modified version of the original work. Changes made:

- Merged `SKILL.md`, `references/prompt-template.md` and `references/security-controls-and-assets.md` into one SKILL.md.
- Rewrote the structure into the sections Goal, Rules, Steps, Output, Priority guidance, Asset and control categories
  and Example; folded the "system prompt", "repository summary prompt" and "user prompt template" of the prompt
  template into the Rules and Steps instead of keeping them as separate prompts.
- Kept the required output format (section order, tables, threat-ID scheme, Mermaid rules) and the
  assumption check-in that pauses for the person's answer.
- Removed tool-specific content: the `agents/openai.yaml` interface file, the advice to use a specific search tool with
  a specific flag (now "search text files only"), and references to loading reference files.
- Replaced "user" with "person" in places, changed US to UK spelling in places, and made small wording edits.
- Added a numbered quality-check step that also writes the file, a short example (abuse path plus table row) and an
  illustrative example report in `example/output.md`.
- Added `status: draft` and the portable front matter.
