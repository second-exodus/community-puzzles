---
name: write-agents-md
description: Writes or updates the AGENTS.md of a project by reading the project first, so every coding assistant gets the real setup, build and test commands, the folder structure, the code conventions, the pull request rules and the gotchas. Triggered by "write an AGENTS.md", "create AGENTS.md for this repo", "update AGENTS.md", "write instructions for coding assistants", "onboard the AI to this project".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: beginner
category: start
---

# Write an AGENTS.md

## Goal

AGENTS.md is a simple, open format: one plain Markdown file in the project root that tells coding assistants how to
work in this project. Think of it as a README for agents. The README stays for humans (quick start, what the project
is, how to contribute). AGENTS.md holds the extra, sometimes detailed context an assistant needs and a human
contributor would skip: build steps, tests, conventions, traps.

This skill writes that file **by reading the project, not by guessing**. A good AGENTS.md is:

- **specific**: real commands, real paths, real tool names of this project;
- **true**: every command was found in the project, and run where that is safe;
- **short**: only what an assistant needs to act correctly, with links to existing docs instead of copies;
- **actionable**: "Run `pnpm test` before every commit" instead of "make sure the tests pass".

There are no required fields. AGENTS.md is standard Markdown; any heading works. The template below lists the
sections that help most.

## Steps

1. **Check what already exists.** An `AGENTS.md` anywhere in the tree (then you update it, you do not overwrite it),
   `README`, `CONTRIBUTING`, a docs folder, a pull request template, and instruction files written for one specific
   assistant (rule or instruction files in the root or in hidden tool folders). Collect every rule the people wrote;
   none may get lost.
2. **Find out what kind of project it is.** Read the manifests (`package.json`, `pyproject.toml`,
   `requirements.txt`, `Cargo.toml`, `go.mod`, `pom.xml`, `build.gradle`, `*.csproj`, `Gemfile`, `composer.json` …).
   Use the lockfile to tell the package manager (`pnpm-lock.yaml` → pnpm, `yarn.lock` → yarn, `uv.lock` → uv …).
   Note languages, frameworks, runtime versions (`.nvmrc`, `.tool-versions`, `engines`) and whether it is a
   monorepo (workspaces, build orchestrators, several manifests).
3. **Collect the commands.** Look in the manifest scripts, `Makefile`, `justfile`, `Taskfile`, compose files, the
   README and above all the **CI configuration**: what CI runs is what must pass. Find, for each that exists:
   install, run or dev server, build, all tests, **one test file and one single test**, lint, format, type check,
   database migrations and seed data, code generation.
4. **Verify the commands.** Every command you write down must exist in the files you read. With the person's okay,
   run the cheap and safe ones (lint, type check, one small test file) and note anything surprising, such as a slow
   suite or a needed service. Never run deploy, publish or release commands, destructive database commands, or
   anything that touches production. Mark what you could not verify as "not verified" instead of pretending.
5. **Map the structure.** The top-level folders and what lives in each, entry points, where tests live, and folders
   that must not be edited by hand (generated code, vendored code, build output).
6. **Read the conventions from the project.** First what the tools enforce (`.editorconfig`, linter and formatter
   configs, compiler strictness), then the patterns the code always follows (naming, imports, error handling, how a
   module or component is built). Check a pattern in several files before you write it down. Write no rule the
   project does not follow, and no generic advice the linter already enforces.
7. **Collect the working rules.** Commit message format (read the recent commit history), branch naming, pull
   request title and checklist, required reviews, changelog or documentation duties.
8. **Find the gotchas**: what costs a newcomer an hour. Required environment variables (take the names from
   `.env.example` or similar; **never copy secret values**), services that must be running, ports, slow or flaky
   tests, generated files, commands that must not run during an assistant session (for example a production build
   that breaks the running dev server).
9. **Note the security points.** Where secrets live and how they are loaded, files that must never be committed,
   data that must not leave the machine, areas (auth, payments, personal data) that need extra care and review.
10. **Write the draft** with the template below. Short imperative bullets, commands in backticks, one fact per
    line. Drop sections that do not apply. Link to existing docs instead of repeating them.
11. **Large monorepo? Add nested files.** Put shared rules in the root `AGENTS.md` and a short `AGENTS.md` in each
    package or app with its own commands and rules. Assistants read the nearest `AGENTS.md` in the directory tree,
    so the closest one wins for files in that folder, and an explicit instruction from the person in the chat
    overrides every file.
12. **Avoid two diverging copies.** If an assistant in the team only reads its own instruction file, make that file
    point to AGENTS.md (a symbolic link, or a one-line "Read AGENTS.md" plus only what is truly tool-specific).
    When moving an existing file, keep the old name working, for example:
    `mv AGENT.md AGENTS.md && ln -s AGENTS.md AGENT.md`.
13. **Check and hand over.** Run the quality checklist below, save the file, and tell the person: which commands you
    ran, which you could not verify, which rules you inferred from the code (so they can confirm or delete them),
    and which existing instruction files you merged or pointed to AGENTS.md.
14. **Keep it alive.** AGENTS.md is living documentation. When a command, a folder or a rule changes, update
    AGENTS.md in the same change. When an assistant makes the same mistake twice, add the missing line.

## Template

```markdown
# AGENTS.md

## Project overview
<one to three sentences: what this is, main languages and frameworks, monorepo or single app>

## Setup
- Install dependencies: `<command>`
- Required environment: copy `.env.example` to `.env`; needs `<VAR_NAME>`, `<VAR_NAME>` (ask a maintainer for values)
- Services: `<command that starts the database or other services>`

## Build and run
- Dev server: `<command>` (runs on `<port>`)
- Build: `<command>`

## Testing
- All tests: `<command>`
- One file: `<command> <path>` · one test: `<command> -t "<test name>"`
- Lint / format / type check: `<command>` · `<command>` · `<command>`
- CI runs `<commands>`; they must pass before a pull request is merged.
- Add or update tests for the code you change.

## Code style
- <rule the tools or the code really enforce, e.g. "TypeScript strict mode, no `any`">
- <naming, imports, error handling as this project does them>

## Project structure
- `<folder>/` – <what lives here>
- `<folder>/` – generated, do not edit by hand (regenerate with `<command>`)

## Commits and pull requests
- Commit messages: <format, with one real example from the history>
- Pull request title: <format>; run `<lint command>` and `<test command>` before committing.

## Security
- Never commit `<files>`; secrets come from `<place>`.
- <areas that need extra care, e.g. auth, payments, personal data>

## Gotchas
- <the thing that costs a newcomer an hour, and what to do instead>

## More
- Architecture: `<path to doc>` · Contributing: `<path to doc>`
```

## Example

A minimal AGENTS.md from the format's own examples:

```markdown
# AGENTS.md

## Setup commands
- Install deps: `pnpm install`
- Start dev server: `pnpm dev`
- Run tests: `pnpm test`

## Code style
- TypeScript strict mode
- Single quotes, no semicolons
- Use functional patterns where possible
```

A fuller one for a monorepo package also says how to move around and what must pass:

```markdown
## Dev environment tips
- Use `pnpm dlx turbo run where <project_name>` to jump to a package instead of scanning with `ls`.
- Check the name field inside each package's package.json to confirm the right name; skip the top-level one.

## Testing instructions
- Find the CI plan in the CI workflow folder.
- Run `pnpm turbo run test --filter <project_name>` to run every check defined for that package.
- To focus on one test, add the Vitest pattern: `pnpm vitest run -t "<test name>"`.
- After moving files or changing imports, run `pnpm lint --filter <project_name>`.
- Fix any test or type errors until the whole suite is green.

## PR instructions
- Title format: [<project_name>] <Title>
- Always run `pnpm lint` and `pnpm test` before committing.
```

## Quality checklist

- [ ] Every command appears in the project's files; the safe ones were run, the rest are marked "not verified".
- [ ] The test section says how to run all tests, one file and one test.
- [ ] Every rule is backed by a config file or by code that follows it; nothing is generic filler.
- [ ] No secret values, tokens, internal URLs with credentials or personal data.
- [ ] Nothing copied from the README that a link would cover.
- [ ] No rule from an existing instruction file was lost.
- [ ] Readable in about two minutes; if it grows much longer, move package details into nested AGENTS.md files.
- [ ] Paths are relative to the project root, never absolute paths from one machine.

## Red flags

| Thought | Reality |
|---------|---------|
| "Most projects use `npm test`, I'll write that" | Read the scripts and the CI. A wrong command is worse than none. |
| "I'll add good general advice" | The assistant already knows general advice. Write what is true only here. |
| "I'll paste the README in, to be complete" | Link to it. Duplicates drift apart. |
| "The old instruction file is outdated, I'll replace it" | Merge its rules first and tell the person what moved. |
| "Let me run the deploy script to check it works" | Never. Mark it "not verified". |

---
Adapted from the AGENTS.md format description by OpenAI and the AGENTS.md contributors (https://github.com/agentsmd/agents.md/tree/d001185d792eb6402a58e4cbef1c228b309ec25d), MIT.
Changes: turned the format description and examples into a step-by-step skill that reads and verifies the project, added a template, checklist and red flags. See SOURCE.md.
