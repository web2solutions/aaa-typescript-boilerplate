# 046 - Multi-Database Driver Smoke Validation and Docker Compose Matrix

## Requirement

Persistence adapters must be executable and smoke-testable per supported database driver, with explicit Docker assets for local validation.

Mandatory outcomes:

- `compileDatabaseClient` must not silently map external drivers to in-memory stores.
- External driver store access must fail fast when store/repository mapping is not implemented.
- Add smoke tests for each supported driver:
  - `InMemory`
  - `Mongo`
  - `PostgreSQL`
  - `MySQL`
  - `MSSQL`
  - `Oracle`
  - `SQLite`
  - `DynamoDB`
  - `Cassandra`
  - `Firebase`
  - `Aurora`
  - `RDS`
- Add per-database compose files:
  - `docker-compose-postgresql.yml`
  - `docker-compose-mysql.yml`
  - `docker-compose-mssql.yml`
  - `docker-compose-oracle.yml`
  - `docker-compose-mongodb.yml`
  - `docker-compose-cassandra.yml`
  - `docker-compose-dynamodb.yml`
  - `docker-compose-firebase.yml`
  - `docker-compose-aurora.yml`
  - `docker-compose-rds.yml`
- Add package scripts for:
  - per-driver smoke test execution
  - compose up/down helpers
  - one-command up/test/down workflows

## Guardrails

- Keep Node 22 compatibility for all runtime paths.
- Keep strict lint/build compatibility.
- Document smoke workflows in project docs and README index.
- Preserve in-memory default for CI baseline while allowing container-backed validation in local and staging workflows.

