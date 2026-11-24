---
name: "Code review standard"
description: The reviewer's side of code review, condensed into rules. When to approve, what to look for, in which order to read a change, how fast to answer, how to write comments, how to handle pushback, and what counts as an emergency.
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: review
---

# Code review standard

These rules apply to anyone reviewing a change, whether a person or an assistant. A "change" is one self-contained
modification under review: a pull request, merge request, patch or changelist. "Approve" means the reviewer's
sign-off ("LGTM").

## Must

### The standard

- Approve a change once it **definitely improves the overall code health** of the system, even if it is not perfect.
  This is the senior principle among all the rules below.
- Seek continuous improvement, not perfection. There is no perfect code, only better code. Do not delay a change
  that improves maintainability, readability and understandability for days because it is not "perfect".
- Never approve a change that definitely makes overall code health worse, except in a real emergency (see
  "Emergencies").
- You may refuse a well-written change if it adds a feature you do not want in the system.
- Technical facts and data overrule opinions and personal preferences.
- On style, the project's style guide is the final authority. A purely stylistic point that the style guide does
  not cover is personal preference. Keep the style consistent with what is there. If there is no previous style,
  accept the author's.
- Treat software design as engineering, not taste. Weigh design on underlying principles. If the author shows, with
  data or solid engineering principles, that several approaches are equally valid, accept the author's choice.
- If no other rule applies, you may ask the author to be consistent with the current codebase, as long as that does
  not make code health worse.

### What to look for

- **Design first.** Do the pieces interact sensibly? Does this change belong in this codebase or in a library? Does
  it fit the rest of the system? Is now the right time for this functionality?
- **Functionality.** Does the change do what the author intended, and is that good for its users? Users means both
  end users and the developers who will use this code later. Think about edge cases and concurrency, think like a
  user, and look for bugs visible by reading.
- **Check user-facing behaviour for real.** For UI changes and other user-facing changes, run the change or ask for a
  demo; reading the code is not enough.
- **Think through parallel code carefully.** Anything that could deadlock or race needs careful thought from both the
  author and the reviewer; running the code rarely shows such problems.
- **Complexity.** Check every level: lines, functions, classes. "Too complex" means it cannot be understood quickly,
  or developers are likely to introduce bugs when they call or change it.
- **Over-engineering.** Watch for code that is more generic than needed, or for functionality the system does not
  need yet. Solve the problem that exists now, not one that might arrive later.
- **Tests.** Ask for unit, integration or end-to-end tests as fits the change, in the same change as the production
  code (except in emergencies). Check that the tests are correct, sensible and useful.
  - Will they fail when the code is broken?
  - Will they give false positives when the code under them changes?
  - Does each test make simple, useful assertions?
  - Are the tests split sensibly between test methods?
- Hold tests to the same complexity standard as production code. Tests are code that has to be maintained.
- **Naming.** A good name is long enough to say fully what the item is or does, and no longer.
- **Comments.** Check that comments are clear, necessary and mostly explain *why*, not *what*. If the code needs a
  comment to say what it does, ask for simpler code instead. Exceptions: regular expressions and complex algorithms.
  Also check old comments near the change: a TODO that can now go, or a warning against this very change.
- **Style.** The change follows the project's style guide. Mark improvements the guide does not require with
  "Nit:", and never block a change on personal style preference alone.
- **No large style changes mixed with other changes.** A full reformat goes in its own change, before or after the
  functional change.
- **Consistency.** If the style guide requires something, the new code follows it even when the existing code does
  not. Where the guide only recommends, lean towards the guide unless the local inconsistency would be too
  confusing. Ask for a ticket or TODO to clean up the old code.
- **Documentation.** If the change affects how people build, test, use or release the code, the matching
  documentation (READMEs, docs, generated references) is updated in the same change. Deleted or deprecated code
  takes its documentation with it. If documentation is missing, ask for it.
- **Every line.** Look at every human-written line you were asked to review. You may scan data files, generated code
  and large data structures, but never assume a class, function or block is fine without reading it. At the least,
  make sure you understand what all the code does.
- If the code is too hard to understand, say so and wait for the author to clarify before reviewing further. If you
  cannot understand it, future readers will not either.
- If you are not qualified for part of the change (privacy, security, concurrency, accessibility,
  internationalisation …), make sure a qualified reviewer is on it.
- If you review only some files or some aspects of the change, say in a comment which parts you reviewed.
- **Context.** Look beyond the diff. Read the whole file when needed: four new lines may sit in a 50-line method
  that now needs splitting.
- Ask whether the change makes the system as a whole healthier or more complex and less tested. Do not accept
  changes that make code health worse; systems become complex through many small changes.
- **Good things.** When something in the change is good, say so, and say why, especially when the author handled
  one of your comments well.

### Order of reading a change

- First, take a broad view. Read the description and what the change does overall. Does it make sense at all? If
  the change should not happen, say so at once, explain why, and suggest what to do instead. Stay courteous.
- Second, find the main part: usually the file with the most logical changes. Review it first, because it gives
  context to the rest. If the change is too large to find the main part, ask the author where to start or ask them
  to split it.
- Send comments on major design problems **immediately**, even before you have reviewed the rest. Much of the other
  code may disappear anyway, and the author may already be building on the flawed design.
- Third, go through the remaining files in a sensible order without skipping any. Reading the tests first often helps.

### Speed

- If you are not in the middle of focused work, review a change shortly after it arrives.
- Respond within **one business day** at most. A typical change should get several review rounds in one day if
  needed.
- If you are in the middle of focused work such as writing code, do not interrupt it for a review. Answer at the
  next natural break.
- What matters most is the speed of each *response*, not of the whole process. If you are too busy for a full
  review, send a quick reply: when you will get to it, other reviewers who could help, or first broad comments.
- Spend enough time that your approval really means "this code meets the standard". Speed never lowers the standard.
- Across time zones, try to answer while the author still has working time left that day.
- You may **approve with comments** when one of these applies, and say which one you mean:
  - you trust the author to address all remaining comments;
  - the remaining comments do not have to be addressed;
  - they are minor (sort imports, fix a nearby typo, apply a suggested fix, remove an unused dependency).
- If a change is too large to review soon, ask the author to split it into smaller changes that build on each other.
  If it cannot be split, at least send comments on the overall design. Always leave the author with a next step they
  can take.

### Writing comments

- Be kind. Comment on the *code*, never on the *developer*, above all when the point might upset them.
- Explain why: your intent, the best practice you follow, or how the suggestion improves code health.
- Fixing the change is the author's job, not the reviewer's. You do not have to design the solution or write the
  code. Balance pointing out problems (which helps the author learn) with direct suggestions or code where that
  helps more.
- Ask for simpler code or a code comment instead of an explanation in the review tool. An explanation that exists
  only in the review does not help future readers. Accept a review-only explanation only when it covers something
  regular readers of this code would already know.
- Label comments that are not required, so authors do not treat every comment as mandatory:
  - `Nit:` a minor point. Technically you should do it, but it hardly matters.
  - `Optional:` or `Consider:` a good idea, but not required.
  - `FYI:` not expected in this change; something to think about later.
- Purely educational comments are welcome. Mark them as `Nit:` or otherwise as not required.

### Pushback

- When the author disagrees, first check whether they are right; they are often closer to the code. If their
  argument holds from a code-health point of view, tell them so and drop the point.
- If you still believe your suggestion improves code health enough to justify the work, keep advocating it. Explain
  again, showing that you understood their reply and adding new reasons. Stay polite: you hear them, you just do not
  agree.
- Do not give in out of fear of upsetting the author. Upset usually comes from how a comment is worded, not from
  insisting on quality.
- Do not accept "I'll clean it up later". New complexity is cleaned up before merge, except in an emergency. If the
  change exposes surrounding problems that cannot be fixed now, the author files a ticket assigned to themselves,
  and may add a TODO that links to it.
- If you and the author cannot reach agreement, try a call or a meeting first, and record the outcome as a comment
  on the change. If that fails, escalate: a wider team discussion, the tech lead, a maintainer of the code or an
  engineering manager. Never let a change sit because the two of you disagree.

### Emergencies

- An emergency is a **small** change that lets a major launch continue instead of rolling back, fixes a bug that
  significantly affects users in production, handles a pressing legal issue, or closes a major security hole.
- Only in an emergency does the speed of the whole review, and whether the change really solves the emergency, come
  before everything else. Emergency reviews take priority over all other reviews.
- After the emergency, review the emergency change again, thoroughly.
- These are **not** emergencies:
  - wanting to launch this week rather than next week without a hard deadline;
  - the author has worked on the feature for a long time;
  - the reviewers are asleep in another time zone or away;
  - it is Friday evening;
  - a manager wants it today because of a soft deadline;
  - rolling back a change that breaks tests or the build.
- A hard deadline is one where something disastrous happens if it is missed: a contractual date, a product that
  fails completely in the market if it ships late, a once-a-year hardware shipping date. Most deadlines are soft. Do
  not sacrifice code health for a soft deadline.

## Should

- Teach through review. Sharing knowledge about a language, framework or design principle improves code health over
  time.
- If you keep receiving changes you do not want, improve the process (for example, discussing first before writing
  code), so people hear "no" before doing a lot of work.
- Expect reviews to get faster over time when you are both strict and quick: authors learn what healthy code needs
  and send better changes. Do not trade standards for an imagined gain in speed.
- If a team keeps pushing large changes in at the end of a release cycle with only a superficial review, move large
  features earlier in the cycle.

## Examples

Comment on the code, not the person:

- Bad: "Why did **you** use threads here when there's obviously no benefit to be gained from concurrency?"
- Good: "The concurrency model here adds complexity without any performance benefit that I can see. Because there's
  no performance benefit, it's best for this code to be single-threaded instead of using multiple threads."

Rejecting a change courteously, with an alternative:

> Looks like you put some good work into this, thanks! However, we're moving towards removing the FooWidget system
> you're modifying here, so we don't want new changes to it right now. How about refactoring our new BarWidget class
> instead?

Severity labels:

> Nit: `userCount` would read better than `cnt` here.
>
> Optional: extracting the retry loop into a helper would make `sync()` easier to test.
>
> FYI: the next version of the HTTP client has built-in retries; not for this change.

---
Adapted from "The Code Reviewer's Guide" (Google's Code Review Guidelines, Google Engineering Practices Documentation) by Google (https://github.com/google/eng-practices/tree/3bb3ec25b3b0199f4940b1aa75f0ac5c5753301c/review), CC-BY-3.0 (https://creativecommons.org/licenses/by/3.0/).
Changes: condensed the reviewer guide and the emergencies page into Must/Should rules, company-internal terms replaced by general ones. See SOURCE.md.
