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

- [ ] Clean route/spec fragility
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
