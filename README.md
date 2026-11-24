# Community puzzles

Thirty of the best openly licensed skills, rules, conventions and agents for AI coding assistants, adapted so they
work with **any** assistant: Claude, Copilot, Codex, Gemini, Cursor and others. Each one is a folder you can copy
into your project, or take over in one click from the [Trinity Community](https://community.trinity-universe.com).

Every puzzle comes from its original repository, at a pinned commit, under the licence of that original. We kept
the substance, removed what only one vendor's tool understands, fixed mistakes we found and wrote down every change.

> **Status: drafts.** Every puzzle carries `status: draft` until a maintainer has read and approved it.

## Testing

| Puzzle | Kind | What you get | Original | Licence |
|---|---|---|---|---|
| [Test-driven development](skills/test-driven-development/) | Skill | Red, green, refactor. No code without a failing test first. | [obra/superpowers](https://github.com/obra/superpowers) | MIT |
| [Systematic debugging](skills/systematic-debugging/) | Skill | Find the root cause before you touch a line. | [obra/superpowers](https://github.com/obra/superpowers) | MIT |
| [Web app testing](skills/webapp-testing/) | Skill | Drive the real browser and check what users see. | [anthropics/skills](https://github.com/anthropics/skills) | Apache-2.0 |
| [Property-based testing](skills/property-based-testing/) | Skill | Let a thousand generated inputs find the bug for you. | [trailofbits/skills](https://github.com/trailofbits/skills) | CC-BY-SA-4.0 |
| [Test gap audit](skills/test-gap-audit/) | Skill | Find the behaviour no test protects yet. | [github/awesome-copilot](https://github.com/github/awesome-copilot) | MIT |

## Code review

| Puzzle | Kind | What you get | Original | Licence |
|---|---|---|---|---|
| [Review rubric](rules/review-rubric/) | Rules | Only findings you can prove, ranked by what hurts most. | [openai/codex](https://github.com/openai/codex) | Apache-2.0 |
| [Code review and quality](skills/code-review-and-quality/) | Skill | A review in passes: intent, correctness, upkeep. | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT |
| [Receiving code review](skills/receiving-code-review/) | Skill | Check each comment, then fix, push back or ask. | [obra/superpowers](https://github.com/obra/superpowers) | MIT |
| [Code review standard](rules/code-review-standard/) | Rules | Approve what makes the code base better, not perfect. | [google/eng-practices](https://github.com/google/eng-practices) | CC-BY-3.0 |
| [Differential security review](skills/differential-security-review/) | Skill | Read the diff like an attacker before it ships. | [trailofbits/skills](https://github.com/trailofbits/skills) | CC-BY-SA-4.0 |
| [Code simplification](skills/code-simplification/) | Skill | Less code, same behaviour, easier to read. | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT |
| [Refactor](skills/refactor/) | Skill | Small safe steps, tests green after each one. | [github/awesome-copilot](https://github.com/github/awesome-copilot) | MIT |

## Release

| Puzzle | Kind | What you get | Original | Licence |
|---|---|---|---|---|
| [Shipping and launch](skills/shipping-and-launch/) | Skill | From done to live, with a way back. | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT |
| [GitHub release](skills/github-release/) | Skill | The right version number, notes people read. | [github/awesome-copilot](https://github.com/github/awesome-copilot) | MIT |
| [Changelog automation](skills/changelog-automation/) | Skill | A changelog that writes itself from the history. | [wshobson/agents](https://github.com/wshobson/agents) | MIT |
| [Conventional commits](conventions/conventional-commits/) | Convention | Commit messages machines and people can read. | [conventional-commits/conventionalcommits.org](https://github.com/conventional-commits/conventionalcommits.org) | CC-BY-3.0 |

## Pipeline

| Puzzle | Kind | What you get | Original | Licence |
|---|---|---|---|---|
| [Fix failing CI](skills/fix-failing-ci/) | Skill | Read the red run, find the cause, make it green. | [openai/skills](https://github.com/openai/skills) | Apache-2.0 |
| [Secure GitHub Actions](rules/secure-github-actions/) | Rules | Pinned actions, least privilege, no injection. | [github/awesome-copilot](https://github.com/github/awesome-copilot) | MIT |

## Documentation

| Puzzle | Kind | What you get | Original | Licence |
|---|---|---|---|---|
| [Documentation writer](agents/documentation-writer/) | Agent | Tutorials, how-tos, reference and explanation, each in its place. | [github/awesome-copilot](https://github.com/github/awesome-copilot) | MIT |
| [Architecture decision records](skills/architecture-decision-records/) | Skill | Write down why, so nobody has to guess later. | [wshobson/agents](https://github.com/wshobson/agents) | MIT |
| [Docs with the code](rules/docs-with-code/) | Rules | Every change updates the docs it makes wrong. | [github/awesome-copilot](https://github.com/github/awesome-copilot) | MIT |

## Security

| Puzzle | Kind | What you get | Original | Licence |
|---|---|---|---|---|
| [Security audit](skills/security-audit/) | Skill | Walk the code the way an attacker would. | [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) | MIT |
| [Threat model](skills/threat-model/) | Skill | What can go wrong, who would do it, what stops them. | [openai/skills](https://github.com/openai/skills) | Apache-2.0 |
| [OWASP secure coding](rules/owasp-secure-coding/) | Rules | The top risks of the web, turned into rules. | [github/awesome-copilot](https://github.com/github/awesome-copilot) | MIT |

## Planning and tasks

| Puzzle | Kind | What you get | Original | Licence |
|---|---|---|---|---|
| [Spec, plan, tasks](skills/spec-plan-tasks/) | Skill | Say what, then how, then the steps. In that order. | [github/spec-kit](https://github.com/github/spec-kit) | MIT |
| [Brainstorm and plan](skills/brainstorm-and-plan/) | Skill | Agree on the design first, then write the plan. | [obra/superpowers](https://github.com/obra/superpowers) | MIT |
| [PRD to tasks](skills/prd-to-tasks/) | Skill | From an idea to a requirements doc to a task list. | [snarktank/ai-dev-tasks](https://github.com/snarktank/ai-dev-tasks) | Apache-2.0 |

## Getting started

| Puzzle | Kind | What you get | Original | Licence |
|---|---|---|---|---|
| [Write AGENTS.md](skills/write-agents-md/) | Skill | One file that tells every assistant how your project works. | [agentsmd/agents.md](https://github.com/agentsmd/agents.md) | MIT |
| [Mentor](agents/mentor/) | Agent | Explains, asks back and lets you write the code. | [github/awesome-copilot](https://github.com/github/awesome-copilot) | MIT |
| [Memory bank](rules/memory-bank/) | Rules | The assistant remembers your project between sessions. | [cline/cline](https://github.com/cline/cline) | Apache-2.0 |

## How a puzzle is built

```
<kind>/<name>/
  SKILL.md | RULES.md | CONVENTION.md | AGENT.md   the puzzle (front matter, Goal, Steps …)
  trinity-share.json                              what the Trinity Community shows: kind, tags, licence, runs with
  SOURCE.md                                       original file and commit, author, licence, every change we made
  LICENSE (NOTICE)                                the licence text of the original
  media/cover.webp                                the cover, drawn by tools/covers
```

To use one without Trinity: copy the folder into the place your assistant reads instructions from (for example a
skills folder, or paste a rules file into your project's instructions) and keep SOURCE.md and LICENSE with it.

## Licences and credit

Each folder is under the licence named in its `trinity-share.json` and `LICENSE`; the original authors keep their
copyright. Puzzles from CC BY-SA sources stay CC BY-SA. Naming an original does not mean its author or any vendor
endorses this collection. The covers are drawn by `tools/covers` and belong to Trinity.

Found a mistake, or a puzzle you would like here? Open an issue. Rules for changes: [AGENTS.md](AGENTS.md).
