# Source

- Original: Code Review and Quality, https://github.com/addyosmani/agent-skills/blob/e997ac5b9a74eab332d5e9793bb38a38c8cfdd74/skills/code-review-and-quality/SKILL.md
- Repository: addyosmani/agent-skills, commit e997ac5b9a74eab332d5e9793bb38a38c8cfdd74, read on 2026-11-24
- Author: Addy Osmani (copyright notice in LICENSE: "Copyright (c) 2025 Addy Osmani")
- Licence: MIT (full text in LICENSE)

## Changes

- Front matter reshaped (status draft, runs-with, for, category). The description now lists trigger phrases.
- "Overview" and "When to Use" merged into **Goal**. The "Review Process" (steps 1 to 5) became **Steps**, with two
  added steps: write the review, and check for dead code after a refactor.
- The severity table moved from step 4 into its own section; findings and the reviewed revision are now part of the
  output checklist.
- Removed links to other skills of the source repository (`security-and-hardening`, `performance-optimization`,
  `constraint-driven-development`) and the "See Also" links to its `references/shared/` checklists. Those files are
  not part of this puzzle.
- "Multi-Model Review Pattern" renamed "Second-reviewer pattern", worded as assistant sessions or a person, not
  specific models.
- `npm audit` generalised to the ecosystem's audit tool (with npm, pip and cargo examples); "package.json" generalised
  to "the manifest".
- Light copy edits for plain English. The substance (five axes, structural remedies, change sizing, change
  descriptions, review speed, disagreements, honesty, dependency discipline, rationalisations, red flags,
  verification, presumptive blockers) is kept in full.
- This adaptation is not affiliated with or endorsed by the author.
