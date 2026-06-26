# 018 - Project Documentation and Structure Sync

## Requirement
Project documentation must remain synchronized with implementation changes, especially architecture and directory structure updates.

## Why
When documentation drifts, onboarding and maintenance cost increase, and teams make mistakes during feature delivery and bugfixes.

## Guardrails
- `README.md` must reflect:
  - active architecture direction,
  - runtime adapters,
  - CI/quality gates,
  - current project structure.
- Architecture migration docs must be updated whenever structural changes land.
- New scripts/guards added to CI must be documented.

## Status
Active
