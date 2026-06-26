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

## Open

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
