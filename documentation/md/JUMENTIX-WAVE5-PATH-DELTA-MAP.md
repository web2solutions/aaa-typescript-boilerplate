# JumentiX Wave 5 Path Delta Map

This map defines the path rewrites required when runtime apps are moved into workspace app folders.

## Current path anchors

### Backend runtime anchors (root-based today)

- `./src/interface/HTTP/adapters/start-rest-api.ts`
- `./src/interface/WebSocket/adapters/start-websocket-api.ts`
- `./src/interface/gRPC/adapters/start-grpc-api.ts`
- production compiled equivalents under `./.build/interface/...`

### Service Management anchor (root-based today)

- `./service-management/server.js`

## Target anchors after re-homing

### Backend template app

- `./apps/backend-template/src/interface/HTTP/adapters/start-rest-api.ts`
- `./apps/backend-template/src/interface/WebSocket/adapters/start-websocket-api.ts`
- `./apps/backend-template/src/interface/gRPC/adapters/start-grpc-api.ts`
- compiled production output under:
  - `./apps/backend-template/.build/interface/...`

### Service Management app

- `./apps/service-management/server.js`

## Files that require path rewrite

1. `apps/backend-template/pm2/ecosystem.dev.cjs`
2. `apps/backend-template/pm2/ecosystem.staging.cjs`
3. `apps/backend-template/pm2/ecosystem.production.cjs`
4. root `package.json` scripts containing:
   - `src/interface/...`
   - `.build/interface/...`
   - `service-management/server.js`
5. docs and onboarding references:
   - `README.md`
   - `documentation/md/SETUP-RUNTIME-AND-API.md`
   - `documentation/md/SERVICE-MANAGEMENT-APPLICATION.md`

## Script rewrite strategy

1. Keep root script names stable for one wave (compatibility).
2. Internally repoint scripts to `apps/*` targets.
3. Remove compatibility scripts only after CI and PM2 validation pass.

## PM2 rewrite strategy

1. Update script path for each app in all three ecosystem files.
2. Keep app names unchanged during migration wave.
3. Validate all runtime profiles before and after deployment.

## Validation checklist

- `ci:gate` green.
- PM2 dev/staging/prod startup commands green.
- Service Management UI reachable with updated path.
- REST + websocket + grpc bootstraps still load environment contracts correctly.
