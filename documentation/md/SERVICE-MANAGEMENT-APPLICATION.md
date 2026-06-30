# Service Management Application

The previous `domaindesigner` static app was consolidated into:

- `servicemangement/`

It is now a tabbed suite for service lifecycle design.

## Tabs

1. **Domain Designer**
   - Existing ER modeling MVP (domains/entities/relationships, OpenAPI export/import, model checks).
2. **Communication Interface Designer**
   - Registers inbound interface adapters and controller mappings:
     - HTTP/REST
     - gRPC
     - WebSocket
     - SSE
3. **Service Configuration**
   - Captures runtime profile and deployment shape:
     - service kind (`REST API`, `WebSocket API + REST API`, `gRPC API + REST API`)
     - run mode
     - cloud provider
     - static assets behavior
     - runtime ports (`REST`, `WebSocket`, `gRPC`)
   - Shows PM2-oriented profile preview for VM runtime orchestration.
   - Includes runtime env controls to read/update:
     - `AAA_HTTP_FRAMEWORK`
     - `AAA_REALTIME_API`
     - `AAA_REALTIME_API_PROTOCOL`
     - `AAA_REALTIME_API_DATABASE_DRIVER`
   - Runtime env editor targets the selected environment file:
     - `dev` -> `src/config/.env.dev`
     - `staging` -> `src/config/.env.staging`
     - `ci` -> `src/config/.env.ci`
4. **Deploy Management**
   - Tracks deploy targets and runtime deployment metadata.

## Run

PM2-served:

- `npm run dev:service-management`
- default dev profile (`npm run dev`) also starts `servicemangement` through PM2.

The app state persists with browser `localStorage`.

## Runtime Env API (built-in)

- `GET /api/runtime/env?environment=dev|staging|ci`
- `POST /api/runtime/env`

The server persists approved runtime keys to files under `src/config/`.

## Runtime Edit Flow

1. Select environment in Service Configuration.
2. Click `Load Environment` to read current values from env file.
3. Change runtime keys in the form.
4. Click `Save Environment` to persist values.
5. Restart PM2 profile if runtime change affects active processes.

## Notes

- Runtime env editor intentionally limits updates to approved keys (guardrail).
- Unsupported runtime combinations are blocked by startup validation at bootstrap.

## Container Templates

Service-level container templates are provided in:

- `docker/services/`

Orchestrated profiles:

- `docker-compose-service-templates.yml`
