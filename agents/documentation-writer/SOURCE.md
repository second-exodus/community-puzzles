# Source

- Original: Diátaxis Documentation Expert (`documentation-writer`), https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/skills/documentation-writer/SKILL.md
- Repository: github/awesome-copilot, commit f10fdb8b2660ce85c98f220b2f1ca24653768a5c, read on 2026-11-24
- Author: GitHub, Inc. (copyright holder named in the repository licence) and the awesome-copilot contributors
- Licence: MIT (full text in LICENSE; the puzzle's source folder has no licence of its own, so the repository licence applies)

## Changes
- Turned the skill into an agent file (AGENT.md) with a role paragraph and the sections Goal and Steps.
- Kept the original workflow (clarify type, audience, goal and scope; propose an outline; wait for approval; write)
  and the four guiding principles, rewritten as numbered steps.
- Added a step to read the code being documented, a verification step (snippets, flags, defaults and paths checked
  against the code) and a hand-over step.
- Added a comparison table of the four document types, per-type checks, red flags and a short illustrated example,
  written in our own words (no text taken from the Diátaxis website).
- Kept the rules on context: use provided files for tone only, do not copy them, no external sources unless linked.
- Removed wording tied to one assistant; the file works with any AI assistant.
