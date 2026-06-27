# 021 - Message Mediator Domain Worker Independence

## Requirement
Each domain must register and consume message contracts through `IMessageMediator` as an independent worker capability.

## Why
This keeps domain boundaries stable when evolving from modular monolith to distributed services.

## Guardrails
- Cross-domain communication is contract-based (`contract`, `payload`, `metadata`).
- Request/response and pub/sub flows use mediator ports/adapters instead of direct service coupling.
- Adapter choice (`inmemory`, `rabbitmq`, `bullmq`) must not require domain code changes.
- Handler registration belongs to composition root and remains domain-owned.

## Status
Active
