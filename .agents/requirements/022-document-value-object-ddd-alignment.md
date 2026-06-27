# 022 - Document Value Object DDD Alignment

## Requirement
`DocumentValueObject` must follow DDD value-object behavior with explicit invariants and immutable attributes.

## Why
Weak value-object definitions allow inconsistent domain state and hidden data drift.

## Guardrails
- Constructor validates required attributes and rejects invalid enum values.
- Attributes are immutable after construction.
- Input normalization is centralized in the value object.
- Changes to VO fields must update tests and domain docs in the same change set.

## Status
Implemented and active
