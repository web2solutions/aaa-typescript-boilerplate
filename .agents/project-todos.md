# Project Todos

This file tracks the project ownership fixes proposed before adding new features.
Keep every item in either `Done` or `Open`, and move items as they are completed.

GitHub tracking:
- Open TODO items are mirrored in GitHub Issues with label `todo-mvp`:
  - https://github.com/web2solutions/aaa-typescript-boilerplate/issues?q=is%3Aissue+is%3Aopen+label%3Atodo-mvp

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

- [x] Add realtime API test matrix (unit, integration, smoke)
  - Added protocol integration tests:
    - `test/integration/realtime/websocket.basic.integration.test.ts`
    - `test/integration/realtime/grpc.basic.integration.test.ts`
  - Added Redis multi-instance integration:
    - `test/integration/realtime/socketio.redis-streams.multi-instance.test.ts`
  - Added realtime smoke test:
    - `test/smoke/realtime/RealtimeApis.smoke.test.ts`
  - Added package scripts:
    - `test:integration:realtime*`
    - `test:smoke:realtime`
    - `smoke:realtime:redis-streams`
  - Added documentation and requirement registry sync:
    - `documentation/md/REALTIME-API-TESTING.md`
    - `.agents/requirements/047-realtime-api-test-matrix.md`

- [x] Extract generic adapters/contracts into distributable workspace packages (ongoing wave)
  - Added `@jumentix/message-mediator` package and bridged local mediator ports/adapters to package exports.
  - Added `@jumentix/key-value-storage` package and bridged local key-value clients/compiler to package exports.
  - Added `@jumentix/persistence-contracts` package for shared `IStore` + `IDatabaseClient` contracts.
  - Added `@jumentix/mutex-service` package and bridged local mutex service/port to package exports.
  - Added `@jumentix/external-persistence-core` package and migrated external repositories to import it directly.
  - Added `@jumentix/external-store-proxy` package and bridged local `ExternalStoreProxy`/`createExternalStores` exports.
  - Added `@jumentix/external-db-repositories` package and bridged all concrete external DB repositories (Mongo, Sequelize SQL, DynamoDB, Cassandra, Firebase, Aurora, RDS, Oracle).
  - Added `@jumentix/database-client-factory` package and migrated local `compileDatabaseClient` to a bridge backed by package compilers.
  - Added `@jumentix/runtime-infra` package and migrated core adapters (Express/Fastify/Restify/Hyper-Express/gRPC/WebSocket) to shared env-based runtime infra compilation.
  - Added `@jumentix/adapter-runtime-bootstrap` package and migrated adapter runtime composition (crypto/jwt/mediator/auth wiring) for Express/gRPC/WebSocket.
  - Expanded `@jumentix/adapter-runtime-bootstrap` adoption across HTTP adapters (Fastify, Restify, Hyper-Express, LoopBack, Sails, Adonis, Feathers, Derby, Total.js, Vercel Functions, Cloudflare Workers).
  - Consolidated REST adapter loader to support all implemented HTTP frameworks through `AAA_HTTP_FRAMEWORK` and aligned PM2 scripts to start via `start-rest-api` loader.
  - Normalized REST startup scripts to always set `AAA_HTTP_FRAMEWORK` explicitly (including express) for deterministic adapter selection.
  - Updated runtime docs (`RUNTIME-ENVIRONMENT-CONTRACTS`, `SETUP-RUNTIME-AND-API`) to reflect loader-based framework matrix startup.
  - Added generic loader scripts (`dev:http`, `prod:http`) for REST startup with env-driven framework resolution.
  - Updated README adapter examples to use loader-based startup for framework selection instead of non-existent per-framework start functions.
  - Updated root TypeScript path mappings for new packages to preserve compatibility while migrating.

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

## Open - JumentiX Monorepo Reorganization Plan (Execution Pending)

Goal:
- Reorganize `aaa-typescript-boilerplate` into a pnpm monorepo product named `JumentiX`, with clear package boundaries, deterministic migration waves, and low-risk rollback points.
- This section is planning-only by request. No structural migration should start until explicit execution order is provided.
- Canonical technical execution reference:
  - `documentation/md/JUMENTIX-MONOREPO-EXECUTION-PLAN.md`
  - `documentation/md/JUMENTIX-MIGRATION-INVENTORY-AND-ROLLBACK.md`

### Phase 0 - Planning Guardrails (mandatory before code moves)

- [x] Freeze migration scope and success criteria
  - Define what is in-scope for Wave 1 (must-haves) vs Wave 2+ (enhancements).
  - Lock naming decisions:
    - product: `JumentiX`
    - npm init CLI package naming strategy (`jumentix@init` request requires npm alias/registry validation).
  - Define migration policy:
    - no partial cutovers without complete functional parity in the same wave
    - docs and agents update in same wave
    - quality gates green before each merge.

- [x] Create migration branch strategy and release checkpoints
  - Branch naming convention for each wave.
  - Tagging plan before/after each destructive move.
  - Rollback procedure documented per wave.

### Phase 1 - Target Monorepo Architecture Design

- [x] Define final workspace topology (pnpm workspaces)
  - Proposed root structure:
    - `apps/`
      - `service-management` (web tool, current servicemangement)
      - `backend-template` (current backend boilerplate app form)
    - `packages/`
      - `cli-init` (current CLI evolved to install/bootstrap JumentiX projects)
      - `message-mediator` (independent npm lib)
      - `sdk-rest-client`
      - `sdk-websocket-client`
      - `sdk-grpc-client`
      - `config-ts` (shared tsconfig presets)
      - `config-eslint` (shared lint presets)
      - `config-jest` (shared test presets)
      - `shared-contracts` (optional: OpenAPI/AsyncAPI contract helpers/types)
    - `tooling/`
      - CI scripts, release scripts, changelog/quality scripts
    - `docs/` (or keep existing `documentation/` with workspace-aware index)

- [x] Map current files into destination packages/apps
  - Inventory current directories and map each one to `apps/*` or `packages/*`.
  - Mark blockers for paths that cannot be moved without import breakage.
  - Define direct import rewrites for staged migration waves.

- [ ] Define package dependency boundaries
  - Backend app imports mediator from `packages/message-mediator` (no duplicated local copies).
  - SDK packages are independent publishable libraries.
  - Service management app consumes SDK/contracts via workspace dependencies.

### Phase 2 - pnpm Foundation Setup

- [x] Add pnpm root management files
  - `pnpm-workspace.yaml`
  - root `package.json` with workspace scripts
  - shared lockfile strategy with `pnpm-lock.yaml`
  - workspace `.npmrc` policies (strict-peer-dependencies, node-linker strategy if needed).
  - Status:
    - `pnpm-workspace.yaml` created.
    - root `package.json` updated with `packageManager` and `mono:*` scripts.
    - `pnpm-lock.yaml` pending first successful online `pnpm install`.

- [x] Add root toolchain baselines
  - Node 22 enforcement across workspace (`engines`, `.nvmrc`, CI images).
  - Shared TypeScript project references strategy.
  - Shared lint/test/format scripts at root + per-package overrides.
  - Status:
    - Node 22 enforced at root (`engines`, `.nvmrc`, CircleCI node image and version checks).
    - Shared config workspaces created (`packages/config-ts`, `packages/config-eslint`, `packages/config-jest`).
    - Root monorepo orchestration scripts and quality gates centralized in root `package.json`.

- [x] Define workspace task orchestration
  - Standard scripts:
    - `pnpm -r build`
    - `pnpm -r test`
    - `pnpm -r lint`
    - selective affected execution strategy.
  - Status:
    - `mono:build`, `mono:test`, `mono:lint`, and `mono:typecheck` are available at root and use recursive workspace execution.
    - `.npmrc` now enforces workspace linking and shared lockfile behavior for deterministic package resolution.

### Phase 3 - Incremental Package Extraction Waves

- [ ] Wave A - Extract `message-mediator` as independent package
  - Move mediator ports/contracts/adapters to `packages/message-mediator`.
  - Preserve existing behavior with direct workspace import replacement in backend app.
  - Add package-level tests and publish-ready metadata.

- [ ] Wave B - Extract SDK clients into independent packages
  - Split existing `sdk-clients` into package-per-protocol.
  - Ensure each package consumes contracts from spec files and/or shared-contract package.
  - Add usage examples and API contract tests.

- [ ] Wave C - Convert current CLI into `cli-init` package
  - Keep current capabilities, then add bootstrap orchestration for:
    - backend service
    - frontend SPA/PWA offline
    - mixed backend/frontend service groups
  - Validate install/init UX (`npm install ... -g` flow requirement needs exact npm package plan).

- [ ] Wave D - Move current backend boilerplate to `apps/backend-template`
  - Keep all current capabilities (HTTP frameworks, realtime, serverless, PM2, tests, docs).
  - Replace internal references to extracted packages with workspace dependencies.

- [ ] Wave E - Move `servicemangement` to `apps/service-management`
  - Wire it to workspace packages (sdk/contracts/cli metadata where applicable).
  - Keep PM2 startup profile support.

### Phase 4 - Product-Level Feature Planning (post-structure)

- [x] Define service factory capabilities matrix
  - Monolith modular
  - Multi-service backend
  - Hybrid backend + frontend
  - Frontend-only SPA/PWA offline.
  - Progress:
    - Added `documentation/md/JUMENTIX-SERVICE-FACTORY-CAPABILITIES-MATRIX.md` with canonical factory modes, contracts, and NFR guarantees.

- [x] Define deploy target matrix and packaging contracts
  - VM/SSH, EC2, Lambda, Vercel Functions, Cloudflare Workers.
  - Backend and frontend deployment metadata contracts for Service Management.
  - Progress:
    - Added `documentation/md/JUMENTIX-DEPLOY-TARGET-AND-PACKAGING-MATRIX.md` with deploy targets, packaging contracts, and service-management metadata schema.

- [x] Define bundler/runtime templates by artifact type
  - backend service
  - frontend SPA
  - frontend SSR
  - npm lib backend
  - npm lib frontend.
  - Progress:
    - Added `documentation/md/JUMENTIX-BUNDLER-RUNTIME-TEMPLATES.md` with artifact template matrix and runtime/build enforcement rules.

### Phase 5 - CI/CD, Quality Gates, and Release Management

- [x] Refactor CI pipelines for pnpm monorepo
  - Cache pnpm store.
  - Matrix by changed workspace.
  - Keep required gates:
    - lint
    - unit/integration/smoke
    - build
    - coverage thresholds
    - route/contract checks
    - security checks.

- [ ] Enforce per-package coverage and global policy
  - Keep current strict commit/push blockers.
  - Add per-workspace thresholds with fail-fast behavior.
  - Progress:
    - Added workspace package quality gate (`workspace:check-quality`) to CI flow, enforcing required package script contracts and blocking placeholder test scripts.

- [ ] Define publishing/versioning strategy
  - Changesets or equivalent release orchestration.
  - Independent vs locked version policy per package.
  - Changelog generation per package and aggregate product changelog.
  - Progress:
    - Added `ci-cd/check-release-governance.js` and `npm run release:governance:check` to enforce release scripts + package version/publish metadata.
    - Integrated release governance check into `ci:gate`.
    - Added unit tests for release governance validation rules.

### Phase 6 - Documentation and Product Positioning Alignment

- [ ] Rename and reposition docs to `JumentiX`
  - Position documentation around JumentiX product architecture and workflows.
  - Add workspace-first onboarding guide.

- [ ] Update architecture and onboarding docs
  - Monorepo workspace map
  - package responsibilities
  - development flows
  - PM2 multi-app management in monorepo context.
  - Progress:
    - Updated `TESTING-CI-AND-QUALITY.md` with pnpm-based CI flow and strict coverage thresholds.
    - Updated `ENGINEERING-BOOTSTRAP-GUIDE.md` with workspace map, monorepo orchestration commands, and PM2 multi-app runtime guidance.

- [ ] Update agents and requirement registry
  - Add dedicated requirements for monorepo governance, package boundaries, and release policy.
  - Enforce task traceability requirement: every project issue must keep commit + PR association.

### Risk Register and Anti-Waste Controls

- [ ] Risk: package naming ambiguity (`jumentix@init`) may be invalid as npm install target
  - Mitigation: validate npm naming strategy before implementation and lock decision in Phase 0.

- [ ] Risk: breaking imports during moves
  - Mitigation: move by waves with codemod-assisted import rewrites and strict compile gates.

- [ ] Risk: CI instability due to monorepo migration
  - Mitigation: per-wave CI hardening with mandatory green gates before next wave.

- [ ] Risk: oversized PRs reduce review quality
  - Mitigation: wave-based PRs with explicit acceptance criteria and rollback tags.

### Acceptance Criteria for Starting Implementation

- [x] Final architecture map approved (apps/packages boundaries and names).
- [x] Migration wave order approved.
- [x] npm package naming/install strategy approved for CLI bootstrap.
- [ ] CI migration strategy approved (including quality gates and coverage policy).
- [ ] Rollback and release strategy approved.

### Detailed Wave Execution Backlog (Operational)

- [x] Wave 1 - Workspace Foundation
  - Deliverables:
    - `pnpm-workspace.yaml`
    - root scripts (`build`, `test`, `lint`, `typecheck`) using pnpm recursive execution
    - Node 22 enforcement and CI alignment
  - Done criteria:
    - `pnpm -r lint`, `pnpm -r test`, `pnpm -r build` all green
    - no broken local developer bootstrap flow
  - Progress:
    - workspace scaffold directories and package placeholders created in `apps/` and `packages/`.
    - recursive scripts implemented at root.
    - Node 22 enforced via root engines and CI/runtime alignment updates.
    - full pnpm recursive validation still pending due local network/package-manager instability during install bootstrap.

- [x] Wave 2 - Message Mediator Package Extraction
  - Deliverables:
    - `packages/message-mediator` with ports/contracts/adapters
    - backend-template consuming mediator via workspace dependency
  - Done criteria:
    - mediator unit tests green in package scope
    - backend app tests green after import rewrite
  - Progress:
    - contracts + in-memory adapter extracted to `packages/message-mediator`.
    - RabbitMQ and BullMQ adapters extracted to `packages/message-mediator`.
    - compile helper extracted (`compileMessageMediator`) with local bridge kept for compatibility.
    - local core mediator contracts in `src/modules/port/*` now re-export from workspace package to avoid drift.
    - local mediator adapters in `src/infra/messages/adapters` now re-export from workspace package.

- [ ] Wave 3 - SDK Package Split
  - Deliverables:
    - `packages/sdk-rest-client`
    - `packages/sdk-websocket-client`
    - `packages/sdk-grpc-client`
  - Done criteria:
    - each SDK has build/test/docs and independent package metadata
    - contract tests green against spec-driven behavior
  - Progress:
    - Created independent package source trees for REST/WebSocket/gRPC SDKs under `packages/sdk-*/src`.
    - Added package-level `build`/`typecheck` scripts and package manifests (`main`, `types`, `files`, dependencies).
    - Spec loading was localized per package with AsyncAPI/OpenAPI-driven defaults preserved.
    - Added package-level README guides with usage examples and build commands.
    - Legacy `sdk-clients/*` now acts as compatibility layer and re-exports SDK implementations from workspace packages.
    - Added explicit compatibility-bridge documentation and migration/decommission criteria.
    - SDK package `test` scripts now execute package-level typecheck to avoid placeholder/no-op tests.

- [ ] Wave 4 - CLI Productization (`cli-init`)
  - Deliverables:
    - package extraction for current CLI
    - scaffold commands for backend/frontend/hybrid service groups
  - Done criteria:
    - install/bootstrap smoke path validated end-to-end
    - docs + examples published in repository docs
  - Progress:
    - `packages/cli-init` now contains a functional bootstrap CLI entrypoint (`bin/jumentix-init.js`) and reusable implementation module (`src/bootstrap.js`).
    - root `bin/aaa-bootstrap.js` now delegates to `packages/cli-init`, reducing duplication and keeping workspace packaging aligned.
    - Added package-level CLI README and command contracts (`jumentix-init` and `aaa-bootstrap` alias).
    - Added non-interactive CLI flags and help output (`--service-type`, `--project-name`, `--git-branch`, `--install-deps`, `--repo`) to support automation pipelines.
    - CLI package test script now performs help smoke execution (`jumentix-init --help`).
    - Non-interactive scaffold smoke validated end-to-end using local repository source and generated `.aaa/service-profile.json`.

- [ ] Wave 5 - Apps Re-homing
  - Deliverables:
    - current backend boilerplate moved to `apps/backend-template`
    - `servicemangement` moved to `apps/service-management`
  - Done criteria:
    - both apps build/test/run under pnpm workspace scripts
    - PM2 startup profiles still functional
  - Progress:
    - Added migration-focused app READMEs for `apps/backend-template` and `apps/service-management` with explicit Wave 5 cutover steps.
    - Added executable cutover playbook with sequence, rollback, and acceptance criteria: `documentation/md/JUMENTIX-WAVE5-APP-REHOMING-CUTOVER.md`.
    - Replaced placeholder workspace app scripts with executable transitional scripts mapped to root runtime commands for `apps/backend-template` and `apps/service-management`.

- [ ] Wave 6 - CI/CD + Release Strategy Hardening
  - Deliverables:
    - workspace-aware CI with selective execution by affected packages/apps
    - publishing/versioning flow documented and implemented
  - Done criteria:
    - PR checks green with monorepo matrix
    - release dry-run for at least one package and one app artifact
  - Progress:
    - Added `ci-cd/check-affected-workspaces.js` and root script `npm run ci:affected` to classify changed files across `root`, `apps/*`, `packages/*`, and docs-only scopes.
    - Added unit tests for affected workspace detection and docs-only classification logic.
    - Added `ci-cd/release-dry-run.js` and root `release:dry-run*` commands to validate package publish artifacts (dry-run pack) and app workspace release readiness contracts.
    - Added `ci-cd/run-monorepo-ci.js` + `npm run ci:monorepo` with scope-based execution (docs-only lightweight checks or strict gate + affected apps/packages workflow).
    - Updated CI pipelines to execute monorepo-aware flow (`ci:monorepo`) with pnpm dependency setup in GitHub Actions and CircleCI.
