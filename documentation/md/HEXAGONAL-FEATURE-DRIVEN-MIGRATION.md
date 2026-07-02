# Hexagonal + DDD + Feature-driven Migration Plan

## Goal
Move the codebase to a feature-driven, DDD-aligned hexagonal architecture with clear separation between domain and infrastructure, minimizing change blast radius per bugfix/feature.

## Approved Target Structure

```txt
src/
  app/
  shared/
  modules/
    <feature>/
      domain/
      application/
      adapters/
        in/
        out/
      composition/
      tests/
  platform/
```

## Current-to-Target Mapping (Users module)

- Current `src/modules/Users/domain/*` -> target `src/modules/users/domain/*`
- Current `src/modules/Users/service/*` -> split:
  - application orchestration -> `application/use-cases/*`
  - domain logic -> `domain/*` (where applicable)
- Current `src/modules/Users/interface/controller/*` -> `adapters/in/http/controllers/*`
- Current `src/modules/Users/interface/restapi/frameworks/*` -> `adapters/in/http/handlers/<framework>/*`
- Current `src/modules/Users/infra/repository/*` -> `adapters/out/persistence/*`
- Current `src/modules/Users/composition/*` -> `composition/*`

## Migration Principles

1. No big-bang rewrite.
2. Keep runtime behavior unchanged in each phase.
3. Use compatibility exports during transitions.
4. Enforce boundaries in CI before large moves.
5. Prefer local feature-level edits over cross-repo edits.

## Phases

### Phase 1 - Guardrails and Canonical Namespaces
- Keep current behavior.
- Introduce canonical folders inside each module:
  - `application/use-cases`
  - `adapters/in/http/controllers`
  - `adapters/out/persistence`
- Add bridge exports to avoid breaking imports.
- Keep CI checks:
  - route resolution
  - core cycle checks
  - boundary checks

Done criteria:
- Users module has canonical folders and bridge exports.
- No runtime changes.
- `ci:gate` green.

### Phase 2 - Application Entry Consolidation
- Move controller dependencies to application ports/use-cases only.
- Remove direct service implementation imports from input adapters.
- Keep composition as single wiring point.

Done criteria:
- Controllers call only application contracts.
- No controller references repository/service implementations.

### Phase 3 - Outbound Port Normalization
- Rename repository interfaces to explicit ports (`*Port` naming).
- Move infra implementations to `adapters/out/*`.
- Keep domain/application depending only on ports.

Done criteria:
- Outbound dependencies are interface-driven.
- Infra is physically and semantically separated.

### Phase 4 - Module-by-module Rollout
- Repeat the same structure for each bounded context.
- Enforce naming and dependency rules uniformly.

Done criteria:
- All modules follow the same feature-driven hexagonal layout.

## Non-Functional Acceptance Criteria

- Bugfix scope should mostly stay within:
  - one feature module,
  - one layer pair (usually application + adapter or domain + application),
  - one local test folder.
- New features should require no global refactors in infra/framework wiring.
- CI must fail fast on:
  - boundary violations,
  - route resolution breaks,
  - cycle regressions.

## Immediate Execution Plan (next steps)

1. Create Users canonical adapter folders and bridge exports.
2. Move `interface/controller` implementation to `adapters/in/http/controllers` keeping backward-compatible re-exports.
3. Move `infra/repository` to `adapters/out/persistence` keeping backward-compatible re-exports.
4. Update imports incrementally and keep `ci:gate` green after each step.

## Progress Snapshot

- Completed:
  - Canonical namespaces created for Users (`adapters/in`, `adapters/out`, `application/use-cases`).
  - Runtime wiring now resolves controllers from canonical adapter namespace in `RestAPI`.
  - Users composition and module exports now use canonical application/repository namespaces.
  - Lambda Users create handler now imports controller from canonical adapter path.
  - `UserDataRepository` implementation moved physically to `adapters/out/persistence` with compatibility bridge on legacy path.
  - Controller implementation files moved physically from `interface/controller` to `adapters/in/http/controllers`.
  - `RestAPI` legacy controller fallback path removed; canonical adapter path is now required.
- Remaining:
  - None for the current codebase scope (Users is fully migrated in this plan).
