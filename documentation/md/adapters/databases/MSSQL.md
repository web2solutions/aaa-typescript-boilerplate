# SQL Server Adapter

## Technology

Sequelize + tedious profile.

## Build Services with SQL Server

1. Start container:

```bash
npm run docker:up:mssql
```

2. Set env:

```bash
AAA_DATABASE_DRIVER=MSSQL
AAA_DB_HOST=127.0.0.1
AAA_DB_PORT=1433
AAA_DB_NAME=aaa
AAA_DB_USERNAME=sa
AAA_DB_PASSWORD=YourStrong!Passw0rd
```

3. Start service adapter.

