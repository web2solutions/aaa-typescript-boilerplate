# Requirement 032 - Entity Timestamps, Domain Object Mutation API, and OAS Sync

## Context
All data entities must expose canonical lifecycle timestamps and domain-safe mutation methods for generic value-object arrays.
Whenever entities/models/contracts/events/messages/errors change, documentation and OpenAPI must be updated together.

## Rules
1. Every data entity must include:
   - `createdAt` (required, auto-generated on creation)
   - `updatedAt` (required, auto-generated on creation and auto-updated on model persistence updates)
2. If an entity has arrays of generic domain objects (`phone`, `email`, `address`, `document`, etc.), the model must expose explicit methods:
   - `create{DomainObject}`
   - `update{DomainObject}`
   - `delete{DomainObject}`
3. Any change to data entity/model/contract/event/message/error must include synchronized updates in:
   - software documentation (`documentation/md/...`)
   - OpenAPI spec (`spec/1.0.0.yml`)
4. `spec/1.0.0.yml` must keep complete support for `Organization` resource endpoints and schemas.
5. Coverage and CI gates remain mandatory for approval.

## Implementation Notes
- Canonical serialized fields are `createdAt` and `updatedAt` (not underscored variants).
- Persistence adapters are responsible for updating `updatedAt` on update operations.
- Domain models must avoid direct array mutation by callers and route all changes through behavior methods.
