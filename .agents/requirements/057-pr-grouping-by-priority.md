# Requirement 057 - PR Grouping by Priority

## Context

To improve review quality and delivery predictability, pull requests must be grouped by priority level.

## Requirement

1. PRs must be scoped by a single priority group (`P0`, `P1`, or `P2`).
2. Mixing tasks from different priority groups in one PR is not allowed.
3. PR templates must require explicit declaration of priority group.
4. Project item links must confirm the selected priority group.

## Acceptance criteria

- PR templates contain mandatory priority-group field.
- Governance docs define priority-group PR policy.
- Delivery workflow follows `P0` first, then `P1`, then `P2`.
