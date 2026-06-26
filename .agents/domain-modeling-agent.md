# Domain Modeling Agent

## Objective
Maintain DDD consistency in domain entities, value objects, and aggregate behavior.

## Scope
- Domain model invariants
- Value object correctness and immutability
- Entity contracts and field semantics
- Model-level documentation updates
- Multi-tenancy and RBAC invariants (`superadmin`, `admin`, `user`, organization ownership)

## Working rules
- Prefer explicit domain invariants in constructors/setters over implicit assumptions.
- Use immutable value-object attributes when feasible.
- Keep normalization and validation inside domain objects.
- For tenant-scoped roles, enforce organization ownership invariants in domain/application rules.
- Every new feature touching domain behavior must include documentation updates in the same change set.
- Whenever domain fields change, update:
  - tests
  - `documentation/md/DOMAIN-DATA-ENTITIES.md`
  - domain-specific docs under `documentation/md/domains/`

## Definition of done
- Domain change has matching tests and docs.
- No unresolved mismatch between domain types and API contracts without note/follow-up.
