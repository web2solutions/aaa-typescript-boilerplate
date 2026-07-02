# Aurora Adapter

## Technology

Aurora integration path (SQL-compatible profile in external adapter layer).

## Build Services with Aurora

1. Set env:

```bash
AAA_DATABASE_DRIVER=Aurora
AAA_DATABASE_CONNECTION_URL=postgres://user:pass@aurora-host:5432/aaa
```

2. Start service adapter.
3. Validate with smoke command:

```bash
npm run smoke:db:aurora
```

