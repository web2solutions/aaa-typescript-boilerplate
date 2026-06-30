# Service Management Application

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/web2solutions/aaa-typescript-boilerplate/tree/dev.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/web2solutions/aaa-typescript-boilerplate/tree/dev)
[![codecov](https://codecov.io/gh/web2solutions/aaa-typescript-boilerplate/branch/dev/graph/badge.svg)](https://codecov.io/gh/web2solutions/aaa-typescript-boilerplate)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=web2solutions_aaa-typescript-boilerplate&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=web2solutions_aaa-typescript-boilerplate)
[![Known Vulnerabilities](https://snyk.io/test/github/web2solutions/aaa-typescript-boilerplate/badge.svg)](https://snyk.io/test/github/web2solutions/aaa-typescript-boilerplate)
[![Node](https://img.shields.io/badge/node-22.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-6BA539?logo=openapiinitiative&logoColor=white)](../spec/1.0.0.yml)
[![AsyncAPI](https://img.shields.io/badge/AsyncAPI-3.0-9146FF)](../spec)
[![License](https://img.shields.io/github/license/web2solutions/aaa-typescript-boilerplate)](../LICENSE)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=web2solutions_aaa-typescript-boilerplate&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=web2solutions_aaa-typescript-boilerplate)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=web2solutions_aaa-typescript-boilerplate&metric=bugs)](https://sonarcloud.io/summary/new_code?id=web2solutions_aaa-typescript-boilerplate)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=web2solutions_aaa-typescript-boilerplate&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=web2solutions_aaa-typescript-boilerplate)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
![Made in Brazil with Love](https://img.shields.io/badge/made%20in-%F0%9F%87%A7%F0%9F%87%B7%20Brazil%20with%E2%9D%A4%EF%B8%8F-blue)
[![#StandWithUkraine](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/badges/StandWithUkraine.svg)](https://vshymanskyy.github.io/StandWithUkraine)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/web2solutions/aaa-typescript-boilerplate)

`servicemangement` is a tabbed local application for engineering setup and design workflows in this boilerplate.

Detailed feature usage:

- [Domain Designer Features and Usage](../documentation/md/DOMAIN-DESIGNER-FEATURES-AND-USAGE.md)

## Tabs

1. **Domain Designer**
   - Full ER/domain modeling MVP.
   - Domain rectangles, entity modeling, relationship design, OpenAPI export/import, model checks.
   - Anchor-to-anchor relationship drag connectors on entity edges.
   - Domain bounded-context editor (including package dependencies and shared value-object metadata).
   - Relationship label position controls (offset editor + reset) and bend-point path controls.
   - Aggregate root + invariants editor with visual AR marker on entity cards.
   - Schema diff/migration preview with baseline snapshot support.
   - Validation severity filter and export quality gate (block on critical issues).
   - RBAC mapping editor by entity/action with tenant-scope flags.
   - Event/message contract designer (`event`, `command`, `request`, `response`) with payload schema metadata.
   - Entity templates: `crudAggregate`, `eventSourced`, `referenceData`, `tenantOwned`.
   - Code generation preview for domain model/repository/use-case/controller/handler skeletons.
   - Request/response example generator from entity schema.
   - Exporters: JSON, OpenAPI 3.1, Markdown, JSON Schema, AsyncAPI and boilerplate bundle.
   - OpenAPI composition controls (`oneOf`, `allOf`, `anyOf`, external `$ref`, discriminator) per entity.
   - Domain package export/import for reusable model sharing.
   - Mini-map navigation and large-canvas performance mode.
2. **Communication Interface Designer**
   - Register inbound interface adapters (`HTTP/REST`, `gRPC`, `WebSocket`, `SSE`).
   - Track framework/runtime, entrypoint, and controller mapping.
3. **Service Configuration**
   - Configure service kind (`REST API`, `WebSocket API + REST API`, `gRPC API + REST API`),
   execution model, cloud provider, static assets profile, and runtime ports.
   - Includes PM2 runtime profile preview for VM deployments.
   - Includes runtime env editor for:
     - `AAA_HTTP_FRAMEWORK`
     - `AAA_REALTIME_API`
     - `AAA_REALTIME_API_PROTOCOL`
     - `AAA_REALTIME_API_DATABASE_DRIVER`
4. **Deploy Management**
   - Register deployment targets for VMs, dedicated servers, EC2, and function providers.

## Run

This application is served via PM2:

- `/Users/eduardoalmeida/apps/apps/apps/aaa-typescript-boilerplate/servicemangement/server.js`

Commands:

- `npm run dev:service-management`
- `npm run dev` (auto-starts service management + REST profile)

## Runtime Env API

- `GET /api/runtime/env?environment=dev|staging|ci`
- `POST /api/runtime/env`

### Editable Keys

- `AAA_HTTP_FRAMEWORK`
- `AAA_REALTIME_API`
- `AAA_REALTIME_API_PROTOCOL`
- `AAA_REALTIME_API_DATABASE_DRIVER`

### Environment Mapping

- `dev` -> `src/config/.env.dev`
- `staging` -> `src/config/.env.staging`
- `ci` -> `src/config/.env.ci`
