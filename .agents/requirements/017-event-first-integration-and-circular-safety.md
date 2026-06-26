# 017 - Event-first Integration and Circular Safety

## Requirement
Prefer event publishing/listening over direct service-to-service dependency injection for cross-module integration, and avoid circular references completely.

## Why
Event-first integration reduces coupling, improves extensibility, and lowers risk of import/dependency cycles.

## Guardrails
- Cross-context side effects should be emitted as domain/integration events.
- Introduce explicit event bus port and adapter(s).
- Ban barrel imports for intra-module core paths where they create cycles.
- Add static cycle checks in CI.

## Status
Implemented for Users module (active for remaining modules)

## Notes
- Standardized event naming with `UserIntegrationEventName`.
- Added composition-time listener wiring via `registerUserEventListeners`.
- Kept cycle prevention guard in CI (`deps:check-cycles` in `ci:gate`).
