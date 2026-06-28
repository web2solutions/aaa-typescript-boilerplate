# External Data Adapter Foundations

To support heterogeneous deployment topologies, the project includes initial adapter foundations for external persistence providers.

## Location

- `src/infra/persistence/external/`

## Foundations Included

- `SqlSequelizeRepository`
  - Dialects: `postgres`, `mysql`, `mssql`, `oracle`, `sqlite`
- `MongoMongooseRepository`
- `DynamoDbRepository`
- `CassandraRepository`
- `FirebaseRepository`
- `OracleRepository`
- `AuroraRepository`
- `RdsRepository`

All providers extend `BaseExternalDataRepository` and expose connect/disconnect lifecycle methods without forcing hard runtime coupling when not used.

`compileDatabaseClient` now maps external providers to fail-fast store proxies so missing repository/store wiring is explicit during execution instead of silently using in-memory stores.

For end-to-end smoke validation with Docker per database, see:

- [Database Drivers Smoke Tests](./DATABASE-DRIVERS-SMOKE-TESTS.md)

## Queue Request/Response Repository

For asynchronous request-response patterns over queue-like transports:

- `src/infra/messages/repositories/QueueRequestResponseRepository.ts`

This class is contract-based and works through the message mediator abstraction, which can be backed by:

- InMemory
- RabbitMQ
- BullMQ
