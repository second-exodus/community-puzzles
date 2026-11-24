# Source

- Original: Security Standards (`instructions/security-and-owasp.instructions.md`), https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/instructions/security-and-owasp.instructions.md
- Repository: github/awesome-copilot, commit f10fdb8b2660ce85c98f220b2f1ca24653768a5c, read on 2026-11-24
- Author: contributors to github/awesome-copilot (file history: VamshiVerma, askpt, gonzafg2, CahidArda); copyright
  holder named in the licence: GitHub, Inc.
- Licence: MIT (full text in LICENSE; the `instructions/` folder has no licence of its own, so the repository licence
  applies)

## Changes

- Condensed 1,088 lines into about 330: the 76 numbered anti-patterns (I1-I8, AU1-AU8, AZ1-AZ6, S1-S6, H1-H8, FE1-FE8,
  D1-D5, AP1-AP6, AI1-AI3, L1-L4, RX1-RX4, NG1-NG3, EX1-EX4, GO1-GO3) became one-line rules grouped under the ten
  OWASP 2025 risks, each with its severity and, where the original had one, its detection pattern ("Find:").
- Merged duplicates (for example XSS in I4/FE1/NG1, error leaks in S6/AP5/EX4, body limits in AP6/EX2, token storage in
  AU3/FE6) and folded the framework-specific sections (React/Next.js, Angular, Express, Go) into the matching risk.
- Turned the final security checklist, the JWT checklist and the cookie-flag table into rules; dropped them as separate
  sections.
- Moved SUGGESTION-level items to "Should" and kept CRITICAL/IMPORTANT as `[critical]`/`[important]` under "Must".
- Kept the key code examples (SQL, command execution, SSRF, path traversal, ownership and mass assignment, JWT and
  password hashing, login rate limit, error handler, helmet headers, cookie), shortened; dropped the vendor-specific
  rate-limiter example in favour of a note about shared stores.
- Made the language-model rules more precise: role separation is described as reducing, not preventing, prompt
  injection, and the model must not get data or actions the user may not have.
- Added a few equivalents for other stacks (vulnerability audit commands for other ecosystems, `rejectUnauthorized`,
  `verify=False`), JWT `audience`/`issuer` in the example, two rules for A06 derived from the original's summary row,
  and a TLS rule for A04.
- Removed the tool-specific front matter (`applyTo`) and replaced it with the portable front matter and `status: draft`.
