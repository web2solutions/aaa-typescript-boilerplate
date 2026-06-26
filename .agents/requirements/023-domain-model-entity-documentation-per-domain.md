# 023 - Domain Model and Entity Documentation Per Domain

## Requirement
Each domain must have dedicated Markdown documentation for:
- aggregate/domain models
- entity contracts
- value objects

## Why
Single-file generic documentation scales poorly and hides domain-specific rules.

## Guardrails
- Keep one domain-focused doc set per domain folder under `docs/domains/<domain>/`.
- Document field type, requiredness, format, default, normalization, and validations.
- Link domain docs from `README.md` glossary index.
- Update docs in the same PR when domain model/contract fields change.

## Status
Active
