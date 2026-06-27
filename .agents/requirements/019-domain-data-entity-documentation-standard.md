# 019 - Domain Data Entity Documentation Standard

## Requirement
Every domain must have explicit, detailed data entity documentation.

## Why
Field-level ambiguity creates integration bugs, inconsistent validation, and slows down feature development.

## Guardrails
- For each domain entity/value object, documentation must include:
  - field name
  - data type
  - format and allowed values
  - required/optional semantics
  - expected validations
  - code and OpenAPI references
- Documentation must highlight mismatches between domain model types and API contracts.
- Entity documentation must be updated in the same PR as schema/domain field changes.

## Canonical location
- `documentation/md/DOMAIN-DATA-ENTITIES.md`

## Status
Active
