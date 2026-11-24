# Source

- Original: Systematic Debugging, https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/systematic-debugging/SKILL.md
  with its technique files https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/systematic-debugging/root-cause-tracing.md, https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/systematic-debugging/defense-in-depth.md,
  https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/systematic-debugging/condition-based-waiting.md and the script https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/systematic-debugging/find-polluter.sh
- Repository: obra/superpowers, commit 22f0b463e7a5e579904dd6211a520321035526f7, read on 2026-11-24
- Author: Jesse Vincent
- Licence: MIT (full text in LICENSE)

## Changes
- Restructured into the sections Goal and Steps; the four phases are the steps.
- The three technique files (root-cause tracing, defence in depth, condition-based waiting) were too long to
  ship alongside; their essentials are folded into SKILL.md as sections, with the worked example kept.
- The bisection script `find-polluter.sh` is not shipped; its logic is folded in as a short shell loop with
  the test command marked as a placeholder. The TypeScript example file `condition-based-waiting-example.ts`
  is not included; the generic `waitFor` helper from the technique file is.
- Removed Graphviz decision diagrams and the session statistics ("1847 tests passed", "60% to 100%").
- Replaced references to other skills of the source collection with the plain instruction (write a failing
  test first, verify before claiming success); "your human partner" became "the person you work for";
  an assistant-specific prompt phrase in the signals list became "Think harder about this".
- Added front matter for this collection (status draft, runs-with, for, category).
