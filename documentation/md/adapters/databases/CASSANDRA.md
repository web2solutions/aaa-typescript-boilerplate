# Cassandra Adapter

## Technology

Cassandra driver profile.

## Build Services with Cassandra

1. Start container:

```bash
npm run docker:up:cassandra
```

2. Set env:

```bash
AAA_DATABASE_DRIVER=Cassandra
AAA_CASSANDRA_CONTACT_POINTS=127.0.0.1
AAA_CASSANDRA_KEYSPACE=aaa
AAA_CASSANDRA_PORT=9042
```

3. Start service adapter.

