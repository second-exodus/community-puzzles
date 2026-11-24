# Source

- Original: "How to do a code review" (The Code Reviewer's Guide), part of Google's Code Review Guidelines in the
  Google Engineering Practices Documentation. Files used:
  - https://github.com/google/eng-practices/blob/3bb3ec25b3b0199f4940b1aa75f0ac5c5753301c/review/reviewer/index.md
  - https://github.com/google/eng-practices/blob/3bb3ec25b3b0199f4940b1aa75f0ac5c5753301c/review/reviewer/standard.md
  - https://github.com/google/eng-practices/blob/3bb3ec25b3b0199f4940b1aa75f0ac5c5753301c/review/reviewer/looking-for.md
  - https://github.com/google/eng-practices/blob/3bb3ec25b3b0199f4940b1aa75f0ac5c5753301c/review/reviewer/navigate.md
  - https://github.com/google/eng-practices/blob/3bb3ec25b3b0199f4940b1aa75f0ac5c5753301c/review/reviewer/speed.md
  - https://github.com/google/eng-practices/blob/3bb3ec25b3b0199f4940b1aa75f0ac5c5753301c/review/reviewer/comments.md
  - https://github.com/google/eng-practices/blob/3bb3ec25b3b0199f4940b1aa75f0ac5c5753301c/review/reviewer/pushback.md
  - https://github.com/google/eng-practices/blob/3bb3ec25b3b0199f4940b1aa75f0ac5c5753301c/review/emergencies.md
  - https://github.com/google/eng-practices/blob/3bb3ec25b3b0199f4940b1aa75f0ac5c5753301c/review/index.md (overview) and https://github.com/google/eng-practices/blob/3bb3ec25b3b0199f4940b1aa75f0ac5c5753301c/README.md (terminology, licence)
- Repository: google/eng-practices, commit 3bb3ec25b3b0199f4940b1aa75f0ac5c5753301c, read on 2026-11-24
- Author: Google (as named in the repository README; no separate copyright line)
- Licence: CC-BY-3.0 (full text in LICENSE)
- Licence: https://creativecommons.org/licenses/by/3.0/

This is an adaptation under the Creative Commons Attribution 3.0 Unported licence. It is not affiliated with,
sponsored or endorsed by Google or the authors of the original work. The name "after Google's engineering practices"
only credits the source.

## Changes

- Condensed the eight pages of the reviewer guide (standard, what to look for, navigating a change, speed, comments,
  pushback) and the emergencies page into one rule set with Must, Should and Examples, one rule per bullet. Most
  wording is paraphrased and shortened; a few sentences and the two courtesy examples are kept nearly verbatim.
- Replaced company-internal terms: "CL" became "change", "LGTM" became "approve" (explained once), "g3doc" became
  "docs", "Google's style guides" became "the project's style guide", "file a bug" became "file a ticket".
- Removed company-specific passages: the link to the external style-guide site, "At Google, we hire great software
  engineers", the OWNERS-file remark and the link to the Chromium respect guide. The substance of each point is
  kept.
- Not included: the change author's guide (review/developer/*), apart from the notion of splitting large changes.
  The section on picking reviewers and on in-person reviews from the overview page is also left out.
- Added: a short definition of "change" and "approve" at the top, and the severity-label example comments (the
  original gives the labels with generic descriptions only).
- Named the puzzle `code-review-standard` (title "Code review standard"); the original and its author are named
  only here and in the last lines of RULES.md, so the title does not suggest that Google stands behind this version.
