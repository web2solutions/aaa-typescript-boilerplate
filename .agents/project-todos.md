# Project Todos

This file tracks the project ownership fixes proposed before adding new features.
Keep every item in either `Done` or `Open`, and move items as they are completed.

## Done

- [x] Fix the build
  - `fastify@5.0.0` plus the previous TypeScript setup broke `npm run build:dev`.
  - Resolved by restoring a compatible TypeScript build path.

- [x] Fix service dependency wiring
  - `BaseService.ts` assigned `this.services = config.repos ?? {}` instead of `config.services`.
  - Fixed dependency injection wiring so services receive the intended dependencies.

- [x] Normalize singleton factories
  - `compile()` cached singleton instances in services, repos, auth, providers, and controllers.
  - Removed stale singleton state so factory calls return fresh instances with current dependencies.

- [x] Establish contract-based message mediator adapters
  - Added mediator ports/contracts and in-memory adapter behavior for request/response + pub/sub.
  - Added RabbitMQ and BullMQ adapter implementations with runtime selection via environment.
  - Ensured domain-owned handler registration so each domain behaves as an independent worker capability.

- [x] Align `DocumentValueObject` with DDD value-object behavior
  - Added explicit constructor invariants and type validation.
  - Added normalization (`type`, `countryIssue`, `data`) and immutable fields.
  - Kept structural compatibility with existing DTO and integration test flows.

- [x] Expand domain entity/model documentation granularity
  - Added domain-specific docs for Users model, entity contract, and value objects.
  - Linked domain docs from README glossary index.

- [x] Enforce native runtime ownership for new HTTP adapters
  - Cloudflare Workers and Vercel Functions now run in serverless-style adapters.
  - Additional framework adapters were aligned to framework-native runtime bootstraps.

- [x] Add integration contracts and error contracts maps
  - Added `documentation/md/EVENTS-AND-MESSAGES-MAP.md`.
  - Added `documentation/md/ERROR-CONTRACTS-AND-RESPONSES.md`.
  - Linked both documents in README glossary index.

- [x] Enforce controller ownership per data entity
  - Split organization operations from `UserController` into a dedicated `OrganizationController`.
  - Updated REST and Realtime controller resolution to map `organizations` to `OrganizationController`.
  - Updated controller tests to validate separated ownership and behavior.

- [x] Refactor external database client compilation and add smoke validation matrix
  - `compileDatabaseClient` now uses explicit external store proxies for non-in-memory drivers (fail-fast mapping).
  - Added dedicated `OracleRepository` connector and expanded external repository coverage.
  - Added smoke tests for each supported database driver.
  - Added per-database Docker compose files and package scripts (`docker:up:*`, `docker:down:*`, `smoke:db:*`).
  - Updated env examples and documentation for driver-specific configuration keys.
  - Extended bootstraps for gRPC, WebSocket, and Lambda runtime to inject `compileDatabaseClient()` based on `AAA_DATABASE_DRIVER`.
  - Expanded `ExternalStoreProxy` to provide `IStore` mapping for Mongo, Sequelize-based SQL drivers, DynamoDB, Cassandra, Firebase, and Oracle.

## Open

- [x] PCI Remediation Plan (Sprint-based: P0/P1/P2) with audit evidence criteria
  - [x] P0 - Access control and auth hardening
    - Tasks:
      - Enforce tenant scope checks in `UserController` for user and organization operations.
      - Add auth lockout/revocation paths in `AuthService` with key-value storage support.
      - Keep internal error details visible in `dev/staging` and masked in `production`.
    - Audit evidence:
      - Unit evidence: `test/unit/modules/Users/interface/controller/controllers.test.ts`.
      - Unit evidence: `test/unit/modules/Users/service/AuthService.branches.test.ts`.
      - Runtime evidence: adapter-level error payload builders use environment-aware masking.

  - [x] P0 - Security baseline for transport and headers
    - Tasks:
      - Restrict CORS with allowlist strategy via env (`AAA_CORS_ALLOWED_ORIGINS`).
      - Ensure helmet is active in REST adapters where supported.
    - Audit evidence:
      - Config evidence: `src/config/security.ts`.
      - Adapter evidence: `ExpressServer.ts`, `FastifyServer.ts`.
      - Lint + unit gate green.

  - [x] P1 - Authentication contract compatibility + secure defaults
    - Tasks:
      - Keep backward-compatible auth behavior for existing clients/tests.
      - Add environment-driven controls for Basic auth and login lockout.
      - Add JWT issuer/audience checks and deterministic token-id strategy for revocation support.
    - Audit evidence:
      - Unit evidence: `AuthService.test.ts` + `AuthService.branches.test.ts`.
      - Config evidence in `.env.dev`, `.env.ci`, `.env.staging`, and loader.

  - [x] P1 - Test and coverage hardening for compliance-critical paths
    - Tasks:
      - Add branch tests for tenant scope denial/allow, mediator authorization errors, and metadata propagation.
      - Add branch tests for auth lockout, revocation, environment masking, and logout edge cases.
    - Audit evidence:
      - `npm run test:unit` passing with strict global thresholds.
      - Coverage gate evidence from Jest output (global threshold enforcement satisfied).

  - [x] P2 - PCI operational controls (remaining)
    - Tasks:
      - [x] Add explicit audit log persistence adapter for auth and privileged actions.
      - [x] Add production runbook artifacts for key rotation, incident response, and retention policy.
      - [x] Add security smoke tests in CI for production-env masking and CORS deny cases.
    - Audit evidence:
      - New runbook/docs under `documentation/md`.
      - CI jobs and artifacts in pipeline logs proving controls are executed.
      - `npm run ci:security-smoke` executed inside `npm run ci:gate`.
      - `InMemorySecurityAuditRepository` and `AuthService` audit tests are green.

- [x] Program Increment - Environment-driven adapter startup and runtime env editing
  - Objective: make REST/Realtime adapter startup fully environment-driven and editable from Service Management.
  - Scope:
    - separated startup adapters for `src/interface/WebSocket/adapters/` and `src/interface/gRPC/adapters/`
    - PM2 starts realtime APIs in separated processes
    - env variables govern adapter selection and realtime startup behavior
    - Service Management reads/updates active env file values across Windows/macOS/Linux

  - [x] Phase 1 - Runtime env contract
    - Add and document new env keys in all `src/config/.env*` files:
      - `AAA_HTTP_FRAMEWORK` (default `express`)
      - `AAA_REALTIME_API` (default `no`)
      - `AAA_REALTIME_API_PROTOCOL` (default `websocket`)
      - `AAA_REALTIME_API_DATABASE_DRIVER` (`Mongo`, `PostgreSQL`, `MySQL`, `MS SQL`, `RDS`, `Aurora`, `Cassandra`)

  - [x] Phase 2 - Startup adapter separation
    - Create dedicated startup adapter files:
      - `src/interface/WebSocket/adapters/start-websocket-api.ts`
      - `src/interface/gRPC/adapters/start-grpc-api.ts`
    - Keep protocol-specific bootstraps isolated and independently PM2-runnable.

  - [x] Phase 3 - Env-driven startup loaders
    - Add REST startup loader using `AAA_HTTP_FRAMEWORK`.
    - Add realtime startup gate using:
      - `AAA_REALTIME_API`
      - `AAA_REALTIME_API_PROTOCOL`
    - Ensure PM2 profiles call startup loaders and keep processes separated.

  - [x] Phase 4 - Service Management env read/write
    - Add backend API in `servicemangement/server.js` to:
      - read active env values
      - update and persist values in selected env file
    - Add Service Management UI controls to display/edit/save these env variables.

  - [x] Phase 5 - Tests, docs, agents sync
    - Add unit coverage for new TS startup loaders and env gates.
    - Update runtime and Service Management docs.
    - Register requirement in `.agents/requirements`.
    - Keep `ci:gate` and patch coverage threshold green.
  - [x] Phase 6 - Detailed runtime documentation hardening
    - Add dedicated runtime environment contract document.
    - Expand README and setup docs with startup entrypoints and env API examples.
    - Add governance requirement to keep runtime docs and implementation synchronized.

- [x] Program Increment - PM2 runtime orchestration + Service Configuration runtime profiles
  - Objective: enforce PM2 as the process manager for VM-based environments (dev/staging/prod), with explicit service profiles:
    - `RESTAPI`
    - `websocketAPI + RESTAPI`
    - `grpcAPI + RESTAPI`
  - Mandatory constraints:
    - gRPC, WebSocket, and REST run as separate PM2 processes in VM environments.
    - `servicemangement` must also be served through PM2.
    - Dev environment must auto-start `servicemangement` via PM2.

  - [x] Phase 1 - PM2 dependency + baseline process management scripts
    - Install `pm2` in project dependencies.
    - Add package scripts for PM2 lifecycle (`start`, `stop`, `restart`, `logs`, `delete`) and environment-aware boot commands.
    - Replace direct adapter boot scripts (`node`/`nodemon` against adapter entrypoints) with PM2-driven scripts.

  - [x] Phase 2 - Environment PM2 ecosystem configuration
    - Add PM2 ecosystem files for:
      - `dev`
      - `staging`
      - `production`
    - Include process definitions for:
      - REST API adapter process
      - WebSocket API adapter process
      - gRPC API adapter process
      - Service Management UI process
    - Ensure separated ports and environment variables are explicit per process.

  - [x] Phase 3 - Runtime decoupling for separated VM processes
    - Adjust WebSocket/gRPC adapter bootstrap behavior so REST fallback can be disabled when PM2 runs REST as an independent process.
    - Preserve compatibility for fallback mode where required.
    - Add/adjust unit tests to keep coverage and branch guarantees for bootstrap behavior.

  - [x] Phase 4 - Service Management UI: service-type selection aligned to runtime profiles
    - Update Service Configuration tab to allow selecting:
      - REST API
      - WebSocket API + REST API
      - gRPC API + REST API
    - Expose profile/port preview with PM2-oriented runtime hints for developers.

  - [x] Phase 5 - Documentation + agents sync
    - Update README and runtime/setup docs with PM2 workflow and new service profile behavior.
    - Register a new `.agents/requirements` entry for PM2 VM orchestration and profile separation.
    - Keep requirement index and project TODOs synchronized.

  - [x] Acceptance criteria
    - `npm run ci:gate` passes.
    - `npm run coverage:patch` remains above required threshold.
    - PM2 configs exist and can start declared profiles in dev/staging/prod.
    - `servicemangement` is served via PM2 and included in dev startup flow.

- [x] Program Increment - Service Bootstrap CLI + Service Management Suite
  - Objective: evolve the boilerplate into an npm-installable scaffolding CLI plus a unified service management application.
  - Global acceptance criteria: no partially wired feature without docs and at least one automated validation path.

  - [x] Phase 1 - OpenAPI port-object governance
    - Ensure `spec/1.0.0.yml` has explicit input/output port objects with descriptions.
    - Add CI validation so each endpoint operation points to request/response schemas and those schemas are documented.
    - Acceptance: `npm run oas:check-routes` fails on missing contract docs and passes for valid contract coverage.

  - [x] Phase 2 - Standalone scaffolding CLI
    - Create an npm-installable bootstrap CLI that clones and configures a new workspace from this repository.
    - Service templates: REST, WebSocket, gRPC, GraphQL, Functions bundle (AWS/Google/Azure/Vercel/Cloudflare).
    - Acceptance: CLI can scaffold project metadata + initial runtime profile by selected service type.

  - [x] Phase 3 - Persistence and messaging adapter foundations
    - Add repository classes/ports for Sequelize SQL (PostgreSQL/MySQL/SQL Server/Oracle/SQLite), Mongoose, DynamoDB, Cassandra, Firebase, Aurora/RDS.
    - Add queue request-response repository adapter abstraction with BullMQ and RabbitMQ compatibility.
    - Acceptance: classes compile, expose consistent contracts, and have initialization smoke tests.

  - [x] Phase 4 - Service management UI consolidation
    - Rename `domaindesigner` folder to `servicemangement`. (completed)
    - Deliver tabbed app with:
      - Domain Designer
      - Communication Interface Designer
      - Service Configuration
      - Deploy Management
    - Acceptance: all tabs render and keep Domain Designer MVP fully operational.

  - [x] Phase 5 - Container assets
    - Add Docker assets for the required service dependencies.
    - Expose npm scripts for local startup of support infrastructure.
    - Acceptance: declared compose stacks start successfully in local development.

  - [x] Phase 6 - Documentation and agents synchronization
    - Update README/index and detailed docs for CLI + Service Management + adapter foundations.
    - Register new requirements under `.agents/requirements`.
    - Acceptance: docs and requirements are aligned with delivered code paths.

  - [x] Phase 7 - Coverage and gate hardening
    - Add tests for new CLI and contract validations.
    - Keep strict gate green (`ci:gate:strict`).
    - Acceptance: full local gate passes with current thresholds.

- [x] Fix user persistence correctness
  - `UserStoreAPI.ts` should remove unique indexes on delete.
  - Username updates need duplicate checks.
  - `getAll()` currently paginates before filtering and reports the unfiltered total size.

- [x] Prevent password/salt leaks
  - Some paths sanitize `password` and `salt`, while others can serialize them back out through `getAll`, `updatePassword`, and related flows.
  - Centralize output DTO shaping so secrets never leave the service boundary.

- [x] Fix mutex response inconsistency
  - `MutexService.lock()` returns different result shapes depending on lock state.
  - Callers currently check both `previouslyLocked` and `wasAlreadyLocked`.
  - Standardize on one response contract everywhere.

- [x] Clean route/spec fragility
  - OpenAPI `operationId` and paths dynamically load files and controller methods.
  - Add tests or validation that every spec operation resolves to a handler and controller method.
  - Run this validation before runtime tests.

- [x] Fix scripts/docs drift
  - `prod:*` scripts use `.buid` in several paths instead of `.build`.
  - `README.md` has duplicated or mistyped run commands.
  - `test:integration:hyper-express` path casing may not reliably match the actual folder.

- [x] Bring Lambda closer to shared composition
  - Lambda handlers are hand-wired and can drift from `RestAPI`.
  - Reuse shared composition or create a small Lambda factory around the same controller and service setup.

- [x] Add a minimal CI gate
  - Required before features: lint, unit tests, selected integration smoke, OpenAPI route resolution check, and build once dependency mismatch is fixed.

- [ ] Reach and sustain minimum 95% coverage
  - Enforce 95% as standard in Jest global `coverageThreshold`.
  - Enforce 95% targets in Codecov project/patch status.
  - Raise current tests to reach and keep the threshold.

- [ ] Enforce architecture NFR consistency across layers
  - Align implementation to DDD + EDA + Hexagonal Architecture + SOLID.
  - Keep explicit ownership for domains, entities, ports, adapters, repositories, services, use cases, controllers, and handlers.
  - Progress: CI now enforces `arch:check-boundaries` for controller-layer anti-patterns.
  - Progress: README and migration docs now reflect canonical feature-driven hexagonal structure and active guardrails.

- [x] Normalize layer call order
  - Ensure driving adapters/controllers call application use-cases as the entry point.
  - Avoid controller-level service/repository instantiation.
  - `UserController` and `AuthController` now call `UserUseCases` and `AuthUseCases` from composition.
  - `RestAPI` and Lambda wiring now resolve Users through shared composition/use-case instances.

- [x] Prefer event-first integration and prevent circular references
  - Introduce/standardize event publishing/listening for cross-module integration.
  - Remove cycle-prone imports and add CI checks for dependency cycles.
  - Introduced `IEventBus` port and `InMemoryEventBus` adapter, with user lifecycle event publishing in `UserService`.
  - Standardized Users integration event names (`UserIntegrationEventName`).
  - Added composition-level listener registration (`registerUserEventListeners`) and unit tests.

- [x] Keep documentation and architecture structure synchronized
  - README rebuilt with updated architecture, CI gate, and structure sections.
  - Added requirement `018-project-documentation-and-structure-sync`.
  - Added requirement `019-domain-data-entity-documentation-standard`.

- [x] Create domain data entity documentation agent and catalog
  - Added `.agents/data-entity-documentation-agent.md`.
  - Added detailed catalog `documentation/md/DOMAIN-DATA-ENTITIES.md` with field/type/format/validation mappings.

- [x] Add multi-tenancy and RBAC foundation
  - Added baseline roles (`superadmin`, `admin`, `user`) with centralized role policy.
  - Enforced organization membership for tenant-scoped roles (`admin`, `user`).
  - Added Users domain organization field propagation to token/auth/service paths.

- [x] Introduce Users `Organization` entity and supporting artifacts
  - Added domain entity/model, DTOs, repository port/adapter, service and use-cases.
  - Added in-memory store support and composition wiring.
  - Added tests and documentation updates.

- [x] Add generic `AddressValueObject` and domain relationship metadata helpers
  - Added `AddressValueObject` and `EAddressType`.
  - Added `belongsTo` / `hasMany` relationship metadata utilities for adapter portability.

- [x] Rework in-memory persistence to better reflect relational/NoSQL adapter behavior
  - Added generic `InMemoryRelationalStore` with unique indexes, relation lookup, and stable pagination/filter semantics.
  - Updated user and organization stores to use shared behavior.

- [x] Enforce canonical entity timestamps and domain-object mutation API
  - Standardized entity serialized fields to `createdAt`/`updatedAt`.
  - Added explicit `create/update/delete` methods for `Organization` value-object arrays (`address`, `phone`, `email`).
  - Updated OpenAPI `User` and `Organization` schemas with required lifecycle timestamps.
  - Synchronized domain documentation and requirement registry with these rules.

## Domain Designer MVP Backlog

### Done (MVP ideas already delivered)

- [x] Visual domain canvas with color-coded domain rectangles
- [x] Entity lifecycle on canvas (`create`, `rename`, `delete`, `duplicate`, `move`)
- [x] Relationship lifecycle (`create`, `edit`, `delete`, pick-on-canvas mode)
- [x] Relationship productivity helpers
  - Smart relationship naming
  - Auto-FK generation for `1:N` and `N:1`
  - N:N junction auto-entity generation
  - Reverse selected relationship direction/cardinality
- [x] Field editor baseline
  - Field flags (`required`, `PK`, `FK`, `unique`, `nullable`)
  - OpenAPI-oriented field type selection
  - Reusable field templates (`tenantRef`, `auditTrail`, `softDelete`, `contactPack`)
- [x] OpenAPI 3.1 integration baseline
  - Export schemas + relation metadata
  - Export CRUD path skeletons per entity
  - Import entities from `components.schemas`
  - Preserve field-level OpenAPI constraints in import/export path
- [x] Navigation and interaction UX
  - Pan/zoom/fit/reset
  - Compact view toggle
  - Snap-to-grid toggle
  - Keyboard nudge for entities
  - Undo/redo history
  - Relationship routing style switch (`Curved` / `Orthogonal`)
- [x] Model quality guardrail
  - Built-in model checks (duplicates, PK missing, relation consistency)
  - Clickable check issues that focus affected entity
- [x] Inspector productivity
  - CRUD endpoint preview (path + operationId) for selected entity
- [x] Anchor-based drag-and-drop relationship connectors
  - Added edge anchor controls (`top`, `right`, `bottom`, `left`) on entity cards.
  - Added drag-preview edge and anchor-to-anchor relationship creation.
- [x] Domain-level bounded-context metadata editor
  - Added context metadata fields per domain:
    - ubiquitous language
    - owner team
    - upstream/downstream dependencies
    - integration channel
- [x] Relationship label positioning controls
  - Added relationship label offset editor (`x` / `y`) and reset action in inspector.
- [x] Aggregate root and invariant editor
  - Added aggregate-root marker per entity and invariant rules editor in inspector.
  - Aggregate root entities now show visual `AR` badge in entity header.
- [x] Schema diff and migration preview
  - Added local baseline save/clear and schema diff comparison.
  - Added migration hints for entity/field/relationship create-drop-alter changes.
- [x] Validation severity levels and quality gates in designer
  - Added severity levels (`error`, `warn`, `info`) in model check results.
  - Added configurable export gate to block export when critical issues exist.
- [x] RBAC policy mapping UI per entity/action
  - Added action-level role mapping (`list/getById/create/update/delete`) with tenant scope toggle.
  - Added RBAC policy preview and model-check warnings for missing action permissions.
- [x] Event/message contract designer connected to entities
  - Added action panel to create/edit/remove `event`, `command`, `request`, and `response` contracts.
  - Added contract payload schema editing and OpenAPI export extension (`x-message-contracts`).
- [x] Code generation preview pane
  - Added generated skeleton preview for model/repository/use-case/controller/handler.
  - Supports selected-entity preview or full-canvas concatenated preview.
- [x] Pluggable exporters baseline
  - Added Markdown exporter in addition to JSON and OpenAPI exports.
- [x] Advanced OpenAPI composition controls
  - Added entity-level `oneOf` / `allOf` / `anyOf` composition editor with schema refs list.
  - Composition is exported into generated OAS schemas.
- [x] Collaborative model package support (baseline)
  - Added domain package export/import flow from Domain Designer export panel.
  - Supports reusable domain package import into current model canvas.
- [x] Request/response example generator from entity schema
  - Added generated request/response example preview for selected entity or whole canvas.
  - Supports create/update request and response payload examples.
- [x] Additional pluggable exporter target (JSON Schema)
  - Added JSON Schema exporter button in Domain Designer export panel.
- [x] Advanced relationship path controls
  - Added bend point controls (`bendX`, `bendY`) and anchor behavior mode (`auto`, `center`).
- [x] Entity templates and scaffolding packs by pattern
  - Added `crudAggregate`, `eventSourced`, `referenceData`, and `tenantOwned` entity templates.
- [x] More pluggable exporter targets
  - Added AsyncAPI exporter and boilerplate bundle exporter.
- [x] Expanded advanced OpenAPI controls
  - Added external `$ref` list support and discriminator configuration.
- [x] Expanded collaborative package support
  - Added package dependencies and shared value-object metadata for bounded context.
- [x] Visual mini-map and large-canvas performance mode
  - Added mini-map navigation and large-canvas mode for simplified rendering.
- [x] Starter e2e/smoke test coverage for `servicemangement`
  - Added smoke tests for create/edit/export/import workflow controls.

### Open (next MVP ideas to prioritize)

Backlog sync status:
- Synced with `documentation/md/DOMAIN-DESIGNER-MVP-ROADMAP.md` open priorities.

- [x] Expanded collaborative package support further
  - Added package dependency normalization and shared value-object deduplication in package import/save flow.

- [x] Roadmap MVP completed
  - All planned Domain Designer MVP roadmap items implemented.
