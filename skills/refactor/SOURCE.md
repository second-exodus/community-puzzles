# Source

- Original: Refactor (`refactor`), https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/skills/refactor/SKILL.md
- Repository: github/awesome-copilot, commit f10fdb8b2660ce85c98f220b2f1ca24653768a5c, read on 2026-11-24
- Author: contributed by AungMyoKyaw (spelling fixes by jeremykohn); copyright GitHub, Inc. as named in the repository licence
- Licence: MIT (full text in LICENSE; the source folder has no licence of its own, so the repository licence applies)

## Changes
- Condensed from 645 to under 500 lines. Kept: golden rules, when not to refactor, the ten code smells with
  fixes, extract method, type safety, the strategy pattern, the safe refactoring process, the checklist and the
  table of refactoring operations.
- Turned the overview into Goal and the "Safe Refactoring Process" into six numbered Steps (purpose, prepare with
  characterisation tests, identify, small steps, verify, clean up and report); added Red flags.
- Dropped the Chain of Responsibility example (its code did not compile: abstract and concrete `validate` clash,
  `doValidate` undeclared) and the "Result type" variant (relied on a non-standard `Result.combine` API); shortened
  the builder variant to one line.
- Fixed the diff markers that were wrong in the original (parts of the "bad" code were marked as added in the
  feature envy, nested conditionals, inappropriate intimacy, strategy and chain examples).
- Fixed examples that changed behaviour although the skill forbids it: the extract-method example now produces
  identical output (the original changed the count labels, the header underline and a trailing blank line), and
  the type-safety example now only adds types (the original also added a silver rate, validation and a new return
  shape). Added notes that new validation in domain types and the strategy switch are behaviour decisions.
- Removed the unused parameter in the feature envy fix and renamed "Ask, don't tell" to the Law of Demeter, which
  is what the example shows.
- Removed the reference to another skill of the source collection; added a hint to search the whole project before
  deleting "dead" code.
