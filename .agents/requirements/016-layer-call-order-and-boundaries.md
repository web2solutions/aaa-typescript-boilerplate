# 016 - Layer Call Order and Boundaries

## Requirement
The call chain must follow hexagonal boundaries consistently:

`Driving Adapter (HTTP/Lambda/Queue) -> Controller -> Application Use Case -> Domain Model/Policies -> Outbound Ports -> Adapters`

## Clarification
In the target implementation, controllers invoke **use cases (application layer)** directly (or via a thin application facade), not infra-built service factories.

## Guardrails
- Domain entities must not depend on infrastructure or framework classes.
- Use cases must depend on ports/interfaces, never concrete adapters.
- Repositories are outbound ports in core and implemented by infra adapters.
- Composition/wiring must happen at bootstrap/composition root only.

## Status
Active
