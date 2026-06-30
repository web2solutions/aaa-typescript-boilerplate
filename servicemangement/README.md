# Service Management Application

`servicemangement` is a tabbed local application for engineering setup and design workflows in this boilerplate.

## Tabs

1. **Domain Designer**
   - Full ER/domain modeling MVP.
   - Domain rectangles, entity modeling, relationship design, OpenAPI export/import, model checks.
2. **Communication Interface Designer**
   - Register inbound interface adapters (`HTTP/REST`, `gRPC`, `WebSocket`, `SSE`).
   - Track framework/runtime, entrypoint, and controller mapping.
3. **Service Configuration**
   - Configure service kind (`REST API`, `WebSocket API + REST API`, `gRPC API + REST API`),
   execution model, cloud provider, static assets profile, and runtime ports.
   - Includes PM2 runtime profile preview for VM deployments.
   - Includes runtime env editor for:
     - `AAA_HTTP_FRAMEWORK`
     - `AAA_REALTIME_API`
     - `AAA_REALTIME_API_PROTOCOL`
     - `AAA_REALTIME_API_DATABASE_DRIVER`
4. **Deploy Management**
   - Register deployment targets for VMs, dedicated servers, EC2, and function providers.

## Run

This application is served via PM2:

- `/Users/eduardoalmeida/apps/apps/apps/aaa-typescript-boilerplate/servicemangement/server.js`

Commands:

- `npm run dev:service-management`
- `npm run dev` (auto-starts service management + REST profile)

## Runtime Env API

- `GET /api/runtime/env?environment=dev|staging|ci`
- `POST /api/runtime/env`

### Editable Keys

- `AAA_HTTP_FRAMEWORK`
- `AAA_REALTIME_API`
- `AAA_REALTIME_API_PROTOCOL`
- `AAA_REALTIME_API_DATABASE_DRIVER`

### Environment Mapping

- `dev` -> `src/config/.env.dev`
- `staging` -> `src/config/.env.staging`
- `ci` -> `src/config/.env.ci`
