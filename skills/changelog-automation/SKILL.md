---
name: changelog-automation
description: Sets up automatic changelog and release-notes generation from commits - Conventional Commits enforced at commit time, a generator that fits the stack (git-cliff, commitizen, semantic-release or commit-and-tag-version), a CI release job, and release notes written for humans in Keep a Changelog format. Triggered by "automate the changelog", "generate release notes", "set up semantic-release", "enforce conventional commits", "changelog from commits".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: [devops, docs]
category: release/notes
---

# Changelog Automation

## Goal

Every release gets an accurate changelog and readable release notes, without anyone copying commit logs by hand. Three
pieces make that work:

1. **Structured commits** - Conventional Commits, checked when the commit is made and again in CI.
2. **A generator** - turns those commits into a [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) file and
   computes the next [Semantic Versioning](https://semver.org/spec/v2.0.0.html) number.
3. **Human release notes** - a short summary, highlights, breaking changes with an upgrade guide, and known issues,
   on top of the generated list.

Use this skill to set up that pipeline, to standardise commit messages, or to write the notes for a single release.

## Steps

1. **Look at what exists.** Read `CHANGELOG.md` (format, heading style, how far back it goes), the tag format
   (`git tag --sort=-version:refname | head -5`), the recent commit style (`git log --oneline -50`), the package
   manager and version file, the CI system, and how releases happen today (manual tag, registry publish, nothing).
2. **If only one release needs notes, do it by hand and stop here.** Collect the commits
   (`git log <previous-tag>..HEAD --no-merges --format='%h %s'`), group them by type with the table in "Formats",
   rewrite each entry for users, and fill the release-notes template. Skip the remaining steps.
3. **Pick the level of automation with the person** (see "Choosing a tool"): generate the changelog only, bump and
   tag on command, or release fully automatically on merge. Prefer a tool that matches the project's language and
   anything already installed.
4. **Agree on the commit convention.** Use the type table below; write the allowed types and scopes into the
   contributing guide so humans and AI assistants follow the same rule.
5. **Enforce it.** Add a commit-message hook (commitlint + husky for Node, `cz check` for Python) and the same check in
   CI. If the project squash-merges pull requests, check the **PR title** instead - it becomes the commit message.
6. **Configure the generator** with one of the setups under "Tool setups". Keep generated sections in Keep a Changelog
   order and skip release commits (`chore(release): …`).
7. **Wire it into CI** (see "CI release workflow"): full history (`fetch-depth: 0`), write permission for tags and
   releases, tokens from the CI secret store - never in the repository.
8. **Dry-run before the first real release.** Run the generator in preview mode, compare the output with the
   commits since the last tag, and show the person the result. Fix the config, not the generated text.
9. **Write the human part of the release notes** with the templates below: summary, highlights, breaking changes and
   upgrade guide, known issues, notable dependency updates.

## Formats

### Keep a Changelog

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature X

## [1.2.0] - 2024-01-15

### Added
- User profile avatars
- Dark mode support

### Changed
- Improved loading performance by 40%

### Deprecated
- Old authentication API (use v2)

### Removed
- Legacy payment gateway

### Fixed
- Login timeout issue (#123)

### Security
- Updated dependencies for CVE-2024-1234

[Unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

### Conventional Commits

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

| Type | Meaning | Changelog section |
|------|---------|-------------------|
| `feat` | New feature | Added |
| `fix` | Bug fix | Fixed |
| `perf` | Performance | Changed |
| `refactor` | Code restructure | Changed if users notice it, else excluded |
| `revert` | Revert a commit | Removed (drop both entries if the reverted change was never released) |
| `docs` | Documentation | usually excluded |
| `style` | Formatting | usually excluded |
| `test` | Tests | usually excluded |
| `chore` | Maintenance | usually excluded |
| `ci` | CI changes | usually excluded |
| `build` | Build system | usually excluded |

Deprecated and Security have no standard type: route them by scope (`fix(security): …`) or a footer, or add them in
the release notes by hand.

### Semantic Versioning

`MAJOR.MINOR.PATCH`: a breaking change (`feat!:` or a `BREAKING CHANGE:` footer) bumps MAJOR, `feat` bumps MINOR,
`fix` bumps PATCH. Other types do not bump the version on their own.

## Choosing a tool

| You want | Node / JavaScript | Python | Any language |
|----------|-------------------|--------|--------------|
| Changelog file only, humans release | conventional-changelog | commitizen (`cz changelog`) | git-cliff |
| Bump + changelog + tag on command | commit-and-tag-version | commitizen (`cz bump`) | git-cliff `--bump` + a tag |
| Fully automatic release on merge | semantic-release | python-semantic-release | semantic-release (with plugins) |

`standard-version` is deprecated; `commit-and-tag-version` is its maintained fork and reads the same `.versionrc`
configuration.

## Tool setups

### Enforce commits in Node: commitlint + husky

```bash
npm install -D @commitlint/cli @commitlint/config-conventional husky

cat > commitlint.config.js << 'EOF'
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build', 'revert',
    ]],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'subject-max-length': [2, 'always', 72],
  },
};
EOF

npx husky init
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
```

In CI, check the range of the pull request: `npx commitlint --from origin/main --to HEAD --verbose`.

### Bump on command: commit-and-tag-version

```javascript
// .versionrc.js
module.exports = {
  types: [
    { type: "feat", section: "Features" },
    { type: "fix", section: "Bug Fixes" },
    { type: "perf", section: "Performance Improvements" },
    { type: "revert", section: "Reverts" },
    { type: "docs", section: "Documentation", hidden: true },
    { type: "style", section: "Styles", hidden: true },
    { type: "chore", section: "Miscellaneous", hidden: true },
    { type: "refactor", section: "Code Refactoring", hidden: true },
    { type: "test", section: "Tests", hidden: true },
    { type: "build", section: "Build System", hidden: true },
    { type: "ci", section: "CI/CD", hidden: true },
  ],
  commitUrlFormat: "{{host}}/{{owner}}/{{repository}}/commit/{{hash}}",
  compareUrlFormat: "{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}",
  issueUrlFormat: "{{host}}/{{owner}}/{{repository}}/issues/{{id}}",
  userUrlFormat: "{{host}}/{{user}}",
  releaseCommitMessageFormat: "chore(release): {{currentTag}}",
};
```

```json
{
  "scripts": {
    "release": "commit-and-tag-version",
    "release:minor": "commit-and-tag-version --release-as minor",
    "release:major": "commit-and-tag-version --release-as major",
    "release:patch": "commit-and-tag-version --release-as patch",
    "release:dry": "commit-and-tag-version --dry-run"
  }
}
```

After a release: `git push --follow-tags origin main`.

### Fully automatic: semantic-release

```bash
npm install -D semantic-release @semantic-release/changelog @semantic-release/git
```

```javascript
// release.config.js
module.exports = {
  branches: [
    "main",
    { name: "beta", prerelease: true },
    { name: "alpha", prerelease: true },
  ],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    ["@semantic-release/npm", { npmPublish: true }],
    ["@semantic-release/github", { assets: ["dist/**/*.js", "dist/**/*.css"] }],
    ["@semantic-release/git", {
      assets: ["CHANGELOG.md", "package.json"],
      message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
    }],
  ],
};
```

`@semantic-release/git` pushes a commit back to the release branch; the CI token needs permission to push there
(branch protection may block it). Without that plugin, the changelog lives only in the release notes.

### Any language: git-cliff

```toml
# cliff.toml (git-cliff 2.x)
[remote.github]
owner = "OWNER"
repo = "REPO"

[changelog]
header = """
# Changelog

All notable changes to this project will be documented in this file.

"""
body = """
{% if version %}\
## [{{ version | trim_start_matches(pat="v") }}] - {{ timestamp | date(format="%Y-%m-%d") }}
{% else %}\
## [Unreleased]
{% endif %}\
{% for group, commits in commits | group_by(attribute="group") %}
### {{ group }}
{% for commit in commits %}
- {% if commit.breaking %}**BREAKING** {% endif %}\
{% if commit.scope %}**{{ commit.scope }}:** {% endif %}\
{{ commit.message | upper_first }}\
{% if commit.remote.pr_number %} ([#{{ commit.remote.pr_number }}](https://github.com/{{ remote.github.owner }}/{{ remote.github.repo }}/pull/{{ commit.remote.pr_number }})){% endif %}
{% endfor %}
{% endfor %}
"""
trim = true

[git]
conventional_commits = true
filter_unconventional = true
commit_parsers = [
  { message = "^chore\\(release\\)", skip = true },
  { message = "^fix\\(security\\)", group = "Security" },
  { message = "^feat", group = "Added" },
  { message = "^fix", group = "Fixed" },
  { message = "^perf", group = "Changed" },
  { message = "^revert", group = "Removed" },
  { message = "^(docs|style|test|chore|ci|build|refactor)", skip = true },
]
tag_pattern = "v[0-9].*"
sort_commits = "oldest"
```

```bash
git cliff --unreleased                     # preview the next release (prints, writes nothing)
git cliff --bumped-version                 # next version computed from the commits
git cliff --bump -o CHANGELOG.md           # write the whole changelog with the bumped version
git cliff --latest --strip header -o RELEASE_NOTES.md   # notes for the latest tag only
git cliff v1.0.0..v2.0.0 -o RELEASE_NOTES.md            # notes for a range
```

The first matching parser wins, so specific rules (security) come before general ones (fix).

### Python: commitizen

```toml
# pyproject.toml
[tool.commitizen]
name = "cz_conventional_commits"
version = "1.0.0"
version_files = [
  "pyproject.toml:version",
  "src/__init__.py:__version__",
]
tag_format = "v$version"
update_changelog_on_bump = true
changelog_incremental = true
changelog_start_rev = "v0.1.0"
```

```bash
pip install commitizen
cz commit                          # guided commit message
cz bump --dry-run                  # preview the next version and changelog
cz bump                            # bump version, update changelog, tag
cz check --rev-range HEAD~5..HEAD  # validate commit messages (also in CI)
```

## CI release workflow

Example for GitHub Actions; the same steps apply to any CI. Use the current major versions of the actions.

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      release_type:
        description: "Release type"
        required: true
        default: "patch"
        type: choice
        options: [patch, minor, major]

permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  # Automatic: every push to main
  release:
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v7
        with:
          node-version: lts/*
          cache: npm
      - run: npm ci
      - name: Run semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release

  # Manual alternative: bump with commit-and-tag-version when someone starts the workflow
  manual-release:
    if: github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v7
        with:
          node-version: lts/*
      - run: npm ci
      - name: Configure git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
      - name: Bump version and update changelog
        run: npx commit-and-tag-version --release-as ${{ inputs.release_type }}
      - name: Push commit and tag
        run: git push --follow-tags origin main
      - name: Create release
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          TAG=$(git describe --tags --abbrev=0)
          gh release create "$TAG" --title "$TAG" --generate-notes
```

Pick **one** of the two jobs for a project; they are shown together only for comparison.

## Release notes templates

### Public release (for example on a GitHub release page)

```markdown
## What's Changed

### Features
- <PR title> by <author> in #<PR>

### Bug Fixes
- <PR title> by <author> in #<PR>

### Documentation and Maintenance
- <PR title> by <author> in #<PR>

## New Contributors
- <username> made their first contribution in #<PR>

**Full Changelog**: https://github.com/owner/repo/compare/v<previous>...v<current>
```

### Release notes for people (internal or product)

```markdown
# Release v2.1.0 - 2024-01-15

## Summary
This release introduces dark mode and makes checkout 40% faster. It also includes important security updates.

## Highlights

### Dark mode
Users can now switch to dark mode in settings. The preference is saved and synced across devices.

### Performance
- Checkout flow is 40% faster
- Bundle size reduced by 15%

## Breaking Changes
None in this release.

## Upgrade Guide
No special steps required. The standard deployment process applies.

## Known Issues
- Dark mode may flicker on first load (fix planned for v2.1.1)

## Dependencies Updated

| Package | From    | To      | Reason                   |
| ------- | ------- | ------- | ------------------------ |
| react   | 18.2.0  | 18.3.0  | Performance improvements |
| lodash  | 4.17.20 | 4.17.21 | Security patch           |
```

## Commit message examples

```bash
# Feature with scope
feat(auth): add OAuth2 support for Google login

# Bug fix with issue reference
fix(checkout): resolve race condition in payment processing

Closes #123

# Breaking change
feat(api)!: change user endpoint response format

BREAKING CHANGE: The user endpoint now returns `userId` instead of `id`.
Migration guide: update all API consumers to use the new field name.

# Body with several paragraphs and trailers
fix(database): handle connection timeouts gracefully

Previously, connection timeouts made the whole request fail without retry.
This change adds exponential backoff with up to 3 retries before failing.

The timeout threshold rises from 5s to 10s, based on p99 latency analysis.

Fixes #456
Reviewed-by: Alice Example <alice@example.com>
```

## Rules

Do:

- **Follow Conventional Commits** - it is what makes automation possible.
- **Write clear messages** - the description becomes a changelog line; write it for users.
- **Reference issues** - link commits to tickets (`Closes #123`).
- **Use scopes consistently** - agree on a list (for example `auth`, `api`, `ui`).
- **Automate releases** - fewer manual steps, fewer mistakes.

Don't:

- **Mix changes** - one logical change per commit, so each lands in the right section.
- **Skip validation** - check messages in the hook and in CI.
- **Hand-edit generated entries** - fix the commit message source or the generator config, or the next run
  overwrites your fix. Human text (summary, highlights, upgrade guide) belongs in the release notes.
- **Forget breaking changes** - mark them with `!` or a `BREAKING CHANGE:` footer, and write the upgrade guide.
- **Ignore CI** - a release job that fails silently ships nothing.

---
Adapted from "Changelog Automation" by Seth Hobson (https://github.com/wshobson/agents/blob/c96b5f6552dba32e4492307493ee613581430715/plugins/documentation-generation/skills/changelog-automation/SKILL.md), MIT.
Changes: restructured into Goal/Steps, rejoined the split reference file, replaced deprecated standard-version, fixed the CI workflow and updated configs to current tool versions. See SOURCE.md.
