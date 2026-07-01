# JumentiX Migration Inventory and Rollback

This document defines concrete migration guardrails for the JumentiX monorepo transformation.

## Scope and Wave Criteria

### Wave 1 (must-have)

- Keep current runtime behavior and public API contracts stable.
- Establish pnpm workspaces and package boundaries already scaffolded under `apps/` and `packages/`.
- Keep root compatibility scripts operational while app/package ownership is progressively moved.
- Update docs and `.agents` requirements in the same PR as code changes.

### Wave 2+ (enhancements)

- Full runtime cutover to app-owned paths (`apps/backend-template`, `apps/service-management`).
- Workspace-native CI matrix (`pnpm -r`) as default.
- Independent package release automation for reusable adapters and SDKs.

## Naming Decisions

- Product name: `JumentiX`.
- CLI package name: `@jumentix/cli-init`.
- Bootstrap command:
  - current compatibility command: `aaa-bootstrap`
  - target distribution alias strategy: `jumentix@init` (to be published via npm dist-tag/alias policy).

## Branch, Tag, and Rollback Strategy

## Branch conventions

- Mainline integration branch: `dev`.
- Migration branches by wave:
  - `codex/jumentix-wave0-guardrails`
  - `codex/jumentix-wave1-topology`
  - `codex/jumentix-wave2-foundation`
  - `codex/jumentix-wave3-packages`
  - `codex/jumentix-wave4-cli`
  - `codex/jumentix-wave5-app-rehoming`

## Release checkpoints (tags)

- Pre-wave checkpoint tag:
  - `jumentix-pre-waveX-<yyyymmdd>`
- Post-wave checkpoint tag:
  - `jumentix-post-waveX-<yyyymmdd>`

## Rollback procedure per wave

1. Identify failing wave branch and latest stable pre-wave tag.
2. Revert wave PR(s) from `dev` in reverse order if partially merged.
3. Re-run mandatory gates:
   - `npm run ci:gate`
   - `npm run coverage:patch`
4. If rollback is required in production-like branches, fast-forward only from pre-wave tag and re-apply safe commits.

## Inventory Mapping (Current -> Target)

## Apps

- `src/` + runtime bootstraps -> `apps/backend-template/src/` (staged migration with compatibility scripts).
- `service-management/` -> `apps/service-management/`.

## Packages

- `bin/aaa-bootstrap.js` + bootstrap logic -> `packages/cli-init/`.
- `src/infra/messages/*` + `src/modules/port/IMessage*` -> `packages/message-mediator/`.
- `src/infra/persistence/KeyValueStorage/*` -> `packages/key-value-storage/`.
- `src/infra/mutex/*` -> `packages/mutex-service/`.
- `src/infra/ports/persistence/IStore.ts` + `src/infra/persistence/port/IDatabaseClient.ts` -> `packages/persistence-contracts/`.
- `src/infra/persistence/external/BaseExternalDataRepository.ts` -> `packages/external-persistence-core/`.
- `src/infra/persistence/external/ExternalStoreProxy.ts` -> `packages/external-store-proxy/`.
- `src/infra/persistence/external/*.ts` concrete db adapters -> `packages/external-db-repositories/`.
- `src/infra/persistence/compileDatabaseClient.ts` -> `packages/database-client-factory/`.
- `src/interface/runtime/RuntimeEnvironment.ts` + runtime infra compiler usage -> `packages/runtime-infra/`.
- adapter bootstrap composition helpers -> `packages/adapter-runtime-bootstrap/`.
- `sdk-clients/rest|websocket|grpc` canonical sources -> `packages/sdk-*` (legacy `sdk-clients` remains compatibility bridge).

## Blockers and staged constraints

- Root path assumptions in PM2 configs and package scripts still require compatibility layer during cutover.
- CI still executes npm-root flows as baseline; pnpm recursive gate will become primary after full lockfile stabilization.
- Import aliases in `tsconfig.json` must remain dual-mapped until full source relocation is complete.
