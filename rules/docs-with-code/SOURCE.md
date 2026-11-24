# Source

- Original: Update Documentation on Code Change, https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/instructions/update-docs-on-code-change.instructions.md
- Repository: github/awesome-copilot, commit f10fdb8b2660ce85c98f220b2f1ca24653768a5c, read on 2026-11-24
- Author: contributed by jhauga (pull request #487); copyright GitHub, Inc. as named in the repository licence
- Licence: MIT (full text in LICENSE; the `instructions/` folder has no licence of its own, so the repository licence applies)

## Changes
- Condensed 549 lines into a rule file with the sections Must, Should and Examples, one rule per bullet.
- Dropped the "configurable instruction sections" machinery (on/off properties and apply-conditions); the default
  set of sections is kept as rules, the optional git integration became Should rules for pull requests and review.
- Removed the file-glob header and wording tied to one assistant; the rules work with any AI assistant.
- Made the changelog and the suggested docs structure conditional on the project ("if the project keeps one",
  "ask before creating it"), and the doc-check tooling a suggestion to ask about instead of a placeholder npm script.
- Replaced the fixed monthly/quarterly/annual review schedule with "per release" and "at least once a year".
- Added a short table that maps typical code changes to the documents they touch; made the changelog and
  reference examples concrete.
