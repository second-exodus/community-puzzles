# Source

- Original: AGENTS.md, the format description and examples in the repository README and on the format's website
  (its page sections are in the same repository):
  - https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/README.md
  - https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/WhySection.tsx
  - https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/HowToUseSection.tsx
  - https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx
  - https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/CodeExample.tsx
- Repository: agentsmd/agents.md, commit d001185d792eb6402a58e4cbef1c228b309ec25d, read on 2026-11-24
- Author: OpenAI (copyright holder named in the repository licence) and the AGENTS.md contributors
- Licence: MIT (full text in LICENSE)

## Changes
- The original is a format description, not a skill. We kept its substance (README for agents versus README for
  humans, no required fields, the popular sections, nested files in monorepos with the closest file winning,
  chat instructions overriding files, living documentation, the rename-and-link migration tip) and its two sample
  files, and built a step-by-step skill around it in our own words: read the project, collect and verify the
  commands, map the structure, read conventions from configs and code, collect working rules, gotchas and
  security points, write, check, hand over, keep it alive.
- Added a full template, a quality checklist and a red-flags table, in our own words.
- Removed the list of tools and companies that support the format, tool-specific configuration examples, and
  vendor names; replaced `.github/workflows` in the sample with "the CI workflow folder".
- Sections renamed to Goal and Steps; front matter for the community format added.
