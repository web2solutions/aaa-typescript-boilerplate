# JumentiX Monorepo Execution Plan

## Objective

Convert the current repository into a pnpm monorepo product named `JumentiX`, minimizing uncertain implementation paths and preserving delivery predictability.

## Guiding Principles

1. Functional parity before advancing each migration wave.
2. Small, reviewable waves with explicit rollback points.
3. Hard quality gates (`lint`, `test`, `build`, `coverage`, security checks) in every wave.
4. Documentation and requirement registry updates in the same wave as code changes.
5. Generic reusable adapters must be packaged as distributable npm libraries.

## Scope Baseline

Target monorepo components:

- `apps/backend-template`
- `apps/service-management`
- `packages/cli-init`
- `packages/message-mediator`
- `packages/sdk-rest-client`
- `packages/sdk-websocket-client`
- `packages/sdk-grpc-client`
- shared config/tooling packages (ts/eslint/jest/contracts) as needed

Planning guardrails and migration inventory reference:

- `documentation/md/JUMENTIX-MIGRATION-INVENTORY-AND-ROLLBACK.md`

## Current Implementation Snapshot

Implemented in repository:

- `pnpm-workspace.yaml` added.
- root `package.json` includes `packageManager` and `mono:*` recursive scripts.
- root `.npmrc` includes workspace linking and shared lockfile settings for monorepo consistency.
- initial workspace scaffolding created:
  - `apps/backend-template`
  - `apps/service-management`
  - `packages/cli-init`
  - `packages/message-mediator`
  - `packages/sdk-rest-client`
  - `packages/sdk-websocket-client`
  - `packages/sdk-grpc-client`
- Wave 3 startup in progress:
  - `packages/sdk-rest-client`, `packages/sdk-websocket-client`, and `packages/sdk-grpc-client` now have package-level source files and TypeScript build/typecheck scripts.
  - SDK packages now include package-level READMEs with usage examples.
- Wave 4 startup in progress:
  - `packages/cli-init` now exposes executable bin entrypoints and owns the bootstrap implementation used by root CLI wrapper.
  - CLI package now includes package-level README with command contract.
- Wave 6 startup in progress:
  - added affected-workspace detector (`npm run ci:affected`) to classify file deltas by `root`, `apps/*`, `packages/*`, and docs-only scope as a base primitive for selective monorepo CI execution.
  - added release dry-run scripts (`npm run release:dry-run`, `release:dry-run:packages`, `release:dry-run:apps`) to verify package artifact readiness and app workspace build/test script contracts.
  - added monorepo CI runner (`npm run ci:monorepo`) that executes lightweight docs-only validation or strict gate + affected app/package commands depending on changed scope.
- reusable package extraction in progress:
  - `packages/message-mediator` (with local bridge exports in backend code)
  - `packages/key-value-storage` (with local bridge exports in backend code)
  - `packages/persistence-contracts` (shared `IStore` and generic `IDatabaseClient`)
  - `packages/mutex-service` (with local bridge exports in backend code)
  - `packages/external-persistence-core` (base class + connection options for external DB adapters)
  - `packages/external-store-proxy` (external DB `IStore` proxy + factory with local bridge export)
  - `packages/external-db-repositories` (concrete external DB connectors with local bridge exports)
  - `packages/database-client-factory` (driver-based DB client compiler with local bridge export)
  - `packages/runtime-infra` (shared env-based runtime infra compilation for adapter bootstraps)
  - `packages/adapter-runtime-bootstrap` (shared auth/runtime composition bootstrap for adapters)
  - adapter bootstrap migration expanded to include new HTTP frameworks and serverless HTTP adapters
  - `start-rest-api` loader expanded to support framework matrix via `AAA_HTTP_FRAMEWORK` and script coupling reduced

Pending validation note:

- Full pnpm recursive execution is currently blocked in this environment due registry network resolution (`ENOTFOUND`) during `pnpm install` bootstrap.
- Local npm validation in this environment currently shows package-manager instability (`npm ci` exit-handler crash and cache permission drift), so final recursive verification must run in CI/clean machine with Node `22.23.1`.

## Migration Milestones

### Milestone 1 - Workspace Foundation

Deliverables:

- `pnpm-workspace.yaml`
- root `package.json` workspace scripts
- Node 22 enforced at workspace root and CI
- base shared configs (ts/eslint/jest) published internally in workspace

Exit Criteria:

- `pnpm -r lint`, `pnpm -r test`, and `pnpm -r build` pass.
- CI runs workspace commands successfully.

### Milestone 2 - Message Mediator Extraction

Deliverables:

- `packages/message-mediator` containing contracts/ports/adapters
- backend app imports mediator package via workspace dependency

Exit Criteria:

- mediator package unit tests pass
- backend tests pass after import rewrites

Current status:

- Extracted and bridged (`src/modules/port/*` + `src/infra/messages/*` now re-export package contracts/adapters).
- Runtime compile helper migration completed with compatibility bridge.

### Milestone 3 - SDK Split

Deliverables:

- protocol SDKs as independent packages
- package-level docs and examples

Exit Criteria:

- all SDK packages build and test independently
- contract behavior validated by automated tests

### Milestone 4 - CLI Productization

Deliverables:

- CLI moved to `packages/cli-init`
- bootstrap orchestration for backend/frontend/hybrid project generation

Exit Criteria:

- bootstrap smoke test passes end-to-end
- installation and usage docs are complete

### Milestone 5 - App Re-homing

Deliverables:

- backend moved to `apps/backend-template`
- service management moved to `apps/service-management`

Exit Criteria:

- both apps run under workspace scripts
- PM2 profiles remain functional

Current status:

- `apps/service-management` is already re-homed.
- `apps/backend-template` now owns operational workspace scripts (build/test/integration/CI/PM2) mapped to root runtime as migration bridge.
- Pending: physical move of backend runtime directories/files into `apps/backend-template`.

Execution guide:

- `documentation/md/JUMENTIX-WAVE5-APP-REHOMING-CUTOVER.md`

### Milestone 6 - CI/CD and Release Hardening

Deliverables:

- workspace-aware CI matrix
- release strategy (independent/locked versions) implemented
- changelog flow defined for product and packages

Exit Criteria:

- PR checks are green in monorepo mode
- release dry-run validated

## Delivery Rhythm (Suggested)

- Sprint P0: Milestone 1 + pre-work for Milestone 2
- Sprint P1: Milestones 2 and 3
- Sprint P2: Milestones 4 and 5
- Sprint P3: Milestone 6 + stabilization

## Risk Controls

1. Import-break risk:
   - Use codemod-assisted import rewrites and compile checks in each PR.
2. CI instability:
   - Enable workspace matrix incrementally and enforce pass before next wave.
3. Oversized PR risk:
   - Limit PR scope to one wave or one package extraction unit.
4. Naming/packaging ambiguity:
   - Confirm npm package naming and distribution model before CLI publication.

## Phase 0/1 readiness status

- Scope split defined for Wave 1 (must-have) vs Wave 2+ (enhancements).
- Naming decisions locked (`JumentiX`, `@jumentix/cli-init`, `jumentix@init` alias strategy).
- Branch/tag/rollback procedure documented with pre/post-wave checkpoints.
- Current -> target inventory mapping documented with blocker notes.

## Definition of Ready (per wave)

- Wave scope documented.
- Required files list defined.
- Test and rollback strategy documented.
- Acceptance criteria agreed.

## Definition of Done (per wave)

- Code merged with all required checks green.
- Documentation updated.
- Agents requirement and project todo synced.
- No unresolved blocker for next wave.
