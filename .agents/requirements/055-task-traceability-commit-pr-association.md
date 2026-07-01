# Requirement 055 - Task Traceability (Commit + PR Association)

## Context

To keep GitHub Project tasks auditable and reduce execution ambiguity, every task (issue) must include explicit engineering traceability metadata.

## Requirement

For **all project tasks** (open or closed), maintain:

1. `PR` reference (URL or `#number`)
2. `Commit` reference (single commit hash or commit range)

At minimum, each task update must include:

- PR linkage to the delivery stream
- commit linkage to implementation evidence

## Operational Rule

- Before closing a task, verify commit + PR references are present in issue comments or issue body.
- For active tasks not yet implemented, maintain a placeholder traceability update pointing to the active delivery PR and current commit baseline.

## Acceptance Criteria

- All issues under project tracking label (`todo-mvp`) have commit + PR linkage visible.
- New task updates follow the same traceability format.
