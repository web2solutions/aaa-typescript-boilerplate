# Requirement 055 - Wave 5 App Re-homing Cutover Governance

## Context

Wave 5 moves runtime applications into workspace app boundaries. Without a strict cutover guide, path regressions and CI breakages become highly likely.

## Requirement

1. App re-homing must follow a documented step-by-step cutover sequence.
2. PM2 paths and runtime adapters must be validated after every move step.
3. Rollback instructions must be explicit and reversible by wave scope.
4. Final acceptance criteria must include CI gates and coverage policy compliance.

## Acceptance criteria

- `documentation/md/JUMENTIX-WAVE5-APP-REHOMING-CUTOVER.md` exists and is referenced by the execution plan and README index.
- `.agents/project-todos.md` Wave 5 progress references the cutover document.
- No Wave 5 PR is considered done without green CI gates and coverage threshold compliance.
