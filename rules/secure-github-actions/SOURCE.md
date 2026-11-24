# Source

- Original: GitHub Actions Hardening (`skills/github-actions-hardening`), https://github.com/github/awesome-copilot/tree/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/skills/github-actions-hardening
  - https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/skills/github-actions-hardening/SKILL.md
  - `references/triggers-and-privilege.md`, `references/injection.md`, `references/permissions-and-tokens.md`,
    `references/supply-chain.md`, `references/report-format.md` in the same folder
- Also used (a few items in "Secrets and credentials" and "Should"): GitHub Actions CI/CD Best Practices, section
  "Security Best Practices in GitHub Actions", https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/instructions/github-actions-ci-cd-best-practices.instructions.md
- Repository: github/awesome-copilot, commit f10fdb8b2660ce85c98f220b2f1ca24653768a5c, read on 2026-11-24
- Author: contributors to github/awesome-copilot (the hardening skill was added by AmirhosseinHonardoust; the CI/CD
  instructions by VamshiVerma and others); copyright holder named in the licence: GitHub, Inc.
- Licence: MIT (full text in LICENSE; neither folder has a licence of its own, so the repository licence applies)

## Changes

- Converted a review skill (SKILL.md plus five reference files, about 550 lines) into a rules file with Must, Should
  and Examples; the seven review steps became the subsection "When reviewing a workflow".
- Kept the core insight on `${{ }}` expansion, the trust matrix as rules, the attacker-controlled context table, the
  two-workflow pattern, the least-privilege recipe, SHA pinning, OIDC, artifact, cache and self-hosted runner rules,
  the severity guide and the report format.
- Removed emojis from the severity labels and the report card; removed the "When to use" and "Reference files" lists.
- Added from the CI/CD best-practices file: environment secrets with required reviewers, no dynamically built secrets,
  dependency review, SAST and secret scanning, artifact and image signing.
- Added on our own: SHA pinning for reusable workflows and digest pinning for container images, a concrete
  random-delimiter example for `$GITHUB_OUTPUT`, `persist-credentials: false` in the two-workflow example, and
  `environment: production` in the OIDC example.
- Added `status: draft` and the portable front matter.
