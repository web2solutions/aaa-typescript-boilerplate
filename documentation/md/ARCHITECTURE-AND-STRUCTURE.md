# Architecture and Structure

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

- [Hexagonal Feature-driven Migration Plan](./HEXAGONAL-FEATURE-DRIVEN-MIGRATION.md)

Current highlights already implemented:

- Controllers in Users call application use cases, not direct infra creation.
- Users integration events are standardized and wired via composition.
- CI blocks controller boundary violations and cyclic dependency regressions.
- CI blocks new legacy imports for Users controller/repository namespaces.
- In-memory persistence now uses relational-style generic store semantics (unique indexes, relation indexes) to mirror SQL/NoSQL adapter behavior.
- Users domain includes tenant aggregate (`Organization`) and RBAC role policy (`superadmin`, `admin`, `user`).

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

## Tenancy and authorization boundaries

- `superadmin` can operate without organization binding.
- `admin` and `user` are tenant-scoped and must reference organization.
- RBAC enforcement is implemented in Users domain/service/auth flow, not in HTTP adapter glue code.

## Persistence adapter strategy

- Official adapter: in-memory store.
- Design target: contract-compatible behavior for relational and NoSQL persistence adapters.
- Current in-memory implementation includes:
  - unique index enforcement (case-sensitive and case-insensitive)
  - relation lookup support (`getByRelation`)
  - predictable pagination/filter behavior

## Classes Diagram

![Diagram](../OASdoc/miro.png "Diagram")

<https://miro.com/app/board/uXjVNq5nWJY=/?share_link_id=603404471489>
