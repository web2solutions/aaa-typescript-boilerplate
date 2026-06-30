# Database Drivers Smoke Tests

This boilerplate now supports runtime selection of multiple database drivers through `AAA_DATABASE_DRIVER`, and includes smoke tests and per-database Docker compose files to validate adapter boot lifecycle (`connect` / `disconnect`) in local/dev/staging/prod-like environments.

## Supported Drivers

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

## Runtime Client Compilation

- Source: `src/infra/persistence/compileDatabaseClient.ts`
- External stores now use fail-fast proxies (`src/infra/persistence/external/ExternalStoreProxy.ts`) instead of silently reusing in-memory stores.
- Oracle has dedicated connector support (`src/infra/persistence/external/OracleRepository.ts`).
- Bootstrap adapters that inject `IDatabaseClient` from `AAA_DATABASE_DRIVER`:
  - `src/interface/HTTP/adapters/*`
  - `src/interface/WebSocket/adapters/socket-io/socket-io.ts`
  - `src/interface/gRPC/adapters/grpc/grpc.ts`
  - `src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/runtime.ts`

## Smoke Test Suite

- Test file: `test/smoke/database/DatabaseDrivers.smoke.test.ts`
- Run all configured smoke drivers:

```bash
npm run test:smoke:db:all
```

- Run one driver only:

```bash
npm run test:smoke:db:postgresql
npm run test:smoke:db:mysql
npm run test:smoke:db:mssql
npm run test:smoke:db:oracle
npm run test:smoke:db:mongo
npm run test:smoke:db:cassandra
npm run test:smoke:db:dynamodb
npm run test:smoke:db:firebase
npm run test:smoke:db:aurora
npm run test:smoke:db:rds
npm run test:smoke:db:sqlite
npm run test:smoke:db:inmemory
```

### Driver Filter

`AAA_DB_SMOKE_DRIVERS` accepts a comma-separated list and controls which smoke cases run.

Example:

```bash
AAA_DB_SMOKE_DRIVERS=PostgreSQL,MySQL npm run test:smoke:db
```

## Docker Compose Files Per Database

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

## One-command DB smoke workflows

Each workflow starts container -> runs smoke test -> stops container:

```bash
npm run smoke:db:postgresql
npm run smoke:db:mysql
npm run smoke:db:mssql
npm run smoke:db:oracle
npm run smoke:db:mongodb
npm run smoke:db:cassandra
npm run smoke:db:dynamodb
npm run smoke:db:firebase
npm run smoke:db:aurora
npm run smoke:db:rds
```

## Environment Variables

Add/update these keys in `src/config/.env.*` for driver-specific runtime:

- `AAA_DATABASE_DRIVER`
- `AAA_DATABASE_CONNECTION_URL`
- `AAA_DATABASE_NAME`
- `AAA_DATABASE_DIALECT`
- `AAA_DATABASE_REGION`
- `AAA_DATABASE_ENDPOINT`
- `AAA_DATABASE_PROJECT_ID`
- `AAA_DATABASE_CASSANDRA_CONTACT_POINTS`
- `AAA_DATABASE_CASSANDRA_DATACENTER`
- `AAA_DATABASE_POOL_MAX`
- `AAA_DATABASE_POOL_MIN`
- `AAA_DATABASE_POOL_ACQUIRE_MS`
- `AAA_DATABASE_POOL_IDLE_MS`
- `AAA_DATABASE_POOL_EVICT_MS`
- `AAA_DATABASE_USER`
- `AAA_DATABASE_PASSWORD`
- `AAA_DATABASE_CONNECT_STRING`

## Operational Note

If Docker daemon is not available, smoke scripts that need containers will fail at startup. In that case:

1. Start Docker Desktop/daemon.
2. Re-run the `smoke:db:*` command.
3. For CI environments without Docker, keep `test:smoke:db:inmemory` and unit tests as baseline checks.
