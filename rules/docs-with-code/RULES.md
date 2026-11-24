---
name: "Update documentation together with code"
description: Keeps README, API docs, configuration guides, examples, migration guides and the changelog in step with every code change, in the same commit or pull request, and checks them before the change counts as done.
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: [docs, dev]
category: docs
---

# Update documentation together with code

Documentation is part of feature completeness. A change that leaves the docs describing the old behaviour is not
finished.

## Must

### When to check

- Check whether documentation needs an update whenever a change:
  adds a feature or capability; changes an API endpoint, method or interface; introduces a breaking change;
  changes dependencies or requirements; adds or changes configuration options or environment variables; changes
  installation or setup; changes command-line commands, options or scripts; or makes a code example in the docs
  outdated.
- Update the documentation in the same commit or pull request as the code change. Never commit code changes that
  make the docs wrong without fixing the docs.
- Follow the documentation structure the project already has. Find the affected files by searching the docs for the
  names you changed (functions, flags, endpoints, environment variables, config keys).

### README

- New feature: add it to the features section with a usage example; update the table of contents if there is one.
- Changed installation or setup: update the installation or getting-started section, dependency requirements and
  prerequisites.
- New or changed command-line commands or options: document the syntax, each option with its default value, and a
  usage example.
- Changed configuration: update configuration examples, document new environment variables and update config file
  templates.

### API documentation

- New endpoint: document HTTP method, path, parameters, request and response examples, and update the OpenAPI or
  Swagger specification if the project has one.
- Changed signature: update parameter lists and response schemas, and mark the breaking change.
- Changed authentication or authorization: update authentication examples, security requirements and the API key or
  token documentation.

### Code examples

- When a function signature or API interface changes, update every snippet that uses it, including imports, example
  requests and responses, client code and SDK usage.
- Verify that changed examples still compile or run. If you cannot run them, say so in your report.
- Replace outdated patterns in examples with the current recommended approach; add a deprecation notice where the
  old pattern still works.

### Configuration

- New environment variable: add it to `.env.example` (or the project's equivalent) and to the configuration docs,
  with its default value and a description.
- Changed config file structure: update the example config files, document new options and mark deprecated ones.
- Changed deployment configuration: update container, orchestration and infrastructure-as-code examples and the
  deployment guide.

### Breaking changes and deprecations

- Breaking API change: write or extend a migration guide with what changed, before and after examples, and
  step-by-step migration instructions.
- Major version: list all breaking changes, give an upgrade checklist, and include common migration issues and
  their solutions.
- Deprecation: mark the feature as deprecated in the docs, name the alternative and the timeline for removal.

### Changelog

- If the project keeps a changelog, add an entry with the code change, under the right heading: Added (new
  features), Changed (with a **BREAKING** prefix for breaking changes), Deprecated, Removed, Fixed, Security.
- Reference the pull request or issue in the entry when the project does so.

### Never

- Never document features that do not exist yet.
- Never leave outdated examples, broken links or failing examples behind.
- Never use vague or ambiguous wording ("it may work", "some options").
- Never document internal implementation details that users do not need.

### Before the change counts as done

- [ ] README reflects the current state of the project
- [ ] All new features and public APIs are documented
- [ ] Code examples are tested and work
- [ ] API documentation is complete and accurate
- [ ] Configuration examples are up to date and environment variables are documented
- [ ] Breaking changes are documented with a migration guide
- [ ] The changelog is updated (if the project keeps one)
- [ ] Links are valid
- [ ] Installation instructions are current

## Should

- Keep documentation close to the code and use the language's documentation generator for API reference
  (JSDoc/TSDoc, Sphinx or pdoc, Javadoc, XML doc comments for C#, godoc, rustdoc).
- Keep documentation DRY: link to one place instead of repeating the same text in several files.
- Use clear, concise language, consistent terminology, complete runnable examples (basic and advanced), error
  handling examples, and document edge cases and limitations.
- When the project has no documentation structure yet, propose this one and ask before creating it:
  `README.md` (overview, quick start, basic usage), `CHANGELOG.md` (user-facing changes per version), `docs/`
  (`installation.md`, `configuration.md`, `api.md`, `contributing.md`, `migration-guides/`) and `examples/`
  (working code examples).
- Run the project's documentation checks when they exist: docs build, Markdown linter (for example markdownlint),
  link checker (for example markdown-link-check), spell checker (for example cspell) and example tests. If none
  exist, suggest adding them as pre-commit or CI checks; ask before adding them.
- Show before and after examples for documentation changes that reviewers should look at closely.
- In code review, check that the documentation describes the change accurately, examples are clear and complete,
  no breaking change is undocumented, the changelog entry fits, and a migration guide exists where needed.
- When deprecating a feature: (1) add a deprecation notice to the docs, (2) update examples to the recommended
  alternative, (3) write a migration guide, (4) add the deprecation to the changelog, (5) set a removal timeline,
  (6) remove the feature and its docs in the next major version.
- Review documentation regularly: per release update version numbers and examples, and audit it at least once a
  year for outdated patterns and deprecated features.

## Examples

Which documents a change touches:

| Code change | Documentation to update in the same change |
|-------------|--------------------------------------------|
| New `--dry-run` flag on the `sync` command | README command section, CLI reference options table, changelog "Added" |
| New environment variable `CACHE_TTL` | `.env.example`, configuration docs with default and description, changelog "Added" |
| `getUser(id)` becomes `getUser({ id, includeProfile })` | API reference, every snippet calling `getUser`, migration guide, changelog "Changed" with **BREAKING** |
| Endpoint `GET /v1/orders` removed | API docs, OpenAPI spec, migration guide, changelog "Removed" |

Changelog entry:

```markdown
## [2.3.0] - 2026-11-24

### Added
- `--dry-run` flag for `sync` shows the changes without writing them (#412)

### Changed
- **BREAKING**: `getUser` takes an options object instead of a positional id (#415)

### Fixed
- `sync` no longer stops on empty folders (#409)
```

Function reference entry:

````markdown
### `functionName(param1, param2)`

Brief description of what the function does.

**Parameters:**
- `param1` (type): Description of the parameter
- `param2` (type, optional): Description, with the default value

**Returns:**
- `type`: Description of the return value

**Example:**
```js
const result = functionName('value', 42);
```

**Throws:**
- `ErrorType`: When and why the error is thrown
````

Endpoint reference entry:

````markdown
### `POST /api/orders`

Creates an order for the signed-in customer.

**Request:**
```json
{ "items": [{ "sku": "A-100", "quantity": 2 }] }
```

**Response:**
```json
{ "id": "ord_123", "status": "pending" }
```

**Status codes:**
- 201: Created
- 400: Bad request (invalid items)
- 401: Unauthorized
````

---
Adapted from Update Documentation on Code Change by jhauga for github/awesome-copilot, copyright GitHub, Inc. (https://github.com/github/awesome-copilot/blob/f10fdb8b2660ce85c98f220b2f1ca24653768a5c/instructions/update-docs-on-code-change.instructions.md), MIT.
Changes: condensed from 549 lines into Must/Should/Examples rules, dropped the on/off configuration machinery and assistant-specific wording, added a change-to-docs table. See SOURCE.md.
