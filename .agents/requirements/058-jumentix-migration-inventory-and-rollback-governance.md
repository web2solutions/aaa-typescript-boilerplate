# Requirement 058 - JumentiX Migration Inventory and Rollback Governance

## Context

Monorepo migration requires deterministic execution, low-risk rollback, and explicit path ownership mapping to avoid uncertain implementation cycles.

## Requirement

1. Keep a canonical migration inventory mapping current root paths to target `apps/*` and `packages/*`.
2. Define branch, release tag, and rollback strategy per migration wave.
3. Keep scope split explicit between Wave 1 (must-have parity) and Wave 2+ enhancements.
4. Keep this governance synchronized with project TODO and execution plan docs.

## Implementation references

- `documentation/md/JUMENTIX-MIGRATION-INVENTORY-AND-ROLLBACK.md`
- `documentation/md/JUMENTIX-MONOREPO-EXECUTION-PLAN.md`
- `.agents/project-todos.md`
