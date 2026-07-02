# @jumentix/backend-template

Workspace app target for backend-template migration.

## Current status

- Transitional workspace app with executable scripts mapped to the current root runtime.
- Canonical backend runtime still remains in root (`src`, `spec`, `test`, `pm2`, `docker`, docs) during Wave 5.

## Current executable scripts

- `build` -> root `build:dev`
- `build:dev` -> root `build:dev`
- `test` -> root `test:unit`
- `test:unit` -> root `test:unit`
- `test:integration` -> root `test:integration`
- `test:integration:smoke` -> root `ci:smoke`
- `lint` -> root `lint`
- `coverage:patch` -> root `coverage:patch`
- `ci:gate` -> root `ci:gate`
- `ci:gate:strict` -> root `ci:gate:strict`
- `dev:rest` -> root `dev:http`
- `dev:websocket-rest` -> root `dev:websocket`
- `dev:grpc-rest` -> root `dev:grpc`
- `pm2:start:*` -> root PM2 profile starters for dev/staging/production

## Planned cutover (Wave 5)

1. Move backend runtime files into `apps/backend-template`.
2. Keep imports wired to `@jumentix/*` shared packages.
3. Preserve CI gates and coverage thresholds.
4. Keep PM2 process profiles functional after re-homing.

## Wave 5 progress

- Service Management app has already been re-homed to `apps/service-management`.
- Backend-template now owns an operational script surface in workspace context, so pipelines can call app-level commands while code still resides at root.
- Next slice is physical runtime move (`src/spec/test/pm2`) with path rewrites and PM2 parity validation.
