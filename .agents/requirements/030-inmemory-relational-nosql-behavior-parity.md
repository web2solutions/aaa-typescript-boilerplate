# Requirement 030 - InMemory Adapter Relational/NoSQL Behavior Parity

## Requirement
The official in-memory adapter must emulate key persistence behaviors expected from relational and NoSQL stores while remaining technology-agnostic at the domain/application layer.

## Mandatory capabilities
- Unique index enforcement (including case-insensitive constraints where configured).
- Relation-aware lookup support across entities.
- Deterministic pagination/filter behavior.
- Contract-first stores so alternative adapters can replace in-memory without domain changes.

## Why
In-memory behavior must be representative enough to prevent false positives in tests and to reduce migration risk when moving to external databases.

## Status
Active

## Notes
- Current implementation uses generic relational-style base store:
  - `src/infra/persistence/InMemoryDatabase/Stores/InMemoryRelationalStore.ts`
