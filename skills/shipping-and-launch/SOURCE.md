# Source

- Original: Shipping and Launch, https://github.com/addyosmani/agent-skills/blob/e997ac5b9a74eab332d5e9793bb38a38c8cfdd74/skills/shipping-and-launch/SKILL.md
- Also used: Definition of Done, https://github.com/addyosmani/agent-skills/blob/e997ac5b9a74eab332d5e9793bb38a38c8cfdd74/skills/shipping-and-launch/references/shared/definition-of-done.md, and the skill's evaluation cases, https://github.com/addyosmani/agent-skills/blob/e997ac5b9a74eab332d5e9793bb38a38c8cfdd74/evals/cases/shipping-and-launch.json
- Repository: addyosmani/agent-skills, commit e997ac5b9a74eab332d5e9793bb38a38c8cfdd74, read on 2026-11-24
- Author: Addy Osmani
- Licence: MIT (full text in LICENSE)

## Changes
- Front matter rewritten (triggers, status, runs-with, for, category); sections renamed to Goal and Steps.
- Added a ten-step procedure that leads from collecting launch facts to a go/no-go verdict, based on the expectations in the original evaluation cases (rollback plan before GO, feature-specific monitoring, authority pressure does not override failed gates, a path to a later GO).
- Added an Output section with a go/no-go template and an illustrative example (`example/output.md`).
- Folded a condensed version of the shared Definition of Done into the skill.
- Removed "See also" links to other skills and reference files that are not part of this puzzle.
- Generalised stack-specific items (debug statements in any language, any accessibility checker); added Core Web Vitals thresholds from the original performance reference, a support/on-call runbook item and a rollback owner.
- Shortened the React error-boundary code to a one-paragraph description; kept the server-side error handler and feature-flag examples.
- Added a rationalisation about deadline pressure.
