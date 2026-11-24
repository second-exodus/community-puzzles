> Illustration only: the version proposal and changelog draft this skill shows for a fictional HTTP client library.

**Proposed version: v2.1.0** (previous tag `v2.0.3`, 14 commits)

- `src/client.go` adds two exported functions, `NewClient` and `WithTimeout` → MINOR.
- `src/retry.go` fixes an off-by-one in the retry counter (3 retries were configured, 4 were made) → PATCH.
- No public symbol was removed or changed its signature.
- Signal conflict to check: commit `a1c9e2f` says `chore: cleanup`, but the diff deprecates `Client.Do` with a
  doc comment. I listed it under Deprecated.

Does this version look right, or do you want to adjust it?

---

Proposed `CHANGELOG.md` section:

```markdown
## [2.1.0] - 2026-11-24

### Added
- `NewClient` constructor that accepts functional options.
- `WithTimeout` option to set a per-request timeout on the HTTP client.

### Deprecated
- `Client.Do` - use `Client.Send`, which honours the timeout option. `Client.Do` will be removed in 3.0.0.

### Fixed
- The client retried one time more than configured.

[2.1.0]: https://github.com/example-org/httpclient/compare/v2.0.3...v2.1.0
```

Is this changelog accurate? Anything to add, remove or reword?
