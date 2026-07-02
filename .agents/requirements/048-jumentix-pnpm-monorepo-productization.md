# Requirement 048 - JumentiX pnpm Monorepo Productization

## Requirement

`aaa-typescript-boilerplate` must evolve into the `JumentiX` product as a pnpm-managed monorepo.

The monorepo must support:

1. Product apps (`backend-template`, `service-management`).
2. Publishable packages (`cli-init`, `message-mediator`, protocol SDKs, shared configs/contracts).
3. Workspace-wide quality gates (lint, test, build, coverage, security).
4. PM2 runtime management for multi-service backend/frontend execution.

The migration must be executed in deterministic waves, with functional parity required before advancing each wave.

## Acceptance Criteria

- Workspace foundation exists and is functional:
  - `pnpm-workspace.yaml`
  - root scripts for recursive build/test/lint
  - Node 22 enforced across workspace and CI
- `message-mediator` is consumed as workspace package (not duplicated in backend app code).
- SDK clients are split into independent publishable workspace packages.
- CLI package is publish-ready and supports bootstrap orchestration for JumentiX project structures.
- Existing backend capabilities remain available after move to `apps/backend-template`.
- Service management remains functional under `apps/service-management`.
- CI runs workspace-aware pipelines and preserves strict quality/coverage/security gates.
- Product documentation and agents requirements are synchronized with monorepo structure.

## Notes

- Migration is wave-based and must avoid uncertain parallel rewrites.
- No compatibility-shim strategy is required; prefer direct import rewrites with codemod-assisted changes and hard gates.
