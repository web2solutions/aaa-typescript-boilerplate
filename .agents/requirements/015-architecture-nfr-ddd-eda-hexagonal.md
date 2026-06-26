# 015 - Architecture NFR (DDD + EDA + Hexagonal)

## Requirement
The software must follow these non-functional architecture requirements:

- Domain Driven Design
- Event Driven Design
- Hexagonal Architecture
- Clear and explicit concepts for:
  - Domains
  - Data Entity
  - Ports
  - Adapters
  - Repositories
  - Services
  - Use Cases
  - HTTP Controllers
  - HTTP Adapters/Handlers across supported frameworks

## Why
These principles are core to project identity, maintainability, and long-term scalability.

## Status
In progress

## Notes
- Controllers call application use cases (Users module).
- CI includes `arch:check-boundaries` to prevent controller-level service/repository instantiation.
- Event contracts and listeners are standardized for Users integration events.
