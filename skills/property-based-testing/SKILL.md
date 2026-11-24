---
name: property-based-testing
description: Writes, reviews and triages property-based tests (Hypothesis, fast-check, proptest, jqwik, rapid, Echidna or Medusa) when a test should cover a whole input domain instead of hand-picked examples - encode/decode pairs, parsers, normalisers, validators, numeric types, comparators, data structures, contract invariants - and tells a wrong property from a real bug. Triggered by "property-based test", "property test", "hypothesis", "fast-check", "proptest", "roundtrip test", "invariant test", "this property test failed".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: test
category: tests/unit
---

# Property-Based Testing

## Goal

An example test asserts one point. A property asserts a rule over the whole input domain and lets the
generator hunt for the counterexample. That trade is worth making when the code has an algebraic shape - an
inverse, an invariant, an oracle - and not otherwise. Code with no such shape gets example tests; saying so is
a valid outcome.

Three jobs: **write** property tests, **review** existing ones for tests that assert nothing, and **triage** a
shrunk counterexample into a wrong property, an ambiguous spec or a real bug.

Not for: coverage-guided binary fuzzing (libFuzzer, AFL), mutation-testing campaigns, static analysis,
benchmarking or end-to-end UI tests.

## Steps

1. **Name the job:** writing new tests, reviewing existing ones, or a property test just failed. Jump to the
   matching section below; the next steps apply to writing.
2. **Find the library the project already uses** (see "Libraries by language"). If there is one, write the
   tests in it. If there is none, adding one is a dependency decision that belongs to the person you work
   for: offer it once, with the specific property you would write, and accept the answer either way.
3. **Find the strongest property the code supports** using the property catalog. Before concluding there is
   none, check whether it is merely buried (see "Refactoring to expose a property").
4. **Write the test** with the constraints inside the strategy, the known edge cases pinned, and settings
   suited to local runs and CI (see "Writing the generators").
5. **Check that it asserts something:** no tautology, no vacuity (see "The two ways a property test asserts
   nothing"). Ask: could a broken implementation make this test fail?
6. **Run it.** If it fails, ground and classify the failure before reporting anything (see "Interpreting
   failures").
7. **Report** the properties you added, the edge cases you pinned, every failure with its classification and
   shrunk input, and - if the code is a poor candidate - say so plainly instead of writing a "no crash" test.

## Property catalog

| Property | Formula | Where it applies |
|---|---|---|
| Roundtrip | `decode(encode(x)) == x` | Serialisation, conversion pairs |
| Inverse | `f(g(x)) == x` | encrypt/decrypt, compress/decompress |
| Oracle | `new(x) == reference(x)` | Optimisation, refactoring, reimplementation |
| Idempotence | `f(f(x)) == f(x)` | Normalisation, formatting, sorting |
| Invariant | Holds before and after | Any transformation, contract state |
| Easy to verify | `is_sorted(sort(x))` | Complex algorithms with cheap checkers |
| Commutativity | `f(a, b) == f(b, a)` | Binary and set operations |
| Associativity | `f(f(a,b), c) == f(a, f(b,c))` | Combining operations |
| Identity | `f(x, e) == x` | Operations with a neutral element |

Strength, weakest to strongest:
`no crash -> type preservation -> invariant -> idempotence -> roundtrip / oracle`.

Assert the strongest property the code supports. "No crash" alone rarely justifies the dependency - if that is
all you can find, either a small rearrangement exposes something stronger, or the honest report is that this
code is a poor candidate. Rule out the first before settling for the second.

## The two ways a property test asserts nothing

- **Tautology.** `assert add(a, b) == a + b` restates the implementation; no bug they share can fail it. Pick
  a property that constrains the function without recomputing it. Exception: `f(x) == f(x)` is a genuine
  determinism property when `f` is not obviously pure - serialisers over dicts or sets, hashing, anything
  reading the clock.
- **Vacuity.** An `assume()` that filters out nearly every input passes without exercising anything, and a
  self-contradictory `assume()` passes having run zero cases. Push constraints into the strategy so the
  generator produces valid inputs directly.

## Writing the generators

Writing the `@given` decorator is the easy part. These decisions separate a suite that finds bugs from one that
just runs (examples in Hypothesis; the same ideas exist in every library).

**Put constraints in the strategy, not in `assume()`.** The single highest-value habit. `assume()` discards
inputs after generation, so a filter that rejects most candidates wastes the budget and eventually trips the
library's exhausted-filter guard - a warning nobody reads.
```python
# Slow, mostly discards
@given(st.integers())
def test_positive(x):
    assume(x > 0)
    ...

# Generates only what you want
@given(st.integers(min_value=1))
def test_positive(x):
    ...
```
Reserve `assume()` for conditions you cannot express as a generator - usually a relationship between two
already-generated values. Build compound inputs with `st.builds`, and derive dependent fields with
`st.composite` or `.flatmap` instead of generating independently and filtering:
```python
@st.composite
def sized_list_and_index(draw):
    xs = draw(st.lists(st.integers(), min_size=1))
    i = draw(st.integers(min_value=0, max_value=len(xs) - 1))
    return xs, i
```

**Pin the edge cases you already know.** Random generation finds boundaries eventually; `@example` finds them
on every run and documents that you thought about them. Empty, single element, all duplicates, zero, negative
and the maximum representable value are the ones that recur.
```python
@given(st.lists(st.integers()))
@example([])
@example([1])
@example([1, 1, 1])
def test_sort(xs): ...
```

**Settings.** The defaults (100 examples, 200 ms deadline) are wrong at both ends of the workflow:
```python
@settings(max_examples=10)                    # local iteration
@settings(max_examples=200)                   # CI
@settings(max_examples=1000, deadline=None)   # nightly
```
Set `deadline=None` for anything doing real work - the default deadline turns a slow machine into a failing
test, and that flake gets the whole suite deleted.

**Determinism as a property.** `f(x) == f(x)` is a tautology for a pure function and a real test for anything
else: serialisers over dicts or sets, hashing, iteration order, time. Assert it where a broken implementation
could falsify it, and not otherwise.

**Test the error path.** `st.binary()` against a decoder is worth writing: the contract is usually "raises
`DecodeError` or succeeds, never `IndexError`, never hangs". Catch only the documented exception and let
everything else fail the test.

## Refactoring to expose a property

"This code has no algebraic shape" is often a fact about how the code is *arranged*, not about what it does.
Suggest the refactor, name the property it unlocks, and let the author decide - changing production code to
make a test possible is their call. Strongest first:

1. **Extract the pure core.** I/O at the edges, calculation in the middle, assert against the middle.
   ```python
   # Before: the arithmetic is real but unreachable without a database
   def process_order(order_id: str) -> None:
       order = db.fetch(order_id)
       total = apply_discount(order, calculate_discount(order))
       db.save(order_id, total)

   # After: the pure core takes arguments and returns a value
   def order_total(order: Order, rules: DiscountRules) -> Decimal:
       return apply_discount(order, calculate_discount(order, rules))

   def process_order(order_id: str) -> None:
       order = db.fetch(order_id)
       db.save(order_id, order_total(order, get_discount_rules()))
   ```
   `order_total` now supports invariants (never negative, never above the undiscounted total), monotonicity
   in the discount rate and an oracle. `process_order` keeps example tests with a mocked `db`. The same move
   works for anything whose observable is a side effect: build the message, request or query object, then
   send it. Construction is testable; delivery is mocked.
2. **Add the missing inverse.** A one-way operation has no roundtrip. Adding `decode_message` next to
   `encode_message` unlocks the strongest property in the catalog - say whether the inverse is worth having in
   production or only for the test. A serialiser nobody can read back is usually a latent bug.
3. **Structured representation plus a renderer.** String building by concatenation has nothing to assert
   beyond "contains a substring". Split a `Query` dataclass from `render(q) -> str` and `parse(sql) -> Query`,
   and render/parse becomes a roundtrip - which is where escaping and quoting bugs show up.
4. **Return a value instead of mutating.** `sort_tasks(tasks) -> None` leaves nothing to compare;
   `sorted_tasks(tasks) -> list` unlocks is-sorted, permutation, idempotence and length preservation. If the
   mutating signature must stay, a wrapper that copies and returns is enough for the test.
5. **Inject the dependency.** `validate(data)` reading a global `CONFIG.max_length` can only be tested at
   whatever that value is; `validate(data, max_len)` lets the generator drive the bound to 0, 1 and the
   maximum - where validators actually break.

Do not suggest a refactor when the only property it unlocks is "no crash", when the module would need
wholesale restructuring (say that once, plainly - twenty small suggestions read as a rewrite request), or
without flagging a public API break and offering the backwards-compatible version. After any refactor, run the
existing tests and say that you did.

## Reviewing property tests

A property test can pass for years while asserting nothing. Report every issue with its severity; do not
decide on the author's behalf that a MEDIUM is not worth mentioning.

| Issue | Severity | How it shows up |
|---|---|---|
| Tautological | CRITICAL | The assertion is true regardless of the implementation (`assert result == result`) |
| Vacuous | CRITICAL | `assume()` filters out nearly everything, or contradicts itself (`x > 100` and `x < 50`) |
| No assertion | HIGH | The body calls the function and stops |
| Reimplementation | HIGH | The assertion recomputes the function's own logic (`add(a, b) == a + b`) |
| Weaker property available | MEDIUM | Length checked, ordering not |
| Over-filtered | MEDIUM | Stacked `assume()` where a strategy constraint belongs |
| Settings | LOW | `max_examples=5`, or no deadline on an expensive strategy |

`assume(x == 42)` is the subtle vacuous case: it runs, it passes, and it is an example test wearing a
`@given` decorator. For reimplementation, reach for an algebraic property instead - commutativity, identity,
associativity - which constrains the function without restating it.

Find the tests, for example with ripgrep:
```bash
rg "@given\(|from hypothesis import" --type py
rg "fc\.(assert|property)" --type ts --type js
rg "proptest!|#\[quickcheck\]" --type rust
```

Compare each test against the property catalog and name the strongest property the code supports but the suite
does not assert - a suite that checks `len(sort(xs)) == len(xs)` and never checks ordering is the common case.
Also flag floating-point equality without a tolerance, assertions on dict or set iteration order, and anything
reading the clock: these produce flakes that get blamed on the library and then deleted.

## Interpreting failures

A failing property test has told you one of three things, and each needs a different response:

- **The property is wrong** - you asserted something the code never promised.
- **The spec is ambiguous** - behaviour at this edge was never decided.
- **The code is wrong** - a documented guarantee is violated.

Most of the work is telling them apart. **Ground the property** with the shrunk input in hand, checking what
the code promises, in descending order of authority: external spec (RFC, format definition), type annotations,
docstrings, existing tests, and - weakest, most misleading - the function name.

Worked example: `test_normalize(s='\x00')` fails idempotence, and the docstring says "Normalize a string to
NFC form. s: input string (any unicode)". Any unicode includes null bytes, so the input is in-domain: a real
bug. If the docstring said "ASCII printable only", the same failure is a strategy bug - fix it with
`st.text(alphabet=...)`, not a bug report.

| Symptom | Cause | Action |
|---|---|---|
| Violates a documented guarantee | Code bug | Report with the shrunk input and a quote from the doc |
| Input violates a documented precondition | Over-broad strategy | Constrain the strategy |
| Property contradicts the docstring or type | Wrong property | Fix the property |
| Edge case the spec never addresses | Ambiguous spec | Ask the maintainer: a discussion, not a bug report |
| Disappears under realistic constraints | Test artefact | Fix the strategy |
| Behaviour differs from a sibling function | Possible inconsistency | Worth raising; flag the uncertainty |

Precondition violations and explicitly undefined behaviour are not bugs. Report everything with its
classification attached, including the cases you are unsure about ("ambiguous spec, needs a maintainer
decision") - a suppressed finding cannot be triaged by anyone else.

Recurring patterns:
- **Lone surrogates break text roundtrips** (`'\uD800'`). Whether that is a bug depends on whether the format
  claims to accept any string or only valid UTF-8.
- **Denormals break numeric invariants.** A probability function returning a negative value for `x=1e-320`
  is a real bug against a documented `[0, 1]` range - exactly the input no human writes by hand.
- **Hash/equality divergence violates a language contract** (in Python `a == b` must imply
  `hash(a) == hash(b)`). No grounding needed; report it.
- **Off-by-one in custom iterators** shows up as `list(it(xs)) == xs` dropping the last element. Almost always
  real.

## Libraries by language

Match the project's existing choice; a second property-testing library in one codebase is not worth the
property you wanted to write.

| Language | Default | Also in use |
|---|---|---|
| Python | Hypothesis | - |
| TypeScript / JavaScript | fast-check | - |
| Rust | proptest | quickcheck (simpler API, per-type shrinking) |
| Go | rapid | gopter (ScalaCheck-style, more explicit) |
| Java | jqwik | - |
| Scala | ScalaCheck | - |
| C# | FsCheck | - |
| Elixir | StreamData | - |
| Haskell | QuickCheck | Hedgehog (integrated shrinking, no type classes) |
| Clojure | test.check | - |
| Ruby | PropCheck | - |
| Kotlin | Kotest | - |
| C++ | RapidCheck | - |
| Swift | SwiftCheck | unmaintained - check before recommending |

Detect what a repository already uses before proposing anything:
```bash
rg "from hypothesis import|fast-check|use proptest|pgregory.net/rapid|net.jqwik|echidna_|invariant_"
```

## Smart contracts (EVM / Solidity)

Here property testing earns the most: contract state is adversarial and the input domain is every possible
call sequence. Tools: **Echidna** (property fuzzer, mature, the default) and **Medusa** (parallel,
coverage-guided, faster on large suites). Picking the wrong mode is the usual mistake:

- **Property mode** - a function returning `bool` that must never become false, checked after every
  transaction sequence:
  ```solidity
  function echidna_total_matches_sum() public view returns (bool) {
      return token.totalSupply() == trackedSum;
  }
  ```
- **Assertion mode** - an `assert` inside a function the fuzzer may call directly, for properties of one
  operation rather than global state:
  ```solidity
  function testDepositIncreasesBalance(uint256 amount) public {
      uint256 before = vault.balanceOf(address(this));
      vault.deposit(amount);
      assert(vault.balanceOf(address(this)) >= before);
  }
  ```

Invariants worth asserting: solvency (`sum(balances) <= totalAssets`), supply conservation, access control (no
non-owner call sequence reaches an owner-only state change), monotonic counters, and share/asset roundtrip
(`convertToShares` then `convertToAssets` never returns more than you put in).

Solidity tautologies: type bounds are not properties (`uint256 x >= 0`, `address(this).balance >= 0` are
always true). A property that only reads state no call sequence can reach is vacuous - check the fuzzer's
coverage output instead of assuming. `echidna_` functions must be `view`/`pure` and take no arguments; a
property that mutates state silently changes what it tests.

---
Adapted from Property-Based Testing by Trail of Bits (https://github.com/trailofbits/skills/blob/149d7b21f4067765b82e67029730b42d228ef4b4/plugins/property-based-testing/skills/property-based-testing/SKILL.md), CC-BY-SA-4.0.
Changes: folded the five reference files into this file, added Goal/Steps, shortened examples, removed tool-specific wording; this adaptation is licensed under CC BY-SA 4.0. See SOURCE.md.
