> Illustration only: a failure report this skill produces for a fictional pull request.

## CI failure report - PR #318 (feat/export-csv, 9c41d2e)

### test (ubuntu-latest, 3.12) - CI - failed
- Run: https://github.com/example-org/ledger/actions/runs/14822937011 (job 41588120934)
- Kind: code/test
- Cause: the new CSV export writes dates with the local timezone. The runner uses UTC, so the expected
  `2026-03-01` becomes `2026-02-28` for a timestamp stored at 23:30 the day before. First error in the step:
  ```
  tests/test_export.py::test_export_dates FAILED
  >       assert rows[1]["date"] == "2026-03-01"
  E       AssertionError: assert '2026-02-28' == '2026-03-01'
  src/ledger/export.py:42: in to_row
      "date": entry.created_at.astimezone().date().isoformat(),
  ```
- The same test passes locally on a machine set to Europe/Berlin; with `TZ=UTC pytest tests/test_export.py` it fails
  the same way, so it is not flaky.

### lint - CI - failed
- Run: https://github.com/example-org/ledger/actions/runs/14822937011 (job 41588120877)
- Kind: code/test
- Cause: `ruff` reports `F401 'datetime.timezone' imported but unused` in `src/ledger/export.py:3`.

### deploy-preview - external (Buildkite)
- Details: https://buildkite.com/example-org/ledger/builds/2291 - not investigated (outside GitHub Actions)

### Plan (waiting for your approval)
1. In `src/ledger/export.py`, convert `created_at` with the ledger's configured timezone instead of the machine's
   local one, and use the `timezone` import that is now unused.
2. Add a test case for a timestamp at 23:30 UTC to `tests/test_export.py`.
3. Verify locally with `TZ=UTC pytest tests/test_export.py` and `ruff check src`.
4. Push and watch the checks with `gh pr checks 318 --watch`.

Shall I implement this?
