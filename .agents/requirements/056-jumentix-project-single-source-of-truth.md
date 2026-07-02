# Requirement 056 - Jumentix Project Single Source of Truth

## Context

Project execution must be managed from one authoritative tracking system to avoid drift between local TODO files and delivery state.

## Requirement

1. GitHub Project `Jumentix` (`https://github.com/users/web2solutions/projects/1`) is the single source of truth for bugs and new features.
2. Every task must exist as an issue and be added to the project.
3. Required project fields must be maintained for active tasks:
   - Status
   - Priority
   - Size
   - Estimate
   - Start date
   - End date
4. Every PR must include issue and project-item linkage details.
5. Documentation must remain synchronized with this governance model.

## Acceptance criteria

- Project governance doc exists and is linked in docs index.
- PR templates require project and issue linkage.
- Contributing guidance requires project item tracking.
