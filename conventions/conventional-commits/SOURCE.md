# Source

- Original: Conventional Commits 1.0.0 specification, https://www.conventionalcommits.org/en/v1.0.0/ (source text:
  https://github.com/conventional-commits/conventionalcommits.org/blob/7d293dc59e88abc8ce6c6698344d4da518ff3f27/content/v1.0.0/index.md)
- Repository: conventional-commits/conventionalcommits.org, commit 7d293dc59e88abc8ce6c6698344d4da518ff3f27, read on 2026-11-24
- Author: the Conventional Commits project (conventionalcommits.org)
- Licence: CC-BY-3.0, as stated on the specification website (site configuration:
  https://github.com/conventional-commits/conventionalcommits.org/blob/7d293dc59e88abc8ce6c6698344d4da518ff3f27/config.yaml).
  The repository's MIT licence covers the website code, not the specification text.
  Licence: https://creativecommons.org/licenses/by/3.0/ (notice in LICENSE). This adaptation stays under CC BY 3.0.

## Also used

- git-conventional-commit-messages, https://github.com/PatrickJS/awesome-cursorrules/blob/b044f956f021b6e8877f16781bcfc466a6a120e9/rules/git-conventional-commit-messages.mdc,
  and the commit type descriptions in https://github.com/PatrickJS/awesome-cursorrules/blob/b044f956f021b6e8877f16781bcfc466a6a120e9/rules/gitflow.mdc
- Repository: PatrickJS/awesome-cursorrules, commit b044f956f021b6e8877f16781bcfc466a6a120e9, read on 2026-11-24
- Author: the awesome-cursorrules contributors (repository by PatrickJS)
- Licence: CC0-1.0 (text in LICENSE-CC0)

The awesome-cursorrules rule is itself an almost word-for-word copy of the specification's summary and
"Specification" section, so the specification is named as the original. The CC0 parts add no conditions.

## Changes
- Front matter added (name, description, status, runs-with, for, category); text restructured into Must, Should and Examples, one rule per bullet, written as instructions to the person or assistant writing the commit.
- Removed the Cursor-specific front matter (`globs`, `alwaysApply`) and the reference to "Cursor rules".
- Added type meanings (build, chore, ci, docs, style, refactor, perf, test), partly from gitflow.mdc in the same repository.
- Added guidance from the specification's FAQ (consistent casing, split commits that fit several types, initial development, wrong types, squash workflows, revert commits) - CC BY 3.0, see above.
- Examples: three are taken from the specification (`feat(lang): add Polish language`, `docs: correct spelling of CHANGELOG`, the revert example; CC BY 3.0); the others are new, including a "wrong - and why" block.
- Added one rule of our own: keep the description short enough for a one-line log and put details in the body.
