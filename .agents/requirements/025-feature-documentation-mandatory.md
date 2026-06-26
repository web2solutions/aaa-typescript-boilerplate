# Requirement 025 - Mandatory Feature Documentation

## Status

- Active

## Requirement

Every new feature must be documented as part of the same delivery.

## Enforcement

For each new feature:

1. Update existing documentation pages affected by the feature.
2. Add a new dedicated `.md` page when the feature introduces new workflows, modules, or operational usage.
3. Add or update links in `README.md` index/glossary so documentation is discoverable.
4. Keep commands, examples, and paths aligned with the implemented code.

## Acceptance Criteria

- No feature PR is considered complete without documentation updates.
- Documentation must describe purpose, usage, and integration points of the new feature.
- README index must include navigation to newly created docs.
