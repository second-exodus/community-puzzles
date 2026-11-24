---
name: differential-security-review
description: Security-focused review of a code change (pull request, commit range or diff). Risk-scores every changed file, uses git history to catch removed safeguards and re-introduced bugs, counts callers to size the blast radius, flags untested changes, models attackers for high-risk changes and writes a markdown report. Triggered by "security review this PR", "differential review", "is this diff safe", "what else could this change break", "did this re-introduce a fixed bug".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: dev
category: review/security
---

# Differential Security Review

## Goal

Find the security problems a change introduces, compared with its baseline, and prove each one with evidence. The
review ends with a written report the team can act on.

Core principles:

1. **Risk first.** Focus on authentication, authorisation, cryptography, value transfer, external calls and removed
   validation.
2. **Evidence-based.** Back every finding with git history, file and line references and a concrete attack scenario.
3. **Adaptive.** Scale the depth to the size of the codebase (SMALL, MEDIUM, LARGE).
4. **Honest.** State the coverage limits and your confidence explicitly.
5. **Output-driven.** Always write a markdown report file.

Use it to review a pull request, a commit range or a diff for vulnerabilities. Use it to check whether a change
re-introduces a bug that was fixed before, to ask what else a change could break, or to find modified code that no
test covers.

**Do not use it** for greenfield code with no baseline, for documentation-only or formatting-only changes, or when
the user explicitly asks for a quick summary only and accepts the risk. Use a normal code review there.

## Steps

You need the **baseline** (base branch or commit) and the **head** (the change). For a pull request, fetch its branch
and use the merge base with the target branch as the baseline: `git merge-base <target> <head>`.

1. **Build baseline context (pre-analysis).** Before looking at the diff, understand what the code was *supposed*
   to do. Read the baseline version without disturbing the working copy: use `git show <base>:path/to/file`, or check
   the baseline out into a separate worktree (`git worktree add ../baseline <base>`). Capture and keep for later:
   - system-wide invariants (what must ALWAYS be true);
   - trust boundaries and privilege levels (who can do what);
   - validation patterns (what is checked where; defence in depth);
   - call graphs of critical functions (who calls what);
   - state flows (how state changes);
   - external dependencies and trust assumptions.

   This shows the implicit security assumptions, which patterns are system-wide and which are local, and when a
   change breaks one of them.

2. **Intake and triage (phase 0).** Extract the change and score its risk:

   ```bash
   git diff <base>..<head> --stat
   git log <base>..<head> --oneline
   git diff <base>..<head> --name-only
   git ls-files | wc -l        # size of the codebase (narrow it to source files, e.g. '*.ts' '*.go' '*.sol')
   ```

   Pick the strategy by codebase size and risk-score every changed file (see "Quick reference"). Classify by
   **risk**, never by the size of the diff.

3. **Analyse the changed code (phase 1).** For every changed file:
   1. Read both versions, baseline and changed.
   2. Write down each diff region:
      ```
      BEFORE:   [exact code]
      AFTER:    [exact code]
      CHANGE:   [behavioural impact]
      SECURITY: [implications]
      ```
   3. Run git history on **removed** code. When was it added, and why?
      ```bash
      git log -S "removed_code" --all --oneline
      git blame <base> -- path/to/file | grep "pattern"
      ```
      Code removed that came from a "fix", "security" or "CVE" commit is CRITICAL. Code added recently (under a
      month) and now removed is HIGH.
   4. Check **added** code for regressions: `git log -S "added_code" --all -p`. Code that was added, removed for
      security and is now re-added is a REGRESSION.
   5. Ask the micro-adversarial questions for each change. What attack did the removed code prevent? What new
      surface does the new code expose? Can the modified logic be bypassed? Are checks weaker? Are edge cases
      covered?
   6. Write a concrete attack scenario for anything suspicious:
      ```
      SCENARIO:      [attack goal]
      PRECONDITIONS: [required state]
      STEPS:         1. [specific action]  2. [expected outcome]  3. [exploitation]
      WHY IT WORKS:  [reference to the code change]
      IMPACT:        [severity + scope]
      ```

4. **Check test coverage (phase 2).** Separate production changes from test changes and look for tests of every
   changed function:

   ```bash
   git diff <base>..<head> --name-only | grep -v test     # production code
   git diff <base>..<head> --name-only | grep test        # tests
   grep -rn "functionName" <test-dirs>                    # tests for a changed function
   ```

   Raise the risk:
   - a NEW function with NO tests goes from MEDIUM to HIGH;
   - MODIFIED validation with UNCHANGED tests is HIGH;
   - complex logic (more than 20 lines) with NO tests is HIGH.

5. **Calculate the blast radius (phase 3).** Count the callers of every modified function, including indirect ones:
   `grep -rn "functionName(" --include="*.<ext>" . | wc -l`. Classify the count and combine it with the risk in the
   priority matrix (see "Quick reference"). Calculate it; do not guess it.

6. **Analyse deep context for HIGH-risk changes (phase 4).** For each HIGH-risk changed function:
   - **Function flow:** entry conditions (preconditions, guards, modifiers, middleware), state read, state written,
     external calls (other contracts, APIs, the system), return values and side effects.
   - **Internal calls:** list every function called, map their flows recursively, build the call graph.
   - **External calls:** which trust boundaries are crossed, what is assumed about the other side, any re-entry
     risk.
   - **Invariants:** what must ALWAYS be true, what must NEVER happen, and do they still hold after the change?
   - **Five whys:** why was this code changed? Why did the original code exist? Why might this break? Why this
     approach? Why could this fail in production?
   - **Cross-cutting patterns:** search for validation repeated across the codebase (for example
     `grep -rn "amount > 0"`, `grep -rn "onlyOwner"`, your auth decorator or middleware) and check whether the diff
     removes one of them: `git diff <base>..<head> | grep "^-.*<pattern>"`. Flag it if the removal breaks defence in
     depth.

7. **Model the attacker for HIGH-risk changes (phase 5).** Follow "Adversarial analysis" below. You can hand this
   phase to a second assistant session or to a security reviewer. Give them the diff, the baseline context and the
   list of HIGH-risk changes, and ask for the five adversarial steps.

8. **Write the report (phase 6).** Use the template under "Report". Save it as a file in the project's working
   directory, or where the user asks: `<PROJECT>_DIFFERENTIAL_REVIEW_<YYYY-MM-DD>.md`. If writing the file fails,
   put the full report in the chat and ask the user to save it. Then tell the user: file name and location, number
   of findings by severity, the recommendation and your confidence.

## Quick reference

| Codebase size | Strategy | Approach |
|---------------|----------|----------|
| SMALL (under 20 files) | DEEP | Read all dependencies, full git blame |
| MEDIUM (20 to 200 files) | FOCUSED | Dependencies one hop away, priority files |
| LARGE (over 200 files) | SURGICAL | Critical paths only |

| Risk level | Triggers |
|------------|----------|
| HIGH | Auth, crypto, external calls, value transfer, validation removal |
| MEDIUM | Business logic, state changes, new public APIs |
| LOW | Comments, tests, UI, logging |

| Callers of a modified function | Blast radius |
|--------------------------------|--------------|
| 1 to 5 | LOW |
| 6 to 20 | MEDIUM |
| 21 to 50 | HIGH |
| more than 50 | CRITICAL |

| Change risk | Blast radius | Priority | Analysis depth |
|-------------|--------------|----------|----------------|
| HIGH | CRITICAL | P0 | Deep + all dependencies |
| HIGH | HIGH or MEDIUM | P1 | Deep |
| HIGH | LOW | P2 | Standard |
| MEDIUM | CRITICAL or HIGH | P1 | Standard + callers |

Typical scopes: in a small pull request, analyse only the HIGH-risk files in depth, run git blame on removed code and
write a short report. In a medium codebase, run the full workflow on HIGH-risk files, scan MEDIUM, skip LOW and write
the full report. For a large, critical change (for example an auth rewrite), build the baseline context first and go
deep on the critical changes only, with blast radius and adversarial modelling.

## Rationalisations (do not skip)

| Rationalisation | Why it's wrong | Required action |
|-----------------|----------------|-----------------|
| "Small PR, quick review" | Heartbleed was 2 lines | Classify by RISK, not size |
| "I know this codebase" | Familiarity breeds blind spots | Build explicit baseline context |
| "Git history takes too long" | History reveals regressions | Never skip phase 1 |
| "Blast radius is obvious" | You'll miss indirect callers | Calculate it |
| "No tests = not my problem" | Missing tests = higher risk | Flag it in the report, raise the severity |
| "Just a refactor, no security impact" | Refactors break invariants | Treat it as HIGH until proven LOW |
| "I'll explain verbally" | No artefact = findings lost | Always write the report |

## Red flags (stop and investigate)

These need adversarial analysis even in a quick triage:

- removed code from "security", "CVE" or "fix" commits;
- access control removed or relaxed (a guard such as `onlyOwner` deleted, an auth decorator or middleware
  dropped, `internal` turned into `external`, private turned into public);
- validation removed without a replacement;
- external calls added without checks;
- a high blast radius (more than 50 callers) combined with a HIGH-risk change.

## Adversarial analysis

Apply this to every HIGH-risk change, after the deep context analysis.

1. **Define the attacker model.**
   - WHO: unauthenticated external user, authenticated regular user, malicious administrator, compromised upstream
     service or contract, front-runner or MEV bot (on blockchains).
   - ACCESS: public API only, an authenticated role, specific permissions or tokens, contract call capability.
   - INTERFACE: the exact HTTP endpoints, contract functions, RPC interfaces or external APIs they use.
2. **Identify concrete attack vectors.** Trace the call chain from a public interface to the changed code; verify
   that the path is reachable, do not assume it:
   ```
   ENTRY POINT:     [exact function/endpoint the attacker can reach]
   ATTACK SEQUENCE: 1. [call with parameters] 2. [how it reaches the vulnerable code]
                    3. [what happens there]   4. [impact achieved]
   PROOF OF ACCESS: [the function is public/external; the attacker has the needed permissions;
                     the path exists through real interfaces]
   ```
3. **Rate the exploitability realistically.**
   - EASY: public interface, no special privileges, a single call or transaction, no complex conditions.
   - MEDIUM: specific conditions or raised but obtainable privileges, several steps or timing, a particular state.
   - HARD: admin or owner privileges, rare edge cases, or significant resources needed.
4. **Build the complete exploit scenario.** The attacker's starting position. Each step with the exact call, the
   parameters, the expected result and why it works (reference the code change). The concrete, measurable impact:
   exact funds at risk, privileges gained, data exposed. Never write "could cause issues".
5. **Cross-check with the baseline context.** Does it violate a system-wide invariant? Break a trust boundary? Bypass
   a validation pattern? Is it a regression of an earlier fix?

## Vulnerability patterns

| Pattern | What to look for | Example |
|---------|------------------|---------|
| Security regression | Code removed for security is re-added; commit messages with "security", "fix", "CVE", "vulnerability"; removed less than 6 months ago; no reason given in the change | re-added code found by `git log -S` whose earlier commit says "Fix reentrancy CVE-…" (command below) |
| Double decrease or increase | The same accounting update in two related functions for one logical action | `balance[user] -= amount` in both `requestExit()` and `processExit()` |
| Missing validation | A `require`/`assert`/`revert` (or `raise`, `throw`, an early `return err`) removed without a replacement. Was it moved elsewhere? Was it redundant? Does removing it expose something? | `- require(amount <= balance[msg.sender])` |
| Underflow or overflow | Arithmetic without checks: Solidity below 0.8 without SafeMath, `unchecked` blocks, unchecked casts in any language | `unchecked { balance[user] -= amount; }` |
| Re-entrancy | An external call before the state update (checks-effects-interactions violated) | sending funds before `balances[msg.sender] = 0` |
| Access control bypass | Permission checks removed or relaxed. Who can call it now? What is the new trust model? Was the check moved to the caller? | `- function setConfig(uint v) external onlyOwner {` |
| Race condition or front-running | Two-step state changes without commit-reveal, a timelock or a lock | allowance change from 100 to 50, front-run to spend 150 |
| Timestamp dependence | Security logic depending on a time value the attacker or a block producer can influence | `require(block.timestamp > deadline)` |
| Unchecked return value | An external call or transfer whose success is ignored | `token.transfer(user, amount);` without a check |
| Denial of service | Unbounded loops, loops over user-controlled lists, critical functions that depend on an external call succeeding | paying rewards in a loop over all users |

Quick detection commands (extend the patterns for your language):

```bash
git diff <base>..<head> | grep "^-" | grep -E "require|assert|revert|raise|throw"   # removed checks
git log -S "pattern" --all -E --grep="security|fix|CVE|vulnerab" --oneline   # was this code removed for security before?
git diff <base>..<head> | grep "^+" | grep -E "\.call|\.delegatecall|\.staticcall|fetch\(|requests\.|http"   # new external calls
git diff <base>..<head> | grep -E "onlyOwner|onlyAdmin|internal|private|public|external"   # changed access modifiers
git diff <base>..<head> | grep -E "^[-+].*(\+|-|\*|/)"   # changed arithmetic
```

## Report

Write these sections:

```markdown
# Differential Security Review: <project>, <base>..<head>

## 1. Executive summary
| Severity | Count |
|----------|-------|
| CRITICAL | X |
| HIGH | Y |
| MEDIUM | Z |
| LOW | W |

**Overall risk:** CRITICAL/HIGH/MEDIUM/LOW
**Recommendation:** APPROVE / REJECT / CONDITIONAL
**Key metrics:** files analysed X/Y (Z%), test coverage gaps N functions,
high blast radius changes M functions, security regressions P

## 2. What changed
Commit range, number of commits, timeline (YYYY-MM-DD to YYYY-MM-DD).
| File | +Lines | -Lines | Risk | Blast radius |

## 3. Critical findings (one block per HIGH or CRITICAL issue)
### [SEVERITY] Title
**File:** path/to/file.ext:L123 (commit abc123)
**Blast radius:** N callers (HIGH/MEDIUM/LOW)   **Test coverage:** YES/NO/PARTIAL
**Description:** clear explanation
**Historical context:** git blame (added in commit X on date), original commit message, why the code existed
**Attacker model:** WHO / ACCESS / INTERFACE   **Exploitability:** EASY/MEDIUM/HARD, with justification
**Attack scenario:** concrete steps
**Proof of concept:** code that reproduces it
**Recommendation:** specific fix, with code
**Baseline violation:** which invariant or pattern is broken

## 4. Test coverage analysis
Coverage of changed code; table of untested changes (function, risk, impact); risk assessment.

## 5. Blast radius analysis
| Function | Callers | Risk | Priority |

## 6. Historical context
Security-related removals (line, what, when, why it was added); regression risks.

## 7. Recommendations
- Immediate (blocking): [ ] ...
- Before production: [ ] ...
- Technical debt: [ ] ...

## 8. Analysis methodology
Strategy (DEEP/FOCUSED/SURGICAL), files reviewed and coverage per risk level, techniques used,
limitations (e.g. external dependencies not analysed, one-hop callers only), confidence.

## 9. Appendices
Commit reference table, key definitions.
```

Formatting: tables for structured data, code blocks with the language named, BEFORE/AFTER blocks for comparisons,
and every finding with a file and line reference (`file.ext:L123`, with the commit where it helps).

## Example

A change removes `require(amount > 0)` from `withdraw()` in a Solidity vault.

- **Attacker model:** an unauthenticated external user who can call public contract functions; interface
  `withdraw(uint256 amount)`.
- **Attack vector:** call `withdraw(0)`. The removed check no longer stops it, a `Withdraw(user, 0)` event is
  emitted, and the accounting is updated as if a withdrawal happened. Proof of access: the function is `external`
  and has no auth check.
- **Exploitability:** EASY. One transaction, a public function, no special state.
- **Impact:** the off-chain indexer credits a withdrawal that moved no value. Total supply and user balances drift
  apart, so the protocol's accounting is corrupted and can be used to manipulate LP calculations.
- **Baseline violation:** it breaks the invariant "every withdrawal transfers a non-zero value". Every other value
  transfer checks the amount, and the check was added in commit `abc123` "Fix zero-amount exploit", so this is a
  regression.

## Quality checklist

Before you deliver:

- [ ] All changed files analysed (or the limits stated in section 8).
- [ ] Git blame run on removed security code.
- [ ] Blast radius calculated for HIGH-risk changes.
- [ ] Attack scenarios are concrete, not generic.
- [ ] Findings reference specific lines and commits.
- [ ] The report file is written.
- [ ] The user has the summary.

Do: start with git blame on removed code, calculate the blast radius early to set priorities, write concrete attack
scenarios, reference lines and commits, and be honest about coverage limits.

Don't: skip git history, make generic findings without evidence, claim a full analysis when time was limited, forget
test coverage, miss high blast radius changes, or deliver the report only in chat when a file can be written.

---
Adapted from Differential Security Review (differential-review plugin) by Omar Inuwa / Trail of Bits (https://github.com/trailofbits/skills/tree/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/differential-review), CC-BY-SA-4.0 (https://creativecommons.org/licenses/by-sa/4.0/). This adaptation is licensed under CC-BY-SA-4.0 as well.
Changes: five files merged into one skill, shortened, references to other skills and tool-specific agents removed, language-neutral commands added. See SOURCE.md.
