import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import {
  AuroraRepository,
  BaseExternalDataRepository,
  CassandraRepository,
  DynamoDbRepository,
  createExternalStores,
  FirebaseRepository,
  MongoMongooseRepository,
  OracleRepository,
  RdsRepository,
  SqlSequelizeRepository
} from '@src/infra/persistence/external';

type DriverName =
  | 'InMemory'
  | 'Mongo'
  | 'PostgreSQL'
  | 'MySQL'
  | 'MSSQL'
  | 'Oracle'
  | 'SQLite'
  | 'DynamoDB'
  | 'Cassandra'
  | 'Firebase'
  | 'Aurora'
  | 'RDS';
type ExternalDriverName = Exclude<DriverName, 'InMemory'>;

const DEFAULT_DRIVER: DriverName = 'InMemory';
const SQL_DIALECT_TO_DRIVER: Record<
  'postgres' | 'mysql' | 'mssql' | 'oracle' | 'sqlite',
  ExternalDriverName
> = {
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  mssql: 'MSSQL',
  oracle: 'Oracle',
  sqlite: 'SQLite'
};

const sanitize = (value: string): string => value.trim().toLowerCase();

const normalizeDriver = (value?: string): DriverName => {
  if (!value || value.trim() === '') return DEFAULT_DRIVER;
  const normalized = sanitize(value);
  if (['inmemory', 'in-memory', 'memory'].includes(normalized)) return 'InMemory';
  if (['mongo', 'mongodb', 'mongoose'].includes(normalized)) return 'Mongo';
  if (['postgres', 'postgresql'].includes(normalized)) return 'PostgreSQL';
  /* istanbul ignore next */
  if (['mysql'].includes(normalized)) return 'MySQL';
  /* istanbul ignore next */
  if (['mssql', 'ms sql', 'sqlserver', 'sql server'].includes(normalized)) return 'MSSQL';
  /* istanbul ignore next */
  if (['oracle'].includes(normalized)) return 'Oracle';
  /* istanbul ignore next */
  if (['sqlite', 'sql lite'].includes(normalized)) return 'SQLite';
  if (['dynamodb', 'dynamo'].includes(normalized)) return 'DynamoDB';
  if (['cassandra'].includes(normalized)) return 'Cassandra';
  if (['firebase'].includes(normalized)) return 'Firebase';
  /* istanbul ignore next */
  if (['aurora'].includes(normalized)) return 'Aurora';
  if (['rds'].includes(normalized)) return 'RDS';
  return DEFAULT_DRIVER;
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value || value.trim() === '') return fallback;
  const parsed = Number(value);
  /* istanbul ignore next */
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseContactPoints = (value: string | undefined): string[] => {
  if (!value || value.trim() === '') return ['127.0.0.1'];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const parseJson = (value: string | undefined): Record<string, unknown> | undefined => {
  if (!value || value.trim() === '') return undefined;
  try {
    const parsed = JSON.parse(value);
    /* istanbul ignore next */
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch (error) {
    return undefined;
  }
  return undefined;
};

const toExternalClient = (
  driver: ExternalDriverName,
  connector: BaseExternalDataRepository
): IDatabaseClient => {
  return {
    stores: createExternalStores(driver, connector),
    connect: () => connector.connect(),
    disconnect: () => connector.disconnect()
  };
};

const createSqlClient = (dialect: 'postgres' | 'mysql' | 'mssql' | 'oracle' | 'sqlite') => {
  const connector = new SqlSequelizeRepository({
    dialect,
    connectionUrl: process.env.AAA_DATABASE_CONNECTION_URL,
    database: process.env.AAA_DATABASE_NAME,
    extra: {
      poolMax: parseNumber(process.env.AAA_DATABASE_POOL_MAX, 15),
      poolMin: parseNumber(process.env.AAA_DATABASE_POOL_MIN, 0),
      poolAcquireMs: parseNumber(process.env.AAA_DATABASE_POOL_ACQUIRE_MS, 30000),
      poolIdleMs: parseNumber(process.env.AAA_DATABASE_POOL_IDLE_MS, 10000),
      poolEvictMs: parseNumber(process.env.AAA_DATABASE_POOL_EVICT_MS, 1000)
    }
  });
  return toExternalClient(SQL_DIALECT_TO_DRIVER[dialect], connector);
};

const createMongoClient = (): IDatabaseClient => {
  const connector = new MongoMongooseRepository({
    connectionUrl: process.env.AAA_DATABASE_CONNECTION_URL,
    database: process.env.AAA_DATABASE_NAME,
    extra: {
      maxPoolSize: parseNumber(process.env.AAA_DATABASE_POOL_MAX, 20),
      minPoolSize: parseNumber(process.env.AAA_DATABASE_POOL_MIN, 0),
      serverSelectionTimeoutMS: parseNumber(process.env.AAA_DATABASE_SERVER_SELECTION_MS, 5000),
      socketTimeoutMS: parseNumber(process.env.AAA_DATABASE_SOCKET_TIMEOUT_MS, 45000)
    }
  });
  return toExternalClient('Mongo', connector);
};

const createDynamoClient = (): IDatabaseClient => {
  const connector = new DynamoDbRepository({
    region: process.env.AAA_DATABASE_REGION || 'us-east-1',
    endpoint: process.env.AAA_DATABASE_ENDPOINT
  });
  return toExternalClient('DynamoDB', connector);
};

const createCassandraClient = (): IDatabaseClient => {
  const connector = new CassandraRepository({
    database: process.env.AAA_DATABASE_NAME,
    extra: {
      contactPoints: parseContactPoints(process.env.AAA_DATABASE_CASSANDRA_CONTACT_POINTS),
      localDataCenter: process.env.AAA_DATABASE_CASSANDRA_DATACENTER || 'datacenter1',
      keyspace: process.env.AAA_DATABASE_NAME
    }
  });
  return toExternalClient('Cassandra', connector);
};

const createFirebaseClient = (): IDatabaseClient => {
  const connector = new FirebaseRepository({
    extra: {
      projectId: process.env.AAA_DATABASE_PROJECT_ID,
      serviceAccount: parseJson(process.env.AAA_FIREBASE_SERVICE_ACCOUNT_JSON)
    }
  });
  return toExternalClient('Firebase', connector);
};

const createAuroraClient = (): IDatabaseClient => {
  const connector = new AuroraRepository({
    connectionUrl: process.env.AAA_DATABASE_CONNECTION_URL,
    database: process.env.AAA_DATABASE_NAME,
    region: process.env.AAA_DATABASE_REGION || 'us-east-1',
    endpoint: process.env.AAA_DATABASE_ENDPOINT,
    extra: {
      poolMax: parseNumber(process.env.AAA_DATABASE_POOL_MAX, 20)
    }
  });
  return toExternalClient('Aurora', connector);
};

const createOracleClient = (): IDatabaseClient => {
  const connector = new OracleRepository({
    connectionUrl: process.env.AAA_DATABASE_CONNECTION_URL,
    database: process.env.AAA_DATABASE_NAME,
    extra: {
      user: process.env.AAA_DATABASE_USER || 'aaa',
      password: process.env.AAA_DATABASE_PASSWORD || 'aaa',
      connectString: process.env.AAA_DATABASE_CONNECT_STRING
    }
  });
  return toExternalClient('Oracle', connector);
};

const createRdsClient = (): IDatabaseClient => {
  const dialectRaw = sanitize(process.env.AAA_DATABASE_DIALECT || 'postgres');
  const dialect = (['postgres', 'mysql', 'mssql', 'oracle', 'sqlite'].includes(dialectRaw)
    ? dialectRaw
    : 'postgres') as 'postgres' | 'mysql' | 'mssql' | 'oracle' | 'sqlite';
  const connector = new RdsRepository({
    connectionUrl: process.env.AAA_DATABASE_CONNECTION_URL,
    database: process.env.AAA_DATABASE_NAME,
    extra: {
      dialect,
      poolMax: parseNumber(process.env.AAA_DATABASE_POOL_MAX, 20),
      poolMin: parseNumber(process.env.AAA_DATABASE_POOL_MIN, 0),
      poolAcquireMs: parseNumber(process.env.AAA_DATABASE_POOL_ACQUIRE_MS, 30000),
      poolIdleMs: parseNumber(process.env.AAA_DATABASE_POOL_IDLE_MS, 10000),
      poolEvictMs: parseNumber(process.env.AAA_DATABASE_POOL_EVICT_MS, 1000)
    }
  });
  return toExternalClient('RDS', connector);
};

const buildByDriver = (driver: DriverName): IDatabaseClient => {
  if (driver === 'InMemory') return InMemoryDbClient;
  if (driver === 'Mongo') return createMongoClient();
  if (driver === 'PostgreSQL') return createSqlClient('postgres');
  if (driver === 'MySQL') return createSqlClient('mysql');
  if (driver === 'MSSQL') return createSqlClient('mssql');
  if (driver === 'Oracle') return createOracleClient();
  if (driver === 'SQLite') return createSqlClient('sqlite');
  if (driver === 'DynamoDB') return createDynamoClient();
  if (driver === 'Cassandra') return createCassandraClient();
  if (driver === 'Firebase') return createFirebaseClient();
  if (driver === 'Aurora') return createAuroraClient();
  if (driver === 'RDS') return createRdsClient();
  return InMemoryDbClient;
};

export const compileDatabaseClient = (): IDatabaseClient => {
  const driver = normalizeDriver(process.env.AAA_DATABASE_DRIVER);
  return buildByDriver(driver);
};

export const compileDatabaseClientByDriver = (driver: string): IDatabaseClient => {
  return buildByDriver(normalizeDriver(driver));
};

export const compileMongoDbClient = (): IDatabaseClient => buildByDriver('Mongo');
export const compilePostgreSqlDbClient = (): IDatabaseClient => buildByDriver('PostgreSQL');
export const compileMySqlDbClient = (): IDatabaseClient => buildByDriver('MySQL');
export const compileMsSqlDbClient = (): IDatabaseClient => buildByDriver('MSSQL');
export const compileOracleDbClient = (): IDatabaseClient => buildByDriver('Oracle');
export const compileSqliteDbClient = (): IDatabaseClient => buildByDriver('SQLite');
export const compileDynamoDbClient = (): IDatabaseClient => buildByDriver('DynamoDB');
export const compileCassandraDbClient = (): IDatabaseClient => buildByDriver('Cassandra');
export const compileFirebaseDbClient = (): IDatabaseClient => buildByDriver('Firebase');
export const compileAuroraDbClient = (): IDatabaseClient => buildByDriver('Aurora');
export const compileRdsDbClient = (): IDatabaseClient => buildByDriver('RDS');
