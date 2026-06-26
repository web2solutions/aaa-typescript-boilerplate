# Architecture Alignment Plan

## Objective
Align the codebase with DDD + Event-Driven + Hexagonal Architecture and SOLID with explicit layer boundaries.

## Target call order

`HTTP/Lambda Handler -> Controller -> Use Case (Application) -> Domain + Ports -> Adapters`

## Current priority phases

1. Layer boundary hardening
- Move composition out of controllers.
- Controllers receive application use-cases/facades via composition root.
- Eliminate direct repository/service instantiation inside controllers.

2. Port-first core contracts
- Introduce outbound repository interfaces in core.
- Make use-cases depend on interfaces instead of concrete infra repository classes.
- Keep infra repository implementations behind adapter boundaries.

3. Event-first interactions
- Introduce event bus port (`publish`, `subscribe`).
- Emit domain events from use-cases where side effects cross context boundaries.
- Handle listeners in adapters/application orchestration layer.

4. Circular dependency prevention
- Reduce barrel (`index.ts`) imports in core paths.
- Use direct file imports in module internals.
- Add dependency cycle check in CI.

5. Naming and consistency pass
- Normalize naming for entities/models/DTOs/services/use-cases.
- Define one canonical vocabulary and layer ownership doc.

## Done criteria
- No controller creates repositories/services directly.
- Use-cases are primary application entry points.
- Cross-context collaboration goes through events or ports.
- CI enforces no import cycles and route resolution checks.
