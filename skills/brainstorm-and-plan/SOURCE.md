# Source

- Original: the skills `brainstorming` (with its builder check prompt) and `writing-plans`:
  - https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/brainstorming/SKILL.md
  - https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/brainstorming/builder-check-prompt.md
  - https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-plans/SKILL.md
- Repository: obra/superpowers, commit 22f0b463e7a5e579904dd6211a520321035526f7, read on 2026-11-24
- Author: Jesse Vincent (copyright holder named in the repository licence)
- Licence: MIT (full text in LICENSE; the skill folders have no licence of their own, so the repository licence applies)

## Changes
- Merged two skills into one with two parts (brainstorm, plan) and the original hard gate between them; the
  hand-off "invoke the writing-plans skill" became "go to Part 2".
- Rewrote the brainstorming sections (first message, conversation, play-back, approaches, sizing, written design,
  builder check) as numbered steps; kept their substance, examples and the red-flags table.
- Replaced "dispatch a fresh subagent" with "a second assistant session or a colleague", and kept the fallback of
  reading the design yourself as the builder.
- Removed the visual companion (a local browser server with scripts); kept its idea as a tool-neutral "show,
  don't tell" rule with a just-in-time mockup offer.
- Replaced the vendor-specific execution choices (subagent-driven or native, model tiers, required sub-skills) with
  two neutral options: task by task with a fresh reviewer, or in one go with one review at the end.
- Changed the save paths from `docs/superpowers/specs/` and `docs/superpowers/plans/` to `docs/specs/` and
  `docs/plans/`; "human partner" became "the person".
- Shortened the plan header and task templates slightly and added two red flags about plan quality, in our own words.
- Sections renamed to Goal, Steps and Rules; front matter for the community format added.
