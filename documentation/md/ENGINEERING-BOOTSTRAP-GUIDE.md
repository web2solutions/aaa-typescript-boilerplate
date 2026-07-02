# Engineering Bootstrap Guide

This guide explains how to use this boilerplate to create a new backend service in three common shapes:

- REST API service
- Microservice (domain-focused service)
- AWS Lambda handler-based service

The goal is to help software engineers move from idea to working service with the existing architecture and conventions.

## Monorepo workspace map

Current workspace layout:

- `apps/backend-template`: runtime app ownership for backend bootstrap profiles and PM2 ecosystems.
- `apps/service-management`: service management web app and runtime server.
- `packages/*`: reusable internal packages (message mediator, SDK clients, infra adapters).
- root `src/`: incremental migration bridge while app/package ownership is finalized.

Core orchestration commands:

```bash
npm run mono:build
npm run mono:test
npm run mono:lint
npm run mono:typecheck
```

## 1. Before you start

### Runtime and tooling requirements

- Node.js `22.x`
- npm
- Redis (for mutex-related flows and integration scenarios)

### Install dependencies

```bash
npm install
```

### Run baseline checks

```bash
npm run lint
npm run test:unit
npm run oas:check-routes
```

## 2. Understand the architecture flow

The project follows this request path:

`Handler -> Controller -> Service -> Use Case -> Repository -> Adapter`

Use this rule when creating new capabilities:

- HTTP and transport concerns stay in handlers/controllers.
- Business behavior stays in services/use cases/domain models.
- Data persistence details stay in repositories/adapters.

## 3. Create a new REST API capability

### Step-by-step

1. Define or update the OpenAPI contract in `spec/`.
2. Add request handler for your selected framework adapter.
3. Add/extend controller method.
4. Implement service method and use-case function.
5. Update repository contract and implementation.
6. Add unit tests for service/use-case behavior.
7. Add integration test for the endpoint.

### Suggested checklist

- [ ] OAS operation added with clear `operationId`
- [ ] Controller method exists for operation
- [ ] Handler resolves operation to the correct controller method
- [ ] Validation covers request and required fields
- [ ] Sensitive fields are sanitized in outgoing responses
- [ ] Tests pass locally and in CI gate

## 4. Create a new microservice from this boilerplate

A practical strategy is to clone this repository and keep only the bounded context you need first, then evolve.

### Recommended approach

1. Identify the domain boundary (e.g., Billing, Inventory, Notifications).
2. Keep the base architecture structure unchanged.
3. Replace sample domain models/use cases with your domain-specific ones.
4. Keep shared infrastructure patterns (auth, validation, repository contracts, tests, CI).
5. Start with an in-memory adapter, then move to real database adapter.

### Why this works

- Keeps team conventions stable across services.
- Reduces startup time for each new microservice.
- Makes cross-service onboarding easier for engineers.

## 5. Create or extend Lambda handlers

Lambda handlers should use the same service composition as REST adapters whenever possible.

### Practical steps

1. Create handler file under lambda framework adapter path.
2. Reuse the shared service composition factory.
3. Build controller with the composed services.
4. Map Lambda event payload to domain event input.
5. Return standardized HTTP-like response object.

### Lambda quality checks

- Keep response shape consistent with existing handlers.
- Reuse centralized auth and validation logic.
- Avoid custom one-off wiring that diverges from REST composition.

## 6. Data modeling workflow (with Moon Modeler)

You can combine this boilerplate with [Moon Modeler](https://www.datensen.com/products/moon-modeler/) for faster and safer persistence design.

### Suggested workflow

1. Model entities and relations in Moon Modeler.
2. Export schema artifacts.
3. Map artifacts to domain models and repository interfaces.
4. Implement adapter for chosen persistence engine.
5. Add migration and repository tests.
6. Validate behavior through unit and integration tests.

## 7. AI-assisted workflow for faster delivery

AI tools can help accelerate repetitive engineering tasks:

- draft OAS route specs and DTOs
- draft test scenarios and edge-case matrices
- generate repository adapter scaffolding
- suggest refactors while preserving architecture boundaries

Recommended practice:

- Use AI for drafts.
- Keep final review, architecture choices, and acceptance criteria with engineers.
- Enforce correctness with lint, tests, and CI gate.

## 8. Commands you will use most often

### Development runtime

```bash
npm run dev:express
npm run dev:fastify
npm run dev:restify
npm run dev:hyper-express
npm run dev:serverless
```

### PM2 multi-app (monorepo)

```bash
npm run pm2:start:dev:restapi
npm run pm2:start:dev:websocket-rest
npm run pm2:start:dev:grpc-rest
```

These profiles start service-management alongside backend adapters using `apps/backend-template/pm2/*`.

### Quality and CI parity

```bash
npm run lint
npm run test:unit
npm run oas:check-routes
npm run build:dev
npm run ci:smoke
npm run ci:gate
npm run ci:monorepo
```

## 9. Definition of done for new features

A feature should be considered done when:

- OpenAPI contract is updated and route resolution check passes.
- Business behavior is covered by unit tests.
- Critical endpoint path has integration coverage.
- No sensitive fields leak in API responses.
- `npm run ci:gate` passes locally and in CI.

## 10. Common pitfalls to avoid

- Mixing infrastructure concerns inside domain use cases.
- Returning persistence internals (password/salt/secrets) in responses.
- Adding framework-specific logic directly in services.
- Creating diverging composition for Lambda versus REST.
- Skipping OAS route resolution checks before runtime tests.

Following the existing patterns in this boilerplate is the fastest path to consistent, maintainable delivery.
