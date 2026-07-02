# RDS Adapter

## Technology

Amazon RDS integration path (SQL profile in external adapter layer).

## Build Services with RDS

1. Set env:

```bash
AAA_DATABASE_DRIVER=RDS
AAA_DATABASE_CONNECTION_URL=postgres://user:pass@rds-host:5432/aaa
```

2. Start service adapter.
3. Validate with smoke command:

```bash
npm run smoke:db:rds
```

