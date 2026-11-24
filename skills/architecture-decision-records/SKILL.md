---
name: architecture-decision-records
description: Writes and maintains Architecture Decision Records (ADRs) that capture the context, options, decision and consequences of significant technical choices, and keeps the ADR index and statuses in order. Triggered by "write an ADR", "document this decision", "architecture decision record", "why did we choose", "supersede ADR".
status: draft
runs-with: [claude, copilot, codex, gemini, cursor]
for: [docs, dev]
category: docs
---

# Architecture Decision Records

## Goal

Capture each significant technical decision as a short, honest, numbered record, so that future readers know why
the team needed to decide, what it decided, which options it rejected and what follows from it. Records are never
rewritten after acceptance; they are superseded by new ones, which builds a traceable history of decisions.

## Steps

1. **Check that an ADR is needed.** Use the table in "When to write an ADR". If the change is a bug fix, a minor
   upgrade or an implementation detail, say so and stop.
2. **Find the project's ADR home.** Look for an existing folder (`docs/adr/`, `docs/decisions/`, `adr/`), its
   `README.md` index, its `template.md` and the highest number in use. Follow what the project already does. If
   there is no ADR folder yet, propose `docs/adr/` with an index and a template (see "ADR management") and ask the
   person before creating it.
3. **Gather the context.** Collect the problem, constraints (scale, compliance, budget, deadlines, team skills),
   the decision drivers (must-haves and nice-to-haves) and every viable option, including "keep what we have" when
   that is a real option. Read related ADRs, code and benchmarks. Ask the person for anything you cannot find; do
   not invent numbers, names or measurements.
4. **Pick the format.** Standard ADR for significant decisions, lightweight ADR for smaller ones, Y-statement for a
   one-paragraph summary, deprecation ADR when replacing an earlier decision, RFC when the proposal still needs
   discussion before anyone decides. Read the matching template in "Templates" before drafting.
5. **Draft the record.** Use the next free number and the file name `NNNN-title-with-dashes.md`. Give it the status
   **Proposed** and today's date. State the decision in one clear sentence. List real pros and cons for every
   option and both positive and negative consequences, plus risks with mitigations.
6. **Run the review checklist.** Go through "Before submission" in the review checklist and fix every gap.
7. **Link and index.** Link related ADRs both ways. If this record supersedes an older one, change only the older
   record's status line to `Superseded by ADR-NNNN` (never its content). Add the new record to the index table.
8. **Hand over.** Tell the person the file path, the status and what reviewers should look at. The people who own
   the decision change the status to Accepted or Rejected; do not accept a decision on their behalf.

## Rules

- Write ADRs early, before implementation starts.
- Keep them short: one to two pages at most.
- Be honest about trade-offs; include the real cons of the chosen option.
- Never change the content of an accepted ADR; write a new one that supersedes it.
- Never skip the context; future readers need the background.
- Keep rejected decisions; they show what was considered and why it lost.
- Be specific: a concrete decision with concrete consequences, not "we will use a modern database".
- An ADR without follow-up action is waste: name the implementation work it triggers.

## What an ADR is

An Architecture Decision Record captures:

- **Context:** why we needed to make a decision.
- **Decision:** what we decided.
- **Consequences:** what happens as a result, good and bad.

## When to write an ADR

| Write an ADR               | Skip the ADR           |
| -------------------------- | ---------------------- |
| New framework adoption     | Minor version upgrades |
| Database technology choice | Bug fixes              |
| API design patterns        | Implementation details |
| Security architecture      | Routine maintenance    |
| Integration patterns       | Configuration changes  |

## ADR lifecycle

```
Proposed → Accepted → Deprecated → Superseded
    ↓
 Rejected
```

- **Proposed:** under discussion.
- **Accepted:** decision made, being implemented.
- **Deprecated:** no longer relevant.
- **Superseded:** replaced by another ADR (name it).
- **Rejected:** considered but not adopted.

## ADR management

### Directory structure

```
docs/
└── adr/
    ├── README.md                       # Index and guidelines
    ├── template.md                     # The team's ADR template
    ├── 0001-use-postgresql.md
    ├── 0002-caching-strategy.md
    ├── 0003-mongodb-user-profiles.md   # Deprecated
    └── 0020-deprecate-mongodb.md       # Supersedes 0003
```

### ADR index (README.md)

```markdown
# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for [Project Name].

## Index

| ADR                                   | Title                              | Status     | Date       |
| ------------------------------------- | ---------------------------------- | ---------- | ---------- |
| [0001](0001-use-postgresql.md)        | Use PostgreSQL as Primary Database | Accepted   | 2024-01-10 |
| [0002](0002-caching-strategy.md)      | Caching Strategy with Redis        | Accepted   | 2024-01-12 |
| [0003](0003-mongodb-user-profiles.md) | MongoDB for User Profiles          | Deprecated | 2023-06-15 |
| [0020](0020-deprecate-mongodb.md)     | Deprecate MongoDB                  | Accepted   | 2024-01-15 |

## Creating a new ADR

1. Copy `template.md` to `NNNN-title-with-dashes.md`
2. Fill in the template
3. Open a pull or merge request for review
4. Update this index after approval
```

### Optional automation (adr-tools)

If the team uses the open-source command-line tool adr-tools (install it with your package manager):

```bash
adr init docs/adr                                          # create the ADR directory
adr new "Use PostgreSQL as Primary Database"               # new numbered ADR
adr new -s 3 "Deprecate MongoDB in Favor of PostgreSQL"    # new ADR that supersedes ADR 3
adr link 2 "Complements" 1 "Is complemented by"            # link two ADRs both ways
adr generate toc > docs/adr/toc.md                         # table of contents in a separate file,
                                                           # so the hand-written README index is kept
```

## Templates

### Template 1: Standard ADR (MADR format)

Use for significant decisions with several real options.

```markdown
# ADR-0001: Use PostgreSQL as Primary Database

## Status

Accepted

## Context

We need to select a primary database for our new e-commerce platform. The system will handle:

- ~10,000 concurrent users
- Complex product catalog with hierarchical categories
- Transaction processing for orders and payments
- Full-text search for products
- Geospatial queries for store locator

The team has experience with MySQL, PostgreSQL, and MongoDB. We need ACID compliance for financial transactions.

## Decision Drivers

- **Must have ACID compliance** for payment processing
- **Must support complex queries** for reporting
- **Should support full-text search** to reduce infrastructure complexity
- **Should have good JSON support** for flexible product attributes
- **Team familiarity** reduces onboarding time

## Considered Options

### Option 1: PostgreSQL

- **Pros**: ACID compliant, excellent JSON support (JSONB), built-in full-text search, PostGIS for geospatial,
  team has experience
- **Cons**: Slightly more complex replication setup than MySQL

### Option 2: MySQL

- **Pros**: Very familiar to team, simple replication, large community
- **Cons**: JSON querying/indexing differs from PostgreSQL JSONB; validate the required operators and indexes.
  Built-in FULLTEXT and spatial support exist, but their functions and limitations must be checked against
  this workload. See the [MySQL index reference](https://dev.mysql.com/doc/refman/8.4/en/create-index.html).

### Option 3: MongoDB

- **Pros**: Flexible schema, native JSON, horizontal scaling
- **Cons**: [Multi-document transactions](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/)
  are supported on replica sets and sharded clusters but can cost more than single-document writes; the team
  has limited experience and needs schema design discipline.

## Decision

We will use **PostgreSQL 15** as our primary database.

## Rationale

PostgreSQL provides the best balance of:

1. **ACID compliance** essential for e-commerce transactions
2. **Built-in capabilities** (full-text search, JSONB) reduce infrastructure complexity
3. **Added extensions**: PostGIS supplies geospatial capabilities after server installation and
   [database enablement](https://postgis.net/documentation/getting_started/)
4. **Team familiarity** with SQL databases reduces learning curve
5. **Mature ecosystem** with excellent tooling and community support

The slight complexity in replication is outweighed by the reduction in additional services (no separate
Elasticsearch needed).

## Consequences

### Positive

- Single database handles transactions, search, and geospatial queries
- Reduced operational complexity (fewer services to manage)
- Strong consistency guarantees for financial data
- Team can leverage existing SQL expertise

### Negative

- Need to learn PostgreSQL-specific features (JSONB, full-text search syntax)
- Vertical scaling limits may require read replicas sooner
- Some team members need PostgreSQL-specific training

### Risks

- Full-text search may not scale as well as dedicated search engines
- Mitigation: Design for potential Elasticsearch addition if needed

## Implementation Notes

- Use JSONB for flexible product attributes
- Implement connection pooling with PgBouncer
- Set up streaming replication for read replicas
- Use pg_trgm extension for fuzzy search

## Related Decisions

- ADR-0002: Caching Strategy (Redis) - complements database choice
- ADR-0005: Search Architecture - may supersede if Elasticsearch needed

## References

- [PostgreSQL JSON Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [PostgreSQL Full Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- Internal: Performance benchmarks in `docs/benchmarks/database-comparison.md`
```

### Template 2: Lightweight ADR

Use for smaller decisions where the options are obvious.

```markdown
# ADR-0012: Adopt TypeScript for Frontend Development

**Status**: Accepted
**Date**: 2024-01-15
**Deciders**: Alice, Bob, Charlie

## Context

Our React codebase has grown to 50+ components with increasing bug reports related to prop type mismatches and
undefined errors. PropTypes provide runtime-only checking.

## Decision

Adopt TypeScript for all new frontend code. Migrate existing code incrementally.

## Consequences

**Good**: Catch type errors at compile time, better editor support, self-documenting code.

**Bad**: Learning curve for team, initial slowdown, build complexity increase.

**Mitigations**: TypeScript training sessions, allow gradual adoption with `allowJs: true`.
```

### Template 3: Y-statement

Use for a one-paragraph summary, for example in an index, a pull request or a lightweight log.

```markdown
# ADR-0015: API Gateway Selection

In the context of **building a microservices architecture**,
facing **the need for centralized API management, authentication, and rate limiting**,
we decided for **Kong Gateway**
and against **AWS API Gateway and custom Nginx solution**,
to achieve **vendor independence, plugin extensibility, and team familiarity with Lua**,
accepting that **we need to manage Kong infrastructure ourselves**.
```

### Template 4: Deprecation ADR

Use when a new decision replaces an earlier one. Change only the status line of the old record.

```markdown
# ADR-0020: Deprecate MongoDB in Favor of PostgreSQL

## Status

Accepted (Supersedes ADR-0003)

## Context

ADR-0003 (2021) chose MongoDB for user profile storage due to schema flexibility needs. Since then:

- MongoDB's multi-document transactions remain problematic for our use case
- Our schema has stabilized and rarely changes
- We now have PostgreSQL expertise from other services
- Maintaining two databases increases operational burden

## Decision

Deprecate MongoDB and migrate user profiles to PostgreSQL.

## Migration Plan

1. **Phase 1** (Week 1-2): Create PostgreSQL schema, dual-write enabled
2. **Phase 2** (Week 3-4): Backfill historical data, validate consistency
3. **Phase 3** (Week 5): Switch reads to PostgreSQL, monitor
4. **Phase 4** (Week 6): Remove MongoDB writes, decommission

## Consequences

### Positive

- Single database technology reduces operational complexity
- ACID transactions for user data
- Team can focus PostgreSQL expertise

### Negative

- Migration effort (~6 weeks)
- Risk of data issues during migration
- Lose some schema flexibility

## Lessons Learned

From the ADR-0003 experience:

- Schema flexibility benefits were overestimated
- Operational cost of multiple databases was underestimated
- Consider long-term maintenance in technology decisions
```

### Template 5: Request for Comments (RFC)

Use when the proposal needs discussion before a decision; the accepted outcome then becomes an ADR.

````markdown
# RFC-0025: Adopt Event Sourcing for Order Management

## Summary

Propose adopting the event sourcing pattern for the order management domain to improve auditability, enable
temporal queries, and support business analytics.

## Motivation

Current challenges:

1. Audit requirements need complete order history
2. "What was the order state at time X?" queries are impossible
3. Analytics team needs an event stream for real-time dashboards
4. Order state reconstruction for customer support is manual

## Detailed Design

### Event Store

```
OrderCreated { orderId, customerId, items[], timestamp }
OrderItemAdded { orderId, item, timestamp }
OrderItemRemoved { orderId, itemId, timestamp }
PaymentReceived { orderId, amount, paymentId, timestamp }
OrderShipped { orderId, trackingNumber, timestamp }
```

### Projections

- **CurrentOrderState**: Materialized view for queries
- **OrderHistory**: Complete timeline for audit
- **DailyOrderMetrics**: Analytics aggregation

### Technology

- Event store: KurrentDB, formerly EventStoreDB (purpose-built, handles projections)
- Alternative considered: Kafka + custom projection service

## Drawbacks

- Learning curve for team
- Increased complexity vs. CRUD
- Need to design events carefully (immutable once stored)
- Storage growth (events never deleted)

## Alternatives

1. **Audit tables**: Simpler but doesn't enable temporal queries
2. **CDC from existing DB**: Complex, doesn't change data model
3. **Hybrid**: Event source only for order state changes

## Unresolved Questions

- [ ] Event schema versioning strategy
- [ ] Retention policy for events
- [ ] Snapshot frequency for performance

## Implementation Plan

1. Prototype with single order type (2 weeks)
2. Team training on event sourcing (1 week)
3. Full implementation and migration (4 weeks)
4. Monitoring and optimization (ongoing)

## References

- [Event Sourcing by Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html)
- [KurrentDB Documentation](https://docs.kurrent.io/)
````

## Review checklist

### Before submission

- [ ] Context clearly explains the problem
- [ ] All viable options considered
- [ ] Pros and cons balanced and honest
- [ ] Consequences (positive and negative) documented
- [ ] Related ADRs linked

### During review

- [ ] At least two senior engineers reviewed
- [ ] Affected teams consulted
- [ ] Security implications considered
- [ ] Cost implications documented
- [ ] Reversibility assessed

### After acceptance

- [ ] ADR index updated
- [ ] Team notified
- [ ] Implementation tickets created
- [ ] Related documentation updated

## Red flags

- The decision is written before the context, or the context only restates the decision.
- Only one option is listed, or the rejected options have no real pros.
- The chosen option has no cons or no negative consequences.
- An accepted ADR was edited instead of superseded.
- Numbers, benchmarks or names in the record that nobody can trace to a source.

---
Adapted from Architecture Decision Records by Seth Hobson (https://github.com/wshobson/agents/blob/c96b5f6552dba32e4492307493ee613581430715/plugins/documentation-generation/skills/architecture-decision-records/SKILL.md, with its references/decision-templates.md and references/deprecation-rfc-templates.md), MIT.
Changes: merged the two reference files into one skill, added Goal, Steps, Rules and Red flags, generalised tool and vendor details. See SOURCE.md.
