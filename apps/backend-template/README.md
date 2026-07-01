# @jumentix/backend-template

Workspace app target for backend-template migration.

## Current status

- Transitional workspace app with executable scripts mapped to the current root runtime.
- Canonical backend runtime still remains in root (`src`, `spec`, `test`, `pm2`, `docker`, docs) during Wave 5.

## Current executable scripts

- `build` -> root `build:dev`
- `test` -> root `test:unit`
- `lint` -> root `lint`
- `dev:rest` -> root `dev:http`
- `dev:websocket-rest` -> root `dev:websocket`
- `dev:grpc-rest` -> root `dev:grpc`

## Planned cutover (Wave 5)

1. Move backend runtime files into `apps/backend-template`.
2. Keep imports wired to `@jumentix/*` shared packages.
3. Preserve CI gates and coverage thresholds.
4. Keep PM2 process profiles functional after re-homing.
