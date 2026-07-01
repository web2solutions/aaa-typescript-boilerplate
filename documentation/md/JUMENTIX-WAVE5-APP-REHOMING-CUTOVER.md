# JumentiX Wave 5 App Re-homing Cutover

This document is the executable cutover guide for moving runtime apps into workspace app boundaries.

## Scope

- Move backend runtime from repository root to `apps/backend-template`.
- Move Service Management app from `/servicemangement` to `apps/service-management`.
- Preserve current behavior, PM2 profiles, CI gates, and coverage policy.

## Preconditions

1. Wave 3 and Wave 4 code is merged (SDK/CLI ownership stabilized).
2. `@jumentix/*` shared packages compile and are imported by compatibility bridges.
3. Node runtime is `22.23.1` in CI and local validation environment.

## Cutover sequence

Path rewrite companion:

- `documentation/md/JUMENTIX-WAVE5-PATH-DELTA-MAP.md`

### Step 1 - Backend app file move

Move these root directories into `apps/backend-template`:

- `src/`
- `spec/`
- `test/`
- `pm2/`
- `seed/`
- `serverless.ts`
- `docker-compose*.yml`

Keep shared root assets in root:

- `.agents/`
- `documentation/`
- `packages/`
- `tooling/`
- workspace-level config files (`pnpm-workspace.yaml`, root `package.json`, root lockfile).

### Step 2 - Service Management move

Move:

- `/servicemangement/*` -> `apps/service-management/*`

Update all runtime references:

- package scripts
- PM2 app paths
- docs links

### Step 3 - Import path and config rewrite

1. Rewrite absolute aliases and tsconfig paths where paths still assume root runtime.
2. Ensure test rootDir/moduleNameMapper paths resolve from app workspace.
3. Keep backward compatibility wrappers where necessary for one wave.

### Step 4 - PM2 and runtime validation

Validate all profiles after path migration:

- dev
- staging
- production

Required process checks:

- RESTAPI
- websocketAPI + RESTAPI
- grpcAPI + RESTAPI
- service-management app process

### Step 5 - CI gate validation

Minimum required green checks:

- lint
- unit tests
- selected integration smoke
- OAS route resolution
- build
- coverage threshold gate
- security smoke

### Step 6 - Bridge cleanup decision

After successful cutover:

1. keep compatibility wrappers for one stabilization wave, or
2. remove wrappers in dedicated cleanup PR.

## Rollback plan

If any step fails:

1. Revert only the failing wave PR scope.
2. Restore original PM2 paths.
3. Re-run `ci:gate` and coverage checks.
4. Resume with narrower move batches (backend then service-management separately).

## Acceptance criteria

1. `apps/backend-template` runs API runtime with unchanged external behavior.
2. `apps/service-management` runs unchanged UI/server behavior.
3. PM2 profiles run successfully with new app paths.
4. CI gates and coverage thresholds remain green.
5. README/docs/agents reflect final app locations.
