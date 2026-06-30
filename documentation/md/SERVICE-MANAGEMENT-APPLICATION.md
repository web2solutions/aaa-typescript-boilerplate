# Service Management Application

The previous `domaindesigner` static app was consolidated into:

- `servicemangement/`

It is now a tabbed suite for service lifecycle design.

Core implementation files:

- `servicemangement/index.html`
- `servicemangement/script.js`
- `servicemangement/styles.css`
- `servicemangement/server.js`

## Tabs

1. **Domain Designer**
   - Full ER modeling MVP including:
     - domain/entity lifecycle and inspector
     - relationship anchors, bend/path controls, routing style
     - bounded-context metadata
     - aggregate + invariants
     - RBAC per entity/action
     - message contracts (`event/command/request/response`)
     - OpenAPI composition (`oneOf/allOf/anyOf`, external refs, discriminator)
     - schema diff + migration hints
     - request/response examples
     - code skeleton preview
     - export/import flows (JSON, OAS, Markdown, JSON Schema, AsyncAPI, package, boilerplate bundle)
     - mini-map and large-canvas mode
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

Detailed usage guide:

- [Domain Designer Features and Usage](./DOMAIN-DESIGNER-FEATURES-AND-USAGE.md)

## Run

PM2-served:

- `npm run dev:service-management`
- default dev profile (`npm run dev`) also starts `servicemangement` through PM2.

The app state persists with browser `localStorage`.

Recommended dev path:

1. `npm run dev:service-management`
2. Open the local Service Management URL
3. Model domains/entities
4. Run exports (OAS/AsyncAPI/JSON Schema/package)
5. Use generated artifacts as contracts for API implementation

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

## Tests

Integration smoke:

```bash
npm run test:integration:servicemangement
```

Unit smoke for roadmap feature presence:

```bash
NODE_ENV=dev npx jest test/unit/servicemangement/mvp.roadmap.features.test.ts --runInBand
```
