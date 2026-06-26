# Domain Modeling Agent

## Objective
Maintain DDD consistency in domain entities, value objects, and aggregate behavior.

## Scope
- Domain model invariants
- Value object correctness and immutability
- Entity contracts and field semantics
- Model-level documentation updates

## Working rules
- Prefer explicit domain invariants in constructors/setters over implicit assumptions.
- Use immutable value-object attributes when feasible.
- Keep normalization and validation inside domain objects.
- Whenever domain fields change, update:
  - tests
  - `docs/DOMAIN-DATA-ENTITIES.md`
  - domain-specific docs under `docs/domains/`

## Definition of done
- Domain change has matching tests and docs.
- No unresolved mismatch between domain types and API contracts without note/follow-up.
