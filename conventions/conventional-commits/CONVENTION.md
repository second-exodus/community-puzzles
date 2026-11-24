---
name: "Conventional Commits"
description: Every commit message follows the Conventional Commits 1.0.0 structure - type, optional scope, description, optional body and footers - so people and tools can read the intent, derive the next SemVer version and generate changelogs.
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: release/versions
---

# Conventional Commits

Use the Conventional Commits specification for every commit message you write or suggest. The message has this
structure:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The structure tells the consumers of a library what a commit means: `fix` patches a bug (SemVer PATCH), `feat` adds a
feature (SemVer MINOR), and a breaking change - in a commit of any type - changes the API incompatibly (SemVer MAJOR).
The key words MUST, MUST NOT, SHOULD and MAY in the specification are meant as in RFC 2119.

## Must

- Start every commit message with a type - a noun such as `feat` or `fix` - followed by an optional scope, an optional `!`, and a required colon and space (`: `).
- Use the type `feat` when the commit adds a new feature to the application or library.
- Use the type `fix` when the commit fixes a bug.
- Write a scope, if you give one, as a noun for a section of the codebase in parentheses directly after the type, for example `fix(parser): `.
- Put the description directly after the colon and space; it is a short summary of the code change, for example `fix: array parsing issue when multiple spaces were contained in string`.
- Start a body, if there is one, one blank line after the description; the body is free-form and may have any number of paragraphs.
- Start the footers, if there are any, one blank line after the body.
- Write each footer as a word token, then `: ` or ` #`, then a value, like a git trailer (`Reviewed-by: Z`, `Refs #133`).
- Use `-` instead of spaces in footer tokens (`Acked-by`, `Reviewed-by`); the only exception is `BREAKING CHANGE`.
- Let a footer value contain spaces and newlines; it ends where the next valid token and separator begin.
- Mark every breaking change, either with `!` immediately before the `:` in the prefix, or with a footer, or both.
- Write a breaking-change footer as uppercase `BREAKING CHANGE`, a colon, a space and a description, for example `BREAKING CHANGE: environment variables now take precedence over config files`.
- When you mark a breaking change with `!` only, make the description itself describe the breaking change.
- Treat `BREAKING-CHANGE` as a synonym of `BREAKING CHANGE` when it is used as a footer token.
- When you build tools that read these messages, treat types, scopes and footer tokens as case-insensitive - except `BREAKING CHANGE`, which must be uppercase.

## Should

- Use further types when they fit; the common set (from commitlint's conventional config, based on the Angular convention) is:
  `build` (build system or dependencies), `chore` (maintenance), `ci` (CI configuration), `docs` (documentation only), `style` (formatting, missing semicolons - no code meaning), `refactor` (restructure without changing behaviour), `perf` (performance), `test` (adding or fixing tests).
- Remember that types other than `feat` and `fix` have no effect on the version by themselves - unless they carry a breaking change.
- Pick one casing for types and scopes (lowercase is the usual choice) and keep it everywhere.
- Keep the description short enough to read in a one-line log; put the why and the details in the body.
- Make one commit per kind of change: if a commit would fit more than one type, split it into several commits.
- Reference issues and reviewers in footers (`Refs: #123`, `Closes #123`, `Reviewed-by: Name <email>`), not in the description.
- For a revert, use the type `revert` and a footer that names the reverted commits, for example `Refs: 676104e, a215868`.
- Follow the convention from the first commit, even before the first release - someone already reads the history.
- If you used the wrong type, fix it before merging or releasing (amend or rebase the commit); after a release, leave the history alone and correct the changelog instead.
- If a squash-merge workflow is used, apply the convention to the pull-request title, because it becomes the commit message.

## Examples

Feature with scope:

```
feat(lang): add Polish language
```

Bug fix with body and issue footer:

```
fix(checkout): prevent double submit of the payment form

The submit button stayed active while the payment request was pending,
so a second click created a second charge. The button is now disabled
until the request settles.

Closes #482
```

Breaking change marked with `!` only - the description says what breaks:

```
feat(api)!: remove the deprecated /v1/users endpoint
```

Breaking change with `!` and a footer that explains the migration:

```
refactor(config)!: read settings from environment variables first

BREAKING CHANGE: environment variables now take precedence over config files.
Move values you want to keep into the config file or unset the variables.
```

Documentation change without body:

```
docs: correct spelling of CHANGELOG
```

Revert:

```
revert: let us never again speak of the noodle incident

Refs: 676104e, a215868
```

Wrong - and why:

```
Fixed stuff                      # no type, no colon, vague description
feat: add login and fix footer   # two kinds of change in one commit; split it
fix(Parser) : handle tabs        # space before the colon; scope not in the project's casing
feat!: new API                   # breaking change without saying what breaks
```

---
Adapted from the Conventional Commits 1.0.0 specification by the Conventional Commits project (https://www.conventionalcommits.org/en/v1.0.0/), CC-BY-3.0, with wording from "git-conventional-commit-messages" and "gitflow" in PatrickJS/awesome-cursorrules (https://github.com/PatrickJS/awesome-cursorrules/blob/b044f956f021b6e8877f16781bcfc466a6a120e9/rules/git-conventional-commit-messages.mdc), CC0-1.0.
Changes: rewritten as Must/Should rules, type meanings and FAQ guidance from the specification added, examples rewritten. See SOURCE.md.
