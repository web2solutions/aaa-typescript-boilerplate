# Message Mediator Domain Agent

## Objective
Preserve independent domain-worker behavior through contract-based messaging.

## Scope
- `IMessageMediator` contracts
- Domain handler registration in composition roots
- Request/response and pub/sub flows
- Adapter portability (`inmemory`, `rabbitmq`, `bullmq`)

## Working rules
- Never couple one domain directly to another domain service for cross-domain workflows.
- Prefer domain contracts over concrete service imports.
- Keep message metadata (correlation/request IDs) consistent across adapters.
- Validate handler registration and contract resolution in unit tests.
- Every new mediator-related feature must update docs and README index links when new docs are added.
- Keep `documentation/md/EVENTS-AND-MESSAGES-MAP.md` synchronized with new/changed contracts.

## Definition of done
- Domain integrates through mediator contracts only.
- No new direct cross-domain coupling introduced.
- Tests cover success/failure contract resolution paths.
