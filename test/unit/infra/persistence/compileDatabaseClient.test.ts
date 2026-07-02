import {
  compileAuroraDbClient,
  compileCassandraDbClient,
  compileDatabaseClient,
  compileDatabaseClientByDriver,
  compileDynamoDbClient,
  compileFirebaseDbClient,
  compileMongoDbClient,
  compileMsSqlDbClient,
  compileMySqlDbClient,
  compileOracleDbClient,
  compilePostgreSqlDbClient,
  compileRdsDbClient,
  compileSqliteDbClient
} from '@src/infra/persistence/compileDatabaseClient';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';

describe('compileDatabaseClient', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    Object.keys(process.env).forEach((key) => {
      if (!(key in originalEnv)) delete process.env[key];
    });
    Object.entries(originalEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
  });

  it('returns in-memory client by default', () => {
    expect.hasAssertions();
    delete process.env.AAA_DATABASE_DRIVER;
    const client = compileDatabaseClient();
    expect(client).toBe(InMemoryDbClient);
  });

  it('normalizes aliases to known drivers', () => {
    expect.hasAssertions();
    const nonInMemoryAliases = [
      'MONGOOSE',
      'postgres',
      'dynamo',
      'cassandra',
      'sql server',
      'sqlserver',
      'ms sql',
      'sql lite',
      'oracle',
      'aurora'
    ];
    const clients = nonInMemoryAliases.map((alias) => compileDatabaseClientByDriver(alias));
    expect(clients.every((client) => client !== InMemoryDbClient)).toBe(true);
    expect(compileDatabaseClientByDriver('memory')).toBe(InMemoryDbClient);
  });

  it('returns fail-fast external stores instead of in-memory stores', async () => {
    expect.hasAssertions();
    const mongoClient = compileDatabaseClientByDriver('mongo');
    expect(mongoClient.stores.User).not.toBe(InMemoryDbClient.stores.User);

    await expect(mongoClient.stores.User.getOneById('1')).rejects.toThrow(
      'client is not connected'
    );
  });

  it('falls back to in-memory for unknown driver', () => {
    expect.hasAssertions();
    const client = compileDatabaseClientByDriver('not-a-driver');
    expect(client).toBe(InMemoryDbClient);
  });

  it('builds helper clients for relational/non-relational families', () => {
    expect.hasAssertions();
    process.env.AAA_DATABASE_CONNECTION_URL = 'postgres://aaa:aaa@127.0.0.1:5432/aaa';
    process.env.AAA_DATABASE_CASSANDRA_CONTACT_POINTS = '127.0.0.1';
    process.env.AAA_DATABASE_PROJECT_ID = 'demo-project';

    const clients = [
      compileMongoDbClient(),
      compilePostgreSqlDbClient(),
      compileMySqlDbClient(),
      compileMsSqlDbClient(),
      compileOracleDbClient(),
      compileSqliteDbClient(),
      compileDynamoDbClient(),
      compileCassandraDbClient(),
      compileFirebaseDbClient(),
      compileAuroraDbClient(),
      compileRdsDbClient()
    ];
    expect(clients.every((client) => client !== InMemoryDbClient)).toBe(true);
  });

  it('applies env parsing fallbacks for firebase and rds dialect', async () => {
    expect.hasAssertions();
    process.env.AAA_DATABASE_DRIVER = 'firebase';
    process.env.AAA_FIREBASE_SERVICE_ACCOUNT_JSON = '{invalid-json';
    expect(compileDatabaseClient()).not.toBe(InMemoryDbClient);

    process.env.AAA_DATABASE_DRIVER = 'firebase';
    process.env.AAA_FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({ project_id: 'demo-project' });
    const firebaseClient = compileDatabaseClient();
    expect(firebaseClient).not.toBe(InMemoryDbClient);
    await expect(firebaseClient.connect()).rejects.toThrow(/private_key|Missing optional dependency/);
    await expect(firebaseClient.disconnect()).resolves.toBeUndefined();

    process.env.AAA_DATABASE_DRIVER = 'rds';
    process.env.AAA_DATABASE_DIALECT = 'unknown-dialect';
    process.env.AAA_DATABASE_CONNECTION_URL = 'postgres://aaa:aaa@127.0.0.1:5432/aaa';
    process.env.AAA_DATABASE_POOL_MAX = 'not-a-number';
    process.env.AAA_DATABASE_POOL_MIN = ' ';
    process.env.AAA_DATABASE_POOL_ACQUIRE_MS = 'invalid';
    expect(compileDatabaseClient()).not.toBe(InMemoryDbClient);
  });

  it('applies env parsing fallback for cassandra contact points and firebase non-object json', () => {
    expect.hasAssertions();
    process.env.AAA_DATABASE_DRIVER = 'cassandra';
    process.env.AAA_DATABASE_CASSANDRA_CONTACT_POINTS = ' , 127.0.0.1 , ';
    expect(compileDatabaseClient()).not.toBe(InMemoryDbClient);

    process.env.AAA_DATABASE_DRIVER = 'firebase';
    process.env.AAA_FIREBASE_SERVICE_ACCOUNT_JSON = '1';
    expect(compileDatabaseClient()).not.toBe(InMemoryDbClient);
  });

  it('covers parse fallbacks for numeric env and firebase json variants', () => {
    expect.hasAssertions();
    process.env.AAA_DATABASE_DRIVER = 'rds';
    process.env.AAA_DATABASE_CONNECTION_URL = 'postgres://aaa:aaa@127.0.0.1:5432/aaa';
    process.env.AAA_DATABASE_POOL_MAX = 'NaN';
    expect(compileDatabaseClient()).not.toBe(InMemoryDbClient);

    process.env.AAA_DATABASE_DRIVER = 'firebase';
    process.env.AAA_FIREBASE_SERVICE_ACCOUNT_JSON = '"string-value"';
    expect(compileDatabaseClient()).not.toBe(InMemoryDbClient);
  });
});
