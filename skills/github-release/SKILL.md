---
name: github-release
description: Releases a new version of a single-package library hosted on GitHub - reads the code diff since the last tag, proposes the next SemVer version with evidence, writes a Keep a Changelog entry, and opens a release pull request with the gh CLI and git. Triggered by "cut a release", "release a new version", "bump the version", "write the changelog for the release", "time to release".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: devops
category: release/versions
---

# GitHub Release

## Goal

Take a single-package library on GitHub from "changes are merged" to "a release pull request is open" with the right
version number and a changelog that users can trust. The **code diff is the primary source of truth**; commit
messages only add intent. The person confirms the version and the changelog before anything is written, and creates
the tag after the pull request is merged.

Use it whenever someone wants to cut a release, publish or bump a version, create a release branch, generate a
changelog or open a release PR - also when they say it casually ("let's ship a new version").

Requirements: `git` and the GitHub CLI `gh`, authenticated. Commands are shown for a POSIX shell (bash/zsh); a
PowerShell variant is given where the syntax differs.

## Steps

1. Check the environment and ask which directory holds the public source.
2. Bring the default branch up to date.
3. Find the latest version tag.
4. Analyse what changed since that tag - code diff first, commit log second.
5. Propose the next SemVer version with evidence and **wait for confirmation**.
6. Create the release branch.
7. Draft the changelog entry (and version file bump), **show it, wait for confirmation**, then write it.
8. Ask once, then commit and push the release branch.
9. Open the release pull request with a body file.
10. Hand over: the person tags the merge commit and publishes the release.

Work through the steps in order. Show each command before you run it, and its output. Steps 1-5 only read; nothing is
written to the repository until the person has confirmed the version.

### 1. Check the environment and ask one question

```bash
gh auth status                       # must be authenticated
gh repo view --json nameWithOwner    # must be inside a GitHub repository
git status                           # working tree should be clean
```

If a check fails, stop and say what to fix (see "Error handling"). Then ask:

> "Which directory holds your library's public-facing source code (for example `src/`, `lib/`, `pkg/`)? It focuses
> the diff on what consumers see. Press Enter to scan the whole repository."

Store the answer as `PUBLIC_PATH` (empty → `.`). Always exclude from diffs: `tests/`, `test/`, `spec/`,
`__tests__/`, `docs/`, `*.lock`, `*-lock.json`, `*.sum`, generated files (files with a "do not edit" header) and build
output.

### 2. Bring the default branch up to date

```bash
DEFAULT_BRANCH=$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)
git checkout "$DEFAULT_BRANCH"
git pull origin "$DEFAULT_BRANCH"
```

Stay on the default branch. The release branch is created in step 6, after the version is confirmed.

### 3. Find the latest version tag

Read tags from git, not from `gh release list`: GitHub Releases are an optional layer on top of tags, and many
repositories tag versions without ever creating a Release.

```bash
git fetch --tags
# --sort=-version:refname orders 1.10.0 above 1.9.0 (alphabetical sorting does not)
PREV_TAG=$(git tag --sort=-version:refname | grep -E '^v?[0-9]+\.[0-9]+\.[0-9]+' | head -1)
PREV_SHA=$(git rev-list -n 1 "$PREV_TAG" 2>/dev/null || git rev-list --max-parents=0 HEAD)
echo "Latest tag: $PREV_TAG ($PREV_SHA)"
git ls-remote --tags origin | grep "refs/tags/$PREV_TAG$"   # is the tag on the remote?
```

```powershell
git fetch --tags
$prevTag = git tag --sort='-version:refname' | Select-String '^[vV]?\d+\.\d+\.\d+' |
  Select-Object -First 1 -ExpandProperty Line
if ($prevTag) { $prevSha = git rev-list -n 1 $prevTag } else { $prevSha = git rev-list --max-parents=0 HEAD }
Write-Output "Latest tag: $prevTag ($prevSha)"
```

- Keep `PREV_TAG` exactly as found (for example `v1.4.2`). Strip a leading `v` for arithmetic; keep the project's
  prefix style when naming the new tag.
- If the remote check returns nothing, warn that the tag seems to be local only; ask whether to push it first.
- **No tags at all:** `PREV_TAG` is `(none)`, `PREV_SHA` is the first commit, the new version defaults to `1.0.0`.
  Tell the person, skip step 5 and go to step 6.
- **Tag points to no commit (orphaned):** fall back to the first commit and warn the person.

### 4. Analyse what changed since the last release

Use two signals. The code diff is primary; the commit log supports it.

**4a. Code diff (primary signal)**

```bash
git diff "$PREV_SHA"..HEAD --stat -- "$PUBLIC_PATH"        # overview first if the diff is large
git diff "$PREV_SHA"..HEAD -- "$PUBLIC_PATH" \
  ':(exclude)tests/' ':(exclude)test/' ':(exclude)spec/' ':(exclude)__tests__/' \
  ':(exclude)docs/' ':(exclude)*.lock' ':(exclude)*-lock.json' ':(exclude)*.sum'
```

(PowerShell: same command with `"$($prevSha)..HEAD"` and a backtick `` ` `` as line continuation.)

Read the diff. For each changed file, find:

1. **Removed symbols** - public functions, classes, methods, constants, exported names that are gone → strong
   signal for MAJOR.
2. **Changed signatures** - same name, different parameters, return type or thrown errors → strong signal for MAJOR.
3. **New exported symbols** - public API that did not exist before → MINOR.
4. **Internal-only changes** - private helpers, unexported functions, algorithm internals → PATCH.
5. **Bug fixes** - logic that was provably wrong (off-by-one, missing null check, wrong condition) corrected without
   changing the public API → PATCH.

For large diffs, read in full the files with the most changes and the files that define the public surface (`index.*`,
`api.*`, `exports.*`, `public.*`, `mod.*`, `__init__.*`).

**4b. Commit log (secondary signal)**

```bash
git log "$PREV_SHA"..HEAD --oneline --no-merges
```

Use it to understand intent the diff does not show (a one-line security fix), to catch user-visible changes outside
`PUBLIC_PATH` (a CLI flag in `cmd/`), and to add context to changelog entries. See "Classifying commit messages".

**4c. Reconcile the two signals**

When they agree, classify with confidence. When they conflict, **trust the code diff**:

- Commit says `fix: typo`, but the diff removes a public method → MAJOR.
- Commit says `feat: new API`, but the diff only touches private internals → PATCH.
- Commit says `chore: refactor`, but the diff adds new exported symbols → MINOR.

Write every conflict down; you will show it to the person in step 7.

### 5. Propose the next SemVer version

| Condition | Bump |
|---|---|
| Any breaking change to the public API (removal, signature change, behaviour change) | MAJOR |
| New exported symbol or feature, no breaking change | MINOR |
| Only bug fixes, performance, security fixes, docs, chores | PATCH |

A release that mixes types takes the highest: `MAJOR > MINOR > PATCH`. Split `PREV_TAG` into integers, apply the
bump (reset the lower parts to 0), and format with the project's prefix (`vMAJOR.MINOR.PATCH` if tags use `v`).
Details and edge cases: "SemVer rules" below.

Present the proposal with a rationale that cites **code findings**, not just commit messages:

> "I propose v2.1.0. The diff adds two exported functions (`NewClient`, `WithTimeout`) in `src/client.go`; no public
> symbol was removed or changed. The commit messages agree: both are feature additions."

Ask: "Does this version look right, or do you want to adjust it?" **Wait for the answer.**

### 6. Create the release branch

```bash
git checkout -b release/vX.Y.Z
```

### 7. Update the changelog (and the version file)

Read `CHANGELOG.md` (create it if missing) and follow [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/).
Insert below the `# Changelog` heading (and below an `## [Unreleased]` section if the file has one - move its entries
into the new version):

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Deprecated
- ...

### Removed
- ...

### Fixed
- ...

### Security
- ...
```

Rules:

- Use today's date as `YYYY-MM-DD`. Omit empty sections - never leave an empty heading.
- Write entries in plain language **from the user's point of view**, derived mainly from the diff.
  Good: "Added `WithTimeout` option to the HTTP client constructor." Bad: "feat: add timeout cfg param".
- Map findings to sections: new exported symbol → Added · breaking change to existing API → Changed, marked
  **BREAKING** · breaking removal → Removed · deprecation → Deprecated · bug or logic fix, performance → Fixed ·
  security fix → Security · internal refactor, docs, chores, tests → omit unless users can see them.
- If a commit message revealed intent the diff alone would hide (a security fix disguised as a one-line change), put
  that context in the entry.
- Update the compare links at the bottom of the file:
  ```markdown
  [X.Y.Z]: https://github.com/OWNER/REPO/compare/vPREV...vX.Y.Z
  ```
- If the project stores its version in a file (`package.json`, `pyproject.toml`, `Cargo.toml`, `*.csproj`, a
  `version.*` constant …), bump it to `X.Y.Z` in the same commit.

**Show the proposed changelog section before writing it.** List any signal conflicts from step 4c so the person can
check them. Ask: "Is this changelog accurate? Anything to add, remove or reword?" Apply the feedback, then write the
files.

### 8. Commit and push

Ask once before the first outward action: "Push the release branch and open the pull request?"

```bash
git add CHANGELOG.md   # plus the version file, if any
git commit -m "chore: release vX.Y.Z"
git push -u origin release/vX.Y.Z
```

Confirm the push succeeded before continuing.

### 9. Open the pull request

Always pass the body with `--body-file`, never as inline `--body` text: escape sequences such as `\n` are not turned
into newlines in every shell (PowerShell prints them literally), and a file keeps the Markdown intact.

Write `release-pr-body.md` (outside the commit, or delete it afterwards):

````markdown
## Release vX.Y.Z

This PR prepares the **vX.Y.Z** release.

### What's included
<the changelog section from step 7>

### Checklist
- [ ] Changelog reviewed
- [ ] Version bump verified
- [ ] CI passing

After merging, create the tag on the merge commit:
```
git tag -a vX.Y.Z <merge-commit-sha> -m "vX.Y.Z"
git push origin vX.Y.Z
```
````

```bash
gh pr create --base "$DEFAULT_BRANCH" --head release/vX.Y.Z --title "Release vX.Y.Z" --body-file release-pr-body.md
```

### 10. Hand over to the person

Tell them:

> Release PR is open. New version: **vX.Y.Z**.
> After review and merge, create the tag on the merge commit yourself:
>
> ```bash
> git tag -a vX.Y.Z <merge-commit-sha> -m "vX.Y.Z"
> git push origin vX.Y.Z
> ```
>
> Then publish the GitHub Release from that tag, with the changelog section as notes - for example
> `gh release create vX.Y.Z --verify-tag --title vX.Y.Z --notes-file release-notes.md`.

## SemVer rules

Reference: https://semver.org/ - format `MAJOR.MINOR.PATCH`: MAJOR for incompatible API changes, MINOR for
backward-compatible features, PATCH for backward-compatible fixes.

**Breaking (MAJOR)** - anything that can give a consumer a compile error, runtime error or changed behaviour **without
them changing their own code**:

- removing or renaming a public function, class, method, constant or exported module path
- changing a signature (adding required parameters, removing parameters, changing parameter or return types)
- changing observable behaviour callers depend on (error types thrown, event names, shape of return values)
- changing a required configuration key or its accepted values
- dropping support for a runtime or language version that was supported

When the **code** shows a possible break and you are unsure, prefer MAJOR over MINOR: signalling a break is better
than silently breaking consumers.

**Feature (MINOR)**:

- a new public function, class, method or constant
- new optional parameters with backward-compatible defaults
- implementing a new interface that does not affect existing ones
- new configuration keys with sensible defaults
- deprecating (not removing) a public API - removal comes in a later MAJOR

**Fix (PATCH)**:

- fixing behaviour that was wrong relative to documented intent
- performance improvements without API change
- internal refactoring with no observable difference
- documentation; CI, test and tooling changes
- dependency updates that do not change the library's own public surface
- security fixes that do not break the API

**Edge cases**

| Situation | Recommendation |
|---|---|
| Current version is `0.x.y` | Anything may change; breaking changes usually bump MINOR. Once past `1.0.0`, apply the rules strictly. |
| First release (no tags) | Default to `1.0.0` and tell the person. |
| Only internal/private symbols changed | PATCH |
| Type annotation added to a previously untyped function | PATCH |
| Default value of an optional parameter changed | MAJOR if callers might rely on the old default |
| New required option inside an optional config block | MINOR if the block itself is optional, else MAJOR |
| A commit reverts an earlier commit | Follow the net diff, not the revert message |

## Classifying commit messages

Commit messages are a secondary signal: read the diff first; when a message contradicts the diff, trust the diff.

| Conventional Commits prefix | Category |
|---|---|
| `feat:` / `feat(scope):` | feat |
| `fix:` / `fix(scope):` | fix |
| `perf:` | perf |
| `refactor:` | refactor |
| `docs:` | docs |
| `test:` / `tests:` | test |
| `chore:`, `ci:`, `build:`, `style:` | chore |
| `revert:` | whatever was reverted |
| `!` after the type (`feat!:`) or `BREAKING CHANGE:` in the footer | breaking |

Free-form messages - look for:

- **Breaking:** "breaking", "incompatible", "remove", "rename", "drop support", "no longer", "was removed"
- **Feature:** starts with "add", "implement", "introduce", "support", "new"; contains "now supports", "can now"
- **Fix:** starts with "fix", "patch", "resolve", "correct", "handle"; contains "bug", "regression", "crash", "wrong"
- **Perf:** "speed up", "faster", "reduce memory", "optimize"
- **Refactor:** "refactor", "clean up", "reorganize", "restructure", "simplify", "extract"
- **Docs:** "docs", "readme", "comment", "example", "typo"
- **Chore:** "bump", "upgrade dependencies", "update deps", "ci", "lint"
- **Test:** "test", "spec", "coverage", "fixture"

Merge commits (`Merge pull request #42`) are usually noise: look at the PR title or the commits inside.

When you cannot tell from the message: default to PATCH for maintenance, MINOR if new functionality is mentioned, and
MAJOR only with explicit evidence - a commit message alone never justifies a breaking bump.

Category → changelog section: breaking + new behaviour → Changed · breaking + removal → Removed · feat → Added ·
fix, perf → Fixed · security → Security · refactor, docs, chore, test → omit unless user-visible (extracting an
internal helper into a new public export counts as Added).

## Error handling

| Situation | What to do |
|---|---|
| `gh auth status` fails | Stop; ask the person to run `gh auth login` |
| Not inside a git repository | Stop; ask the person to change into the repository |
| Working tree is dirty | Warn; ask whether to stash or abort |
| No commits since the last tag | Say there is nothing to release |
| Tag exists but points to no commit | Use the first commit as diff base; warn |
| Latest tag is local only | Warn; ask whether to push the tag first or continue |
| Diff of `PUBLIC_PATH` is empty but commits exist | Warn that all changes may be internal; ask whether to proceed |
| `git push` fails (for example branch protection) | Report the error verbatim; suggest checking branch protection rules |
| `gh` misbehaves in PowerShell (prints usage, splits a subcommand) | Check which `gh` runs (`Get-Command gh`); avoid nested substitutions; use the PowerShell snippets above |

## Limitations

- For single-package repositories. Monorepos with several independently versioned packages need one pass per package.
- Needs git tags to know the current version.
- Does not publish to a package registry; that stays with the project's own release pipeline.

---
Adapted from "GitHub Release Skill" by GitHub, Inc. (https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/skills/github-release/SKILL.md), MIT.
Changes: merged the two reference files into the skill, detect the default branch, bump version files, ask before pushing, trimmed duplicate PowerShell blocks. See SOURCE.md.
