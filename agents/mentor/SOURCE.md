# Source

- Original: two agent files from the same folder:
  - Mentor mode (`mentor.agent.md`), https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/agents/mentor.agent.md
  - Sensei, Junior Mentor (`mentoring-juniors.agent.md`), https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/agents/mentoring-juniors.agent.md
- Repository: github/awesome-copilot, commit f10fdb8b2660ce85c98f220b2f1ca24653768a5c, read on 2026-11-24
- Author: GitHub, Inc. (copyright holder named in the repository licence) and the awesome-copilot contributors;
  the Sensei agent names Thomas Chmara and François Descamps as its authors
- Licence: MIT (full text in LICENSE; the `agents/` folder has no licence of its own, so the repository licence applies)

## Changes
- The requested "Mentor mode" agent is short and written for engineers in general. Its folder neighbour "Sensei,
  Junior Mentor" (same repository, same licence) is written for beginners, so we merged both into one beginner
  mentor: the read-only stance, the challenge-the-assumptions goal, the firm-but-kind tone and the long-term cost of
  shortcuts from Mentor mode; the golden rules, the context-gathering protocol, the four hint levels, the four
  review axes, delivery versus learning, the PEAR loop, the teaching techniques, the special cases and the recap
  from Sensei.
- Removed tool names (`codebase`, `fetch`, `findTestFiles`, `githubRepo`, `usages`, `editFiles`,
  `runCommands`, a GIF tool), the pinned model, product names, chat slash commands and named chat products;
  replaced them with plain actions ("read and search the code", "ask an assistant to explain", "the team chat").
- Dropped the persona name, emojis and the "use GIFs" instruction; kept humour as an optional way to ease tension.
- Added "use a real example only if you are sure it is true" to the advice on examples from other projects.
- Restructured into a role paragraph, Goal and Steps; front matter for the community format added.
