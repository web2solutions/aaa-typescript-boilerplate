# AnyWhere, AnyHow, AnyTime - TypeScript Boilerplate

`The ultimate boilerplate to build REST APIs, monolithic modular and microservice applications with TypeScript.`

Applications built with this boilerplate aim to run `Anywhere, Anytime, Anyhow`: on `dedicated servers`, `virtual machines`, `containers`, `EC2`, `ECS`, and `lambdas`, using `Express`, `Fastify`, `Restify`, `Hyper-Express`, and `serverless`.

| Security scan status | Tests in Main | Tests in Dev | Coverage in Main | Coverage in Dev |
|----------------------|:-------------:|:------------:|:----------------:|----------------:|
| [![Known Vulnerabilities](https://snyk.io/test/github/web2solutions/aaa-typescript-boilerplate/badge.svg)](https://snyk.io/test/github/web2solutions/aaa-typescript-boilerplate) | [![CircleCI](https://dl.circleci.com/status-badge/img/gh/web2solutions/aaa-typescript-boilerplate/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/web2solutions/aaa-typescript-boilerplate/tree/main) | [![CircleCI](https://dl.circleci.com/status-badge/img/gh/web2solutions/aaa-typescript-boilerplate/tree/dev.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/web2solutions/aaa-typescript-boilerplate/tree/dev) | [![codecov](https://codecov.io/gh/web2solutions/aaa-typescript-boilerplate/graph/badge.svg?token=eEF1QUBbj9)](https://codecov.io/gh/web2solutions/aaa-typescript-boilerplate) | [![codecov](https://codecov.io/gh/web2solutions/aaa-typescript-boilerplate/branch/dev/graph/badge.svg?token=eEF1QUBbj9)](https://codecov.io/gh/web2solutions/aaa-typescript-boilerplate) |

[![Run with Express](https://img.shields.io/badge/Run%20with%20Express-gold?style=flat-square&logo=JavaScript&logoColor=000)](https://expressjs.com/)
[![Run with Fastify](https://img.shields.io/badge/Run%20with%20Fastify-gold?style=flat-square&logo=JavaScript&logoColor=000)](https://fastify.dev/)
[![Run with Restify](https://img.shields.io/badge/Run%20with%20Restify-gold?style=flat-square&logo=JavaScript&logoColor=000)](http://restify.com/)
[![Run with HyperExpress](https://img.shields.io/badge/Run%20with%20HyperExpress-gold?style=flat-square&logo=JavaScript&logoColor=000)](https://github.com/kartikk221/hyper-express)
[![Run with Serverless](https://img.shields.io/badge/Run%20with%20Serverless-gold?style=flat-square&logo=JavaScript&logoColor=000)](https://www.serverless.com/)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=web2solutions_aaa-typescript-boilerplate&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=web2solutions_aaa-typescript-boilerplate)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=web2solutions_aaa-typescript-boilerplate&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=web2solutions_aaa-typescript-boilerplate)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=web2solutions_aaa-typescript-boilerplate&metric=bugs)](https://sonarcloud.io/summary/new_code?id=web2solutions_aaa-typescript-boilerplate)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=web2solutions_aaa-typescript-boilerplate&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=web2solutions_aaa-typescript-boilerplate)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/web2solutions/aaa-typescript-boilerplate)
![GitHub License](https://img.shields.io/github/license/web2solutions/aaa-typescript-boilerplate)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
![GitHub Created At](https://img.shields.io/github/created-at/web2solutions/aaa-typescript-boilerplate)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/web2solutions/aaa-typescript-boilerplate)
![GitHub package.json version](https://img.shields.io/github/package-json/v/web2solutions/aaa-typescript-boilerplate)
![Made in Brazil with Love](https://img.shields.io/badge/made%20in-%F0%9F%87%A7%F0%9F%87%B7%20Brazil%20with%E2%9D%A4%EF%B8%8F-blue)
[![#StandWithUkraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://vshymanskyy.github.io/StandWithUkraine)

## Overall Code Coverage

[![codecov](https://codecov.io/gh/web2solutions/aaa-typescript-boilerplate/graphs/tree.svg?token=eEF1QUBbj9)](https://codecov.io/web2solutions/aaa-typescript-boilerplate)

## See It Running (Fastify)

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/web2solutions/aaa-typescript-boilerplate)

## Purpose of This Project

This boilerplate provides a production-oriented starting point for backend teams that need to ship quickly without sacrificing architecture quality.

It is built on a pragmatic interpretation of:

- Hexagonal Architecture
- Domain Driven Design (DDD)
- Event Driven Architecture (EDA)

It aims to stay framework-agnostic at the core and can be used for:

- modular monoliths
- microservices
- lambda-first services

## Advantages and Example Applications

### Why this boilerplate is useful

1. Architectural consistency:
   teams start with clear boundaries (handlers, controllers, application use cases, services, repositories, adapters) instead of inventing structure per project.
2. Runtime flexibility:
   the same domain can run with Express/Fastify/Restify/Hyper-Express or Lambda.
3. Easier evolution:
   projects can start as modular monolith and split later with lower refactor cost.
4. Quality baseline:
   lint, tests, OpenAPI checks, route resolution checks, and CI gate are built-in.
5. Better onboarding:
   engineers follow existing conventions and guardrails from day one.

### Example applications

- User and identity services (registration, login, authorization, profile lifecycle).
- Billing/subscriptions APIs with domain policies and events.
- Internal backoffice APIs with strict OpenAPI contract validation.
- Event-driven services exposing operational HTTP endpoints.
- Hybrid API/Lambda workloads sharing the same domain logic.

## How This Project Accelerates New Application Development

- Architecture is already defined and evolving with explicit guardrails.
- Adapter strategy is ready, so runtime switching is incremental.
- Auth/validation/OpenAPI workflows are standardized.
- Repository abstractions allow in-memory start and later DB migration.
- CI checks block common regressions before merge.

Suggested flow:

1. Clone/fork the project.
2. Define your domain + OpenAPI contract.
3. Implement/extend use cases and repositories.
4. Expose endpoints through controllers/handlers.
5. Run `ci:gate` locally before PR.
6. Deploy as server, lambda, or both.

## Integrating AI and Data Modeling Tools (Moon Modeler)

This project can be combined with AI-assisted development and tools such as [Moon Modeler](https://www.datensen.com/products/moon-modeler/).

### AI-assisted possibilities

- Generate initial OpenAPI drafts from product requirements.
- Propose DTOs, validation rules, and test templates.
- Assist migration from in-memory adapters to SQL/NoSQL adapters.
- Generate regression scenarios from incidents.
- Suggest architecture-safe refactors.

### Moon Modeler integration possibilities

1. Model entities and relationships in Moon Modeler.
2. Export schema artifacts.
3. Map models to domain entities and repository ports.
4. Implement database adapters.
5. Keep OpenAPI schemas aligned with domain contracts.
6. Validate with CI checks and tests.

### Combined AI + Moon Modeler + Boilerplate workflow

1. Product requirements and constraints.
2. Domain/data modeling.
3. AI-assisted first-pass contracts and skeletons.
4. Engineering implementation with architecture constraints.
5. CI validation and release.

## Project Structure (Current)

```txt
src/
  config/
  infra/                           # cross-cutting infrastructure adapters
  interface/                       # HTTP runtime adapters and transport plumbing
  modules/
    Users/
      adapters/                    # canonical adapter namespace (in/out)
        in/http/controllers/
        out/persistence/
      application/                 # application layer + use-case contracts
        use-cases/
      composition/                 # module wiring/composition root
      domain/                      # core entities/models
      events/                      # integration/domain events contracts/listeners
      features/                    # use-case style operations used by services
      infra/                       # legacy compatibility namespace (bridges)
      interface/                   # legacy compatibility namespace (bridges)
  shared/
```

## Target Architecture Direction

The migration toward stricter feature-driven hexagonal boundaries is documented in:

- [Hexagonal Feature-driven Migration Plan](docs/HEXAGONAL-FEATURE-DRIVEN-MIGRATION.md)

Current highlights already implemented:

- Controllers in Users call application use cases, not direct infra creation.
- Users integration events are standardized and wired via composition.
- CI blocks controller boundary violations and cyclic dependency regressions.
- CI blocks new legacy imports for Users controller/repository namespaces.

## Layer Responsibilities

### Request flow

`Handler -> Controller -> Application Use Case -> Domain/Policies -> Repository Port -> Adapter`

### Response flow

`Handler <- Controller <- Application Use Case <- Domain/Policies <- Repository Adapter`

### Component responsibilities

1. HTTP Request Handlers:
   infrastructure entry point for HTTP/Lambda runtime.
2. Controllers:
   validate request and delegate to application use cases.
3. Application Use Cases / Services:
   orchestrate domain behavior and outbound ports.
4. Domain:
   entities, value objects, invariants, and business policies.
5. Repository Ports:
   abstractions for persistence operations.
6. Adapters:
   concrete implementations for runtime, persistence, security, mutex, events.

## Classes Diagram

![Diagram](OASdoc/miro.png "Diagram")

<https://miro.com/app/board/uXjVNq5nWJY=/?share_link_id=603404471489>

## API Documentation

- UI: <http://localhost:3000/OASdoc/>
- JSON: <http://localhost:3000/docs/1.0.0>

Start the app before opening those URLs.

## Additional Documentation

- [Engineering Bootstrap Guide](docs/ENGINEERING-BOOTSTRAP-GUIDE.md)
- [Hexagonal Feature-driven Migration Plan](docs/HEXAGONAL-FEATURE-DRIVEN-MIGRATION.md)
- [Domain Data Entities](docs/DOMAIN-DATA-ENTITIES.md)
- [Agents Requirements Registry](.agents/README.md)

## Runtime and Required Stack

- Node.js `22.x` and npm
- TypeScript
- Jest
- Redis (mutex support, optional local via Docker)
- OpenAPI typings
- YAML parser

## Setup

Install dependencies:

```bash
npm install
```

Run Redis (if needed):

```bash
npm run docker:composeredis
```

## Testing

Run full test suite:

```bash
npm test
```

Run unit tests:

```bash
npm run test:unit
```

Run integration tests:

```bash
npm run test:integration
```

Per runtime:

```bash
npm run test:integration:express
npm run test:integration:fastify
npm run test:integration:restify
npm run test:integration:lambda
npm run test:integration:hyper-express
```

## CI and Quality Gates

Main gate:

```bash
npm run ci:gate
```

Included checks:

- `lint`
- core import cycle check
- hexagonal boundary check
- users legacy import check
- unit tests
- OpenAPI route resolution check
- build
- integration smoke
- minimum coverage threshold (95% global via Jest + Codecov status)

## Run the API (port 3000)

Express:

```bash
npm run dev:express
```

Fastify:

```bash
npm run dev:fastify
```

Restify:

```bash
npm run dev:restify
```

Hyper-Express:

```bash
npm run dev:hyper-express
```

Serverless dev mode:

```bash
npm run dev:serverless
```

![serverless dev mode](sls.png "serverless dev mode")

## Production Commands

```bash
npm run build:prod
npm run prod:express
npm run prod:fastify
npm run prod:restify
npm run prod:hyper-express
npm run prod:serverless
```

## Contributing

1. Create a branch.
2. Run TDD mode:

```bash
npm run tdd
```

3. Make your changes.
4. Commit using:

```bash
npm run commit
```

This command runs lint/tests and then opens commitizen flow.

## Tooling

Lint:

```bash
npm run lint
```

Lint + fix:

```bash
npm run lint:fix
```

Update changelog from git history:

```bash
npm run changelog:update
```

Validate changelog is synced:

```bash
npm run changelog:check
```

## Dependencies

### Application

- bcryptjs
- jsonwebtoken
- openapi-types
- reflect-metadata
- uuid
- xss
- yaml

### Infra - Express server

- express
- body-parser
- cors
- helmet

### Infra - Fastify server

- fastify
- @fastify/cors
- @fastify/formbody
- @fastify/helmet
- @fastify/static

### Infra - Restify

- restify
- bunyan

### Infra - Hyper-Express server

- hyper-express
- live-directory

### Infra - AWS Lambda / serverless

- aws-lambda
- serverless

### Infra - Distributed key-value storage

- redis

## Backlog and Project Management

<https://github.com/users/web2solutions/projects/1>
