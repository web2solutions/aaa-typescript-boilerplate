import { BaseExternalDataRepository } from '@jumentix/external-persistence-core';
import {
  AuroraRepository,
  CassandraRepository,
  DynamoDbRepository,
  FirebaseRepository,
  MongoMongooseRepository,
  OracleRepository,
  RdsRepository,
  SqlSequelizeRepository
} from '@jumentix/external-db-repositories';
import { createExternalStores } from '@jumentix/external-store-proxy';

export type DriverName =
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

export interface IDatabaseClientLike {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  stores: Record<string, any>;
}

export interface IBuildDatabaseClientCompilersOptions<TDatabaseClient extends IDatabaseClientLike> {
  inMemoryClient: TDatabaseClient;
}

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
  if (['mysql'].includes(normalized)) return 'MySQL';
  if (['mssql', 'ms sql', 'sqlserver', 'sql server'].includes(normalized)) return 'MSSQL';
  if (['oracle'].includes(normalized)) return 'Oracle';
  if (['sqlite', 'sql lite'].includes(normalized)) return 'SQLite';
  if (['dynamodb', 'dynamo'].includes(normalized)) return 'DynamoDB';
  if (['cassandra'].includes(normalized)) return 'Cassandra';
  if (['firebase'].includes(normalized)) return 'Firebase';
  if (['aurora'].includes(normalized)) return 'Aurora';
  if (['rds'].includes(normalized)) return 'RDS';
  return DEFAULT_DRIVER;
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value || value.trim() === '') return fallback;
  const parsed = Number(value);
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
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch (_error) {
    return undefined;
  }
  return undefined;
};

const toExternalClient = <TDatabaseClient extends IDatabaseClientLike>(
  driver: ExternalDriverName,
  connector: BaseExternalDataRepository
): TDatabaseClient => {
  return {
    stores: createExternalStores(driver, connector),
    connect: () => connector.connect(),
    disconnect: () => connector.disconnect()
  } as unknown as TDatabaseClient;
};

export const buildDatabaseClientCompilers = <TDatabaseClient extends IDatabaseClientLike>({
  inMemoryClient
}: IBuildDatabaseClientCompilersOptions<TDatabaseClient>) => {
  const createSqlClient = (
    dialect: 'postgres' | 'mysql' | 'mssql' | 'oracle' | 'sqlite'
  ): TDatabaseClient => {
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
    return toExternalClient<TDatabaseClient>(SQL_DIALECT_TO_DRIVER[dialect], connector);
  };

  const createMongoClient = (): TDatabaseClient => {
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
    return toExternalClient<TDatabaseClient>('Mongo', connector);
  };

  const createDynamoClient = (): TDatabaseClient => {
    const connector = new DynamoDbRepository({
      region: process.env.AAA_DATABASE_REGION || 'us-east-1',
      endpoint: process.env.AAA_DATABASE_ENDPOINT
    });
    return toExternalClient<TDatabaseClient>('DynamoDB', connector);
  };

  const createCassandraClient = (): TDatabaseClient => {
    const connector = new CassandraRepository({
      database: process.env.AAA_DATABASE_NAME,
      extra: {
        contactPoints: parseContactPoints(process.env.AAA_DATABASE_CASSANDRA_CONTACT_POINTS),
        localDataCenter: process.env.AAA_DATABASE_CASSANDRA_DATACENTER || 'datacenter1',
        keyspace: process.env.AAA_DATABASE_NAME
      }
    });
    return toExternalClient<TDatabaseClient>('Cassandra', connector);
  };

  const createFirebaseClient = (): TDatabaseClient => {
    const connector = new FirebaseRepository({
      extra: {
        projectId: process.env.AAA_DATABASE_PROJECT_ID,
        serviceAccount: parseJson(process.env.AAA_FIREBASE_SERVICE_ACCOUNT_JSON)
      }
    });
    return toExternalClient<TDatabaseClient>('Firebase', connector);
  };

  const createAuroraClient = (): TDatabaseClient => {
    const connector = new AuroraRepository({
      connectionUrl: process.env.AAA_DATABASE_CONNECTION_URL,
      database: process.env.AAA_DATABASE_NAME,
      region: process.env.AAA_DATABASE_REGION || 'us-east-1',
      endpoint: process.env.AAA_DATABASE_ENDPOINT,
      extra: {
        poolMax: parseNumber(process.env.AAA_DATABASE_POOL_MAX, 20)
      }
    });
    return toExternalClient<TDatabaseClient>('Aurora', connector);
  };

  const createOracleClient = (): TDatabaseClient => {
    const connector = new OracleRepository({
      connectionUrl: process.env.AAA_DATABASE_CONNECTION_URL,
      database: process.env.AAA_DATABASE_NAME,
      extra: {
        user: process.env.AAA_DATABASE_USER || 'aaa',
        password: process.env.AAA_DATABASE_PASSWORD || 'aaa',
        connectString: process.env.AAA_DATABASE_CONNECT_STRING
      }
    });
    return toExternalClient<TDatabaseClient>('Oracle', connector);
  };

  const createRdsClient = (): TDatabaseClient => {
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
    return toExternalClient<TDatabaseClient>('RDS', connector);
  };

  const buildByDriver = (driver: DriverName): TDatabaseClient => {
    if (driver === 'InMemory') return inMemoryClient;
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
    return inMemoryClient;
  };

  const compileDatabaseClient = (): TDatabaseClient => {
    const driver = normalizeDriver(process.env.AAA_DATABASE_DRIVER);
    return buildByDriver(driver);
  };

  const compileDatabaseClientByDriver = (driver: string): TDatabaseClient => {
    return buildByDriver(normalizeDriver(driver));
  };

  return {
    compileDatabaseClient,
    compileDatabaseClientByDriver,
    compileMongoDbClient: (): TDatabaseClient => buildByDriver('Mongo'),
    compilePostgreSqlDbClient: (): TDatabaseClient => buildByDriver('PostgreSQL'),
    compileMySqlDbClient: (): TDatabaseClient => buildByDriver('MySQL'),
    compileMsSqlDbClient: (): TDatabaseClient => buildByDriver('MSSQL'),
    compileOracleDbClient: (): TDatabaseClient => buildByDriver('Oracle'),
    compileSqliteDbClient: (): TDatabaseClient => buildByDriver('SQLite'),
    compileDynamoDbClient: (): TDatabaseClient => buildByDriver('DynamoDB'),
    compileCassandraDbClient: (): TDatabaseClient => buildByDriver('Cassandra'),
    compileFirebaseDbClient: (): TDatabaseClient => buildByDriver('Firebase'),
    compileAuroraDbClient: (): TDatabaseClient => buildByDriver('Aurora'),
    compileRdsDbClient: (): TDatabaseClient => buildByDriver('RDS')
  };
};
