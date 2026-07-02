# JumentiX Service Factory Capabilities Matrix

## Objective

Define the supported software factory modes for JumentiX so engineering and product can choose a delivery shape with predictable architecture and operations.

## Capability Matrix

| Factory Mode | Primary Output | Supported Interfaces | Communication Pattern | Persistence Strategy | Typical Use |
|---|---|---|---|---|---|
| Modular Monolith (Backend) | Single backend service with multiple domains | REST, WebSocket + REST fallback, gRPC + REST fallback, Functions | In-process MessageMediator request/response + pub/sub | In-memory, SQL, NoSQL via env driver selection | Early-stage products and teams optimizing speed with future decoupling path |
| Multi-service Backend Group | Multiple backend services in one workspace | REST, WebSocket, gRPC, Functions | Contract-based mediator and event contracts per service boundary | Per-service database adapter selection | Domain isolation and independent scaling by bounded context |
| Hybrid Backend + Frontend | Backend services plus SPA/PWA/SSR apps | REST + realtime contracts consumed by SDK clients | API contracts (OpenAPI/AsyncAPI) and event-first integration | Backend adapter plus frontend local/offline storage strategy | End-to-end product delivery from one monorepo |
| Frontend-only SPA/PWA Offline | Frontend application package with API contract compatibility | Local app + optional remote API consumption | Contract-first client SDK integration | IndexedDB/local storage for offline-first flows | Offline-capable field and operations applications |

## Non-functional Guarantees

- DDD + Hexagonal boundaries are mandatory for backend modules.
- Event-driven integration is prioritized to avoid tight coupling and circular dependencies.
- Every generated service must keep CI, coverage, contract checks, and architecture checks enabled by default.
- Runtime startup must be environment-driven and PM2-orchestrated for VM contexts.

## Required Contracts per Factory Mode

| Contract | Modular Monolith | Multi-service Backend | Hybrid | Frontend-only |
|---|---:|---:|---:|---:|
| OpenAPI 3.1 endpoint contracts | required | required | required (backend side) | optional (consumer side) |
| AsyncAPI realtime contracts | required when realtime enabled | required when realtime enabled | required when realtime enabled | optional |
| Message/event map documentation | required | required | required | optional |
| Error contract map | required | required | required | recommended |
| Data entity/model docs | required | required | required | optional |

## Acceptance Criteria

- Service profile selection maps to one of the factory modes above.
- Generated scaffolds include required contract files and default quality scripts.
- Documentation index references this matrix as the canonical product capability source.
