# Requirement 045 - Data Entity Controller Ownership

## Requirement
Each data entity must expose its own controller, with explicit responsibility boundaries and operation contracts.

## Rules

1. Do not group multiple data entities under a single controller when entity-specific use-cases exist.
2. Controller resolution (REST and realtime) must map entity routes to the entity controller.
3. Entity controller methods must align with OpenAPI/AsyncAPI operation contracts.
4. Tests must validate controller-specific RBAC/tenant scope behavior and use-case wiring.
5. Documentation and agents must be updated whenever controller ownership changes.

## Current implementation anchors

- `src/modules/Users/adapters/in/http/controllers/UserController.ts`
- `src/modules/Users/adapters/in/http/controllers/OrganizationController.ts`
- `src/interface/HTTP/RestAPI.ts`
- `src/interface/Async/RealtimeAPIBase.ts`
- `test/unit/modules/Users/interface/controller/controllers.test.ts`

## Definition of done

- Every entity operation resolves to the proper dedicated controller.
- Controllers have no mixed ownership across unrelated entities.
- Unit tests cover both user and organization controller behaviors.
- README and agents reflect controller ownership policy.
