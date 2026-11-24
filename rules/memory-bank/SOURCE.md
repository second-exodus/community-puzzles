# Source

- Original: Memory Bank (best-practices documentation page with the Memory Bank custom instructions),
  https://github.com/cline/cline/blob/34c104e6fc49781cda4adcd73ffdccd8f029fef9/docs/best-practices/memory-bank.mdx
- Repository: cline/cline, commit 34c104e6fc49781cda4adcd73ffdccd8f029fef9, read on 2026-11-24
- Author: Cline Bot Inc. (copyright holder named in the repository licence)
- Licence: Apache-2.0 (full text in LICENSE; the repository has no NOTICE file, and the `docs/` folder has no
  licence of its own)

## Changes
This is the statement of changes required by section 4(b) of the Apache License 2.0. The file was modified as
follows:
- Rewrote the custom instructions and the best practices from the documentation page as tool-neutral rules with
  the sections Must, Should and Examples, one rule per bullet. The first-person persona ("I am Cline …") became a
  short neutral introduction.
- Kept the folder `memory-bank/`, the six core files with their contents and hierarchy, the rule to read all files
  at the start of every task, the update triggers, the full review on "update memory bank", additional context
  files, and the practice of updating before the context window fills up.
- Removed product names, the product's rules folder and settings, its slash commands and its automatic context
  feature, an image, and links into the product documentation. The phrase "follow your custom instructions" became
  "read the memory bank" (the old phrase still works).
- Added, in our own words: handling a missing memory bank, resolving conflicts with the project brief, a rule
  against secrets and personal data, absolute dates, keeping the folder in version control, a start-of-task flow
  and an example `activeContext.md`.
- Front matter for the community format added.
