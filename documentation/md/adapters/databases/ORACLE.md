# Oracle Adapter

## Technology

Sequelize + Oracle profile.

## Build Services with Oracle

1. Start container:

```bash
npm run docker:up:oracle
```

2. Set env:

```bash
AAA_DATABASE_DRIVER=Oracle
AAA_DB_HOST=127.0.0.1
AAA_DB_PORT=1521
AAA_DB_NAME=XE
AAA_DB_USERNAME=system
AAA_DB_PASSWORD=oracle
```

3. Start service adapter.

