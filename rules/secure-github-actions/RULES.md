---
name: "Secure GitHub Actions workflows"
description: Rules for writing and reviewing GitHub Actions workflows safely - privileged triggers that run fork code, script injection through ${{ }} expressions, least-privilege tokens, SHA-pinned actions, secrets, artifacts, caches and self-hosted runners - plus a severity guide and report format for reviews. Apply to every file in .github/workflows/.
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: devops
category: pipeline/ci
---

# Secure GitHub Actions workflows

Workflow risks are invisible to language linters because the dangerous code is the YAML itself. The key mechanism:
**`${{ <expr> }}` is expanded into the script before the shell runs.** A step like

```yaml
- run: echo "Title: ${{ github.event.issue.title }}"
```

does not pass a variable; it pastes attacker-controlled text into a shell command. An issue titled
`"; <attacker-command> #` is executed. Treat every `${{ }}` that an outside contributor can influence as a
code-injection sink.

Apply these rules when you write, change or review anything under `.github/workflows/`, and when a request mentions
`pull_request_target`, `workflow_run`, token permissions, pinning actions, CI secrets, OIDC or self-hosted runners.

## Must

### Triggers and untrusted code

- Treat `pull_request_target`, `workflow_run`, `issue_comment` and `issues` as privileged: they run in the base
  repository's context with a read/write token and access to secrets, yet outside contributors can trigger them.
- Know the safe default: `pull_request` from a fork runs with a read-only token and no secrets. Running untrusted code
  there is safe by design.
- In a privileged workflow, never check out the pull request's code (`ref: ${{ github.event.pull_request.head.sha }}`,
  `head.ref`) and then build, test, install or run it. `npm install` alone runs the PR's lifecycle scripts. That is
  remote code execution with a write token and every secret [critical].
- When untrusted code must run and a privileged action must follow (comment, label, deploy preview), split it into two
  workflows: an unprivileged `pull_request` workflow runs the code and uploads results; a privileged `workflow_run`
  workflow downloads them and uses them as data only.
- Never switch from `pull_request` to `pull_request_target` to "fix" missing secrets on fork PRs.
- Labelling, commenting or triaging from event metadata on a privileged trigger is fine as long as the contributor's
  code never runs.

### Script injection

- Never put an outsider-controllable `${{ }}` expression into a `run:` script, into the `script:` body of
  `actions/github-script`, or into an action input that the action passes to a shell [critical on privileged triggers,
  high otherwise].
- Treat these contexts as attacker-controlled:

  | Context | Set by |
  | --- | --- |
  | `github.event.issue.title` / `.body` | issue author |
  | `github.event.pull_request.title` / `.body` | PR author |
  | `github.event.pull_request.head.ref` / `.head.label`, `github.head_ref` | PR author (branch name) |
  | `github.event.comment.body`, `github.event.review.body`, `github.event.review_comment.body` | commenter, reviewer |
  | `github.event.commits.*.message`, `github.event.head_commit.message` | commit author |
  | `github.event.commits.*.author.email` / `.name` | commit author |
  | `github.event.pages.*.page_name` | wiki editor |

- Pass such values through `env:` and use the quoted shell variable (`"$PR_TITLE"`). In `actions/github-script`, read
  `process.env.NAME` instead of interpolating.
- For inputs to composite or JavaScript actions, pass untrusted values via `env:` unless you know the action never hands
  them to a shell; validate where a strict format exists (a branch name should match `^[A-Za-z0-9._/-]+$`).
- Never write untrusted data raw to `$GITHUB_ENV` or `$GITHUB_OUTPUT`. For multi-line values use the heredoc form with
  a random delimiter, so the value cannot inject further variables or outputs.

### Permissions

- Every workflow declares `permissions:`. Without it, the workflow inherits the repository or organisation default,
  which may be read/write for most scopes [medium].
- Set a restrictive top-level default (`permissions: {}` or `contents: read`) and grant write scopes per job, only where
  a step needs them (for example `pull-requests: write` only on the job that comments).
- Never use `permissions: write-all`, and drop any `write` scope the job's steps do not use [high].
- Move a top-level `write` scope down to the one job that needs it [medium].
- Grant `id-token: write` only to jobs that request an OIDC token.

### Actions and supply chain

- Pin every third-party action (anything outside `actions/*` and `github/*`) to a full 40-character commit SHA, with
  the version in a trailing comment: `uses: some-org/some-action@<sha> # v3.2.1`. Tags and branches are mutable; a
  compromised upstream can repoint them [high].
- Never reference an action by branch (`@main`, `@master`), whatever the publisher [high].
- Pin first-party `actions/*` to SHAs as well; that is the hardened default [low if only tag-pinned].
- Keep pins current with an automated updater for the `github-actions` ecosystem (for example Dependabot), so updates
  arrive as reviewable pull requests.
- Apply the same pinning to reusable workflows (`uses: owner/repo/.github/workflows/file.yml@<sha>`) and pin container
  images by digest (`@sha256:...`).

### Secrets and credentials

- Never echo, print or log a secret, and never enable shell tracing (`set -x`, `bash -x`) in a step that handles one.
- Never build secrets dynamically from parts; masking then fails.
- Expose a secret only to the job and step that need it (step-level `env:`), never to steps that run untrusted code or
  to third-party actions you have not pinned and reviewed.
- Set `persist-credentials: false` on `actions/checkout` unless the job must push, and always before running untrusted
  code; otherwise the token sits in `.git/config` for that code to read.
- Prefer OIDC over long-lived cloud keys stored as secrets. On the cloud side, scope the trust policy to the repository
  and a specific branch or environment so forks and other repositories cannot assume the role.
- Put production secrets in a protected environment with required reviewers or branch rules.

### Artifacts, caches and runners

- Treat artifacts from untrusted `pull_request` runs as untrusted data. A privileged `workflow_run` may download them
  but must never execute them, and must validate paths when extracting (crafted archives can contain `../` entries).
- Do not trust cache contents in a privileged job; less-privileged runs can populate caches.
- Never run workflows that public forks can trigger on self-hosted runners: those persist between jobs and can leave
  backdoors, read other checkouts or pivot into your network. If unavoidable, use ephemeral, isolated, single-use
  runners and give fork-triggered jobs no secrets.

### When reviewing a workflow

- Work in this order: triggers and trust level, injection sinks, privileged triggers running untrusted code,
  `permissions:`, action references, secret and output handling.
- Start the report with a summary table of findings by severity. If nothing is found, write "No issues found. Checked:
  triggers, injection sinks, permissions, action pinning, secret handling."
- Group findings by issue type, not by file. For each: severity, title, file and line, trigger, the exact offending
  YAML quoted, the risk in plain words (what an attacker actually does), a before/after fix, and confidence
  (high/medium/low).
- Give every critical and high finding a concrete corrected snippet that keeps the author's indentation, step names and
  structure, changing only what fixes the issue.
- Use this severity guide:

  | Severity | Meaning | Example |
  | --- | --- | --- |
  | critical | Token or secret theft, or code execution, reachable by an outside contributor | `pull_request_target` checking out and running fork code; outsider `${{ }}` in `run:` on a privileged trigger |
  | high | Exploitable supply-chain or scope problem | Third-party action on a tag or branch; `write-all`; injection sink on `issue_comment` |
  | medium | Risk under conditions or chaining | No `permissions:` block; secret reachable by a same-repo PR author |
  | low | Hardening gap with low direct risk | First-party action not SHA-pinned; default `persist-credentials` on an unprivileged job |
  | info | Observation, not a vulnerability | Version comment missing next to a pinned SHA |

- Do not call a fork `pull_request` dangerous just because it runs untrusted code; it has no secrets and a read-only
  token. Reserve critical for privileged triggers.
- If the workflow is already hardened, say so and list what you checked.
- Never apply changes on your own during a review. End with: "Review each change before committing. Nothing has been
  modified."

## Should

- Rewrite even server-controlled values (`github.sha`, `github.ref`, `github.repository`) through `env:`; it costs
  nothing and keeps the pattern uniform.
- Add dependency review and static analysis (SAST) as required checks on pull requests, and enable secret scanning
  plus a pre-commit secret scanner.
- Sign release artifacts and container images and verify the signature before deployment.

## Examples

Script injection, vulnerable and safe:

```yaml
# VULNERABLE
- run: |
    echo "Reviewing PR: ${{ github.event.pull_request.title }}"
    git checkout ${{ github.head_ref }}

# SAFE: values arrive as environment variables, quoted in the shell
- env:
    PR_TITLE: ${{ github.event.pull_request.title }}
    HEAD_REF: ${{ github.head_ref }}
  run: |
    echo "Reviewing PR: $PR_TITLE"
    git checkout "$HEAD_REF"
```

`actions/github-script`:

```yaml
# VULNERABLE
- uses: actions/github-script@<sha> # vX.Y.Z
  with:
    script: console.log("${{ github.event.issue.title }}")

# SAFE
- uses: actions/github-script@<sha> # vX.Y.Z
  env:
    TITLE: ${{ github.event.issue.title }}
  with:
    script: console.log(process.env.TITLE)
```

Multi-line output with a random delimiter:

```yaml
- env:
    BODY: ${{ github.event.issue.body }}
  run: |
    delimiter="EOF_$(openssl rand -hex 16)"
    { echo "body<<$delimiter"; printf '%s\n' "$BODY"; echo "$delimiter"; } >> "$GITHUB_OUTPUT"
```

Dangerous privileged trigger:

```yaml
# DANGEROUS: remote code execution with a write token and secrets
on: pull_request_target
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha> # vX.Y.Z
        with:
          ref: ${{ github.event.pull_request.head.sha }}   # the fork's code
      - run: npm install && npm test                        # runs the fork's code and scripts
```

The safe two-workflow split:

```yaml
# 1) Unprivileged: runs untrusted code, read-only token, no secrets
name: PR Build
on: pull_request
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@<sha> # vX.Y.Z
        with:
          persist-credentials: false
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@<sha> # vX.Y.Z
        with: { name: pr, path: dist/ }
```

```yaml
# 2) Privileged: triggered by the first, never runs fork code
name: PR Comment
on:
  workflow_run:
    workflows: ["PR Build"]
    types: [completed]
permissions:
  pull-requests: write
jobs:
  comment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@<sha> # vX.Y.Z   data only, never executed
      # post results with the token, but never execute the artifact
```

Least privilege:

```yaml
permissions: {}            # deny by default

jobs:
  build:
    permissions:
      contents: read       # checkout only
    runs-on: ubuntu-latest
    steps: [...]
  comment:
    permissions:
      contents: read
      pull-requests: write # this job posts a comment; nothing else
    runs-on: ubuntu-latest
    steps: [...]
```

SHA pinning and automatic updates:

```yaml
# Mutable: the tag can be moved to malicious code
- uses: some-org/some-action@v3
# Pinned: this exact tree
- uses: some-org/some-action@3f1e0a9c8b7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f # v3.2.1
```

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

OIDC instead of stored cloud keys:

```yaml
permissions:
  id-token: write   # required to request the OIDC token
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: aws-actions/configure-aws-credentials@<sha> # vX.Y.Z
        with:
          role-to-assume: arn:aws:iam::123456789012:role/my-ci-role
          aws-region: us-east-1
      # no AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY secrets needed
```

A review finding:

```text
### CRITICAL - Script injection via PR title on a privileged trigger

File: .github/workflows/triage.yml (line 14)
Trigger: pull_request_target

Offending code:
    - run: echo "New PR: ${{ github.event.pull_request.title }}"

Risk: pull_request_target runs with a read/write token and repository secrets. Anyone can open a PR titled
  "; <attacker-command> #  which runs as shell, so they can steal secrets and push with the workflow token.

Fix:
    - env:
        PR_TITLE: ${{ github.event.pull_request.title }}
      run: echo "New PR: $PR_TITLE"

Confidence: High
```

---
Adapted from GitHub Actions Hardening (skills/github-actions-hardening) by contributors to github/awesome-copilot, copyright GitHub, Inc. (https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/skills/github-actions-hardening/SKILL.md), MIT, with a few items from GitHub Actions CI/CD Best Practices in the same repository.
Changes: turned the review skill and its five reference files into Must/Should rules with examples, kept the severity guide and report format, added reusable-workflow and digest pinning, random-delimiter output, environment secrets and scanning items. See SOURCE.md.
