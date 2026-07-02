# PostgreSQL Adapter

## Technology

Sequelize-based SQL client profile.

## Build Services with PostgreSQL

1. Start container:

```bash
npm run docker:up:postgresql
```

2. Set env:

```bash
AAA_DATABASE_DRIVER=PostgreSQL
AAA_DB_HOST=127.0.0.1
AAA_DB_PORT=5432
AAA_DB_NAME=aaa
AAA_DB_USERNAME=postgres
AAA_DB_PASSWORD=postgres
```

3. Start service adapter (`dev:*` command).

