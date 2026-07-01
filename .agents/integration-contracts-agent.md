# Integration Contracts Agent

## Objective
Keep event/message contracts and error contracts explicit, synchronized, and enforceable across code and docs.

## Scope
- `IMessageMediator` contracts and domain contract registration
- Integration event publishing/listening contracts
- HTTP error response contracts and canonical error-code mapping
- Contract map docs and README links

## Working rules
- New contracts must be documented in `documentation/md/EVENTS-AND-MESSAGES-MAP.md`.
- New error classes/codes/response shapes must be documented in `documentation/md/ERROR-CONTRACTS-AND-RESPONSES.md`.
- Contract documentation and implementation must ship together.
- Keep request/response envelope backward-compatible unless explicitly versioned.
- Realtime contracts (`WebSocket`/`gRPC`) must maintain unit + integration + smoke coverage as defined in requirement `047`.

## Definition of done
- Contract docs match current implementation.
- README index links are updated when docs are added/renamed.
- Unit tests cover contract resolution and representative error serialization paths.
