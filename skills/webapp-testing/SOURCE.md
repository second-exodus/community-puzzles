# Source

- Original: Web Application Testing (webapp-testing), https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/webapp-testing/SKILL.md
  with the helper https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/webapp-testing/scripts/with_server.py and the examples
  https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/webapp-testing/examples/element_discovery.py, https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/webapp-testing/examples/static_html_automation.py, https://github.com/anthropics/skills/blob/e4bb5d960d87126ff3b3a8af1a104b7db67560ba/skills/webapp-testing/examples/console_logging.py
- Repository: anthropics/skills, commit e4bb5d960d87126ff3b3a8af1a104b7db67560ba, read on 2026-11-24
- Author: Anthropic, PBC (copyright line in the skill's LICENSE.txt)
- Licence: Apache-2.0 (full text in LICENSE, copied from the skill folder's LICENSE.txt; the repository has no
  NOTICE file for this skill)

## Changes
Statement of changes as required by section 4(b) of the Apache License 2.0:

- `SKILL.md` was modified: restructured into the sections Goal, Steps, Examples and Rules; the front matter
  was replaced by this collection's front matter (status draft, runs-with, for, category).
- The three example scripts were not shipped as files; their code was folded into `SKILL.md` (modified):
  output paths changed from absolute host paths (`/tmp/...`, `/mnt/user-data/outputs/...`) to the
  project-relative folder `test-results/`; the console example also records uncaught page errors
  (`pageerror`) and waits for networkidle after the click instead of a fixed one-second sleep.
- Added steps that are not in the original: check the prerequisites and ask before installing, turn the run
  into a check with Playwright `expect` assertions, capture evidence, and report.
- Added rules: fall back to waiting for a specific element when networkidle never comes; prefer
  condition-based waits over `wait_for_timeout`; prefer role and label selectors.
- Removed wording about the host assistant's context window; kept the advice to use the helper as a black box.
- `scripts/with_server.py`: each server's output now goes to `test-results/server-<n>.log` instead of an unread pipe
  (a server that prints a lot filled the pipe and blocked). The file says so in its docstring. Nothing else changed.
