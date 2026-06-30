import {
  BaseExternalDataRepository,
  AuroraRepository,
  CassandraRepository,
  DynamoDbRepository,
  FirebaseRepository,
  MongoMongooseRepository,
  OracleRepository,
  RdsRepository,
  SqlSequelizeRepository
} from '@src/infra/persistence/external';

class TestableExternalRepository extends BaseExternalDataRepository {
  public constructor(options: Record<string, unknown>) {
    super({ ...options });
  }

  public async connect(): Promise<void> {
    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
  }

  public readRequiredOption(key: 'provider' | 'connectionUrl' | 'database' | 'region' | 'endpoint'): string {
    return this.getRequiredOption(key);
  }

  public readExtra<T>(key: string, fallback: T): T {
    return this.getExtraOption<T>(key, fallback);
  }

  public async importModule(moduleName: string): Promise<any> {
    return this.loadModule(moduleName);
  }

  public async importOptionalModule(moduleName: string): Promise<any | null> {
    return this.loadOptionalModule(moduleName);
  }
}

function createLoadModuleMock(moduleMocks: Record<string, any>) {
  return async (...args: unknown[]) => {
    const moduleName = String(args[0]);
    const loadedModule = moduleMocks[moduleName];
    if (!loadedModule) {
      throw new Error(`Missing optional dependency "${moduleName}"`);
    }
    return loadedModule;
  };
}

describe('external data repository foundations', () => {
  const moduleMocks: Record<string, any> = {};
  let loadModuleSpy: jest.SpyInstance;

  beforeEach(() => {
    moduleMocks.sequelize = {
      Sequelize: jest.fn().mockImplementation(() => ({
        authenticate: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined)
      }))
    };

    moduleMocks.mongoose = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      connection: {
        db: {
          collection: jest.fn()
        }
      }
    };

    moduleMocks['@aws-sdk/client-dynamodb'] = {
      DynamoDBClient: jest.fn().mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({}),
        destroy: jest.fn()
      })),
      ListTablesCommand: jest.fn().mockImplementation((input) => ({ input }))
    };

    moduleMocks['cassandra-driver'] = {
      Client: jest.fn().mockImplementation(() => ({
        connect: jest.fn().mockResolvedValue(undefined),
        shutdown: jest.fn().mockResolvedValue(undefined)
      }))
    };

    moduleMocks['firebase-admin/app'] = {
      initializeApp: jest.fn().mockImplementation(() => ({
        delete: jest.fn().mockResolvedValue(undefined)
      })),
      cert: jest.fn().mockReturnValue('firebase-credential')
    };
    moduleMocks['firebase-admin/firestore'] = {
      getFirestore: jest.fn().mockImplementation(() => ({
        collection: jest.fn()
      }))
    };

    moduleMocks.oracledb = {
      getConnection: jest.fn().mockResolvedValue({
        close: jest.fn().mockResolvedValue(undefined)
      })
    };

    moduleMocks.postgres = {
      default: jest.fn().mockImplementation(() => ({
        end: jest.fn().mockResolvedValue(undefined)
      }))
    };

    loadModuleSpy = jest.spyOn(BaseExternalDataRepository.prototype as any, 'loadModule')
      .mockImplementation(createLoadModuleMock(moduleMocks));
  });

  afterEach(() => {
    loadModuleSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('connects and disconnects all repositories', async () => {
    expect.hasAssertions();

    const repositories = [
      new SqlSequelizeRepository({ dialect: 'postgres', extra: { sequelizeAuthenticateOnConnect: false } }),
      new SqlSequelizeRepository({ dialect: 'mysql', extra: { sequelizeAuthenticateOnConnect: false } }),
      new SqlSequelizeRepository({ dialect: 'mssql', extra: { sequelizeAuthenticateOnConnect: false } }),
      new SqlSequelizeRepository({ dialect: 'oracle', extra: { sequelizeAuthenticateOnConnect: false } }),
      new SqlSequelizeRepository({ dialect: 'sqlite', extra: { sequelizeAuthenticateOnConnect: false } }),
      new MongoMongooseRepository({ provider: 'mongoose-mongo' }),
      new DynamoDbRepository({ provider: 'aws-dynamodb' }),
      new CassandraRepository({ provider: 'cassandra' }),
      new FirebaseRepository({ provider: 'firebase' }),
      new OracleRepository({ provider: 'oracle', connectionUrl: 'oracle://aaa:aaa@127.0.0.1:1521/FREEPDB1' }),
      new AuroraRepository({ provider: 'amazon-aurora', connectionUrl: 'postgres://localhost:5432/app' }),
      new RdsRepository({ provider: 'amazon-rds', extra: { dialect: 'postgres', sequelizeAuthenticateOnConnect: false } })
    ];

    await Promise.all(repositories.map(async (repository) => {
      expect(repository.isConnected()).toBe(false);
      await repository.connect();
      expect(repository.isConnected()).toBe(true);
      await repository.disconnect();
      expect(repository.isConnected()).toBe(false);
      expect(repository.getProviderName()).toBeTruthy();
    }));
  });

  it('keeps sql dialect metadata accessible and configures sequelize pool', async () => {
    expect.hasAssertions();
    const repository = new SqlSequelizeRepository({
      dialect: 'postgres',
      connectionUrl: 'postgres://localhost/test',
      extra: {
        poolMax: 25,
        poolMin: 1,
        poolAcquireMs: 5000,
        poolIdleMs: 3000,
        poolEvictMs: 1000,
        sequelizeAuthenticateOnConnect: false
      }
    });
    expect(repository.getDialect()).toBe('postgres');
    await repository.connect();
    expect(repository.getProviderName()).toBe('sequelize-postgres');
    expect(moduleMocks.sequelize.Sequelize).toHaveBeenCalledWith('postgres://localhost/test', expect.objectContaining({
      dialect: 'postgres',
      pool: expect.objectContaining({
        max: 25,
        min: 1,
        acquire: 5000,
        idle: 3000,
        evict: 1000
      })
    }));
  });

  it('configures mongoose connection pooling options', async () => {
    expect.hasAssertions();
    const repository = new MongoMongooseRepository({
      database: 'aaa',
      extra: {
        maxPoolSize: 30,
        minPoolSize: 2
      }
    });
    await repository.connect();
    expect(moduleMocks.mongoose.connect).toHaveBeenCalledWith(
      'mongodb://127.0.0.1:27017/aaa',
      expect.objectContaining({
        maxPoolSize: 30,
        minPoolSize: 2,
        dbName: 'aaa'
      })
    );
  });

  it('creates dynamodb client with region and endpoint', async () => {
    expect.hasAssertions();
    const repository = new DynamoDbRepository({
      region: 'us-east-1',
      endpoint: 'http://localhost:8000'
    });
    await repository.connect();
    expect(moduleMocks['@aws-sdk/client-dynamodb'].DynamoDBClient).toHaveBeenCalledWith({
      region: 'us-east-1',
      endpoint: 'http://localhost:8000'
    });
  });

  it('covers base repository helper contracts', () => {
    expect.hasAssertions();
    const repository = new TestableExternalRepository({
      provider: 'test-provider',
      connectionUrl: 'file://test',
      extra: {
        retries: 2
      }
    });

    expect(repository.readRequiredOption('provider')).toBe('test-provider');
    expect(repository.readExtra<number>('retries', 0)).toBe(2);
    expect(repository.readExtra<number>('missing', 1)).toBe(1);
    expect(() => repository.readRequiredOption('database')).toThrow('Missing required option');
  });

  it('covers base repository module loading fallback', async () => {
    expect.hasAssertions();
    const repository = new TestableExternalRepository({
      provider: 'test-provider'
    });
    await expect(repository.importModule('module-that-does-not-exist-aaa'))
      .rejects.toThrow('Missing optional dependency');
    await expect(repository.importOptionalModule('module-that-does-not-exist-bbb'))
      .resolves.toBeNull();
  });

  it('covers base repository loadModule catch branch directly', async () => {
    expect.hasAssertions();
    loadModuleSpy.mockRestore();
    const repository = new TestableExternalRepository({
      provider: 'test-provider'
    });
    await expect(repository.importModule('module-that-does-not-exist-directly'))
      .rejects.toThrow('Install it before connecting');
    loadModuleSpy = jest.spyOn(BaseExternalDataRepository.prototype as any, 'loadModule')
      .mockImplementation(createLoadModuleMock(moduleMocks));
  });

  it('covers aurora dsql connector and close fallback branches', async () => {
    expect.hasAssertions();
    const close = jest.fn().mockResolvedValue(undefined);
    moduleMocks.postgres = {
      default: jest.fn().mockImplementation(() => ({
        close
      }))
    };
    moduleMocks['@aws/aurora-dsql-postgresjs'] = {
      createClient: jest.fn().mockResolvedValue({
        close
      })
    };

    const repository = new AuroraRepository({
      provider: 'amazon-aurora',
      region: 'us-east-1'
    });

    await repository.connect();
    expect(moduleMocks['@aws/aurora-dsql-postgresjs'].createClient)
      .toHaveBeenCalledWith(expect.any(Object));
    await repository.disconnect();
    expect(close).toHaveBeenCalledWith();
  });

  it('covers aurora fallback error when connector and connection url are missing', async () => {
    expect.hasAssertions();
    delete moduleMocks['@aws/aurora-dsql-postgresjs'];
    delete moduleMocks['@aws/aurora-dsql-connector'];
    delete moduleMocks['@aws/aurora-dsql'];
    const repository = new AuroraRepository({
      provider: 'amazon-aurora'
    });
    await expect(repository.connect()).rejects.toThrow(
      'AuroraRepository requires a "connectionUrl" when Aurora DSQL connector package is not available.'
    );
  });

  it('covers sql repository error branch when connector is malformed', async () => {
    expect.hasAssertions();
    moduleMocks.sequelize = {};
    await expect(
      new SqlSequelizeRepository({
        dialect: 'postgres'
      }).connect()
    ).rejects.toThrow('Unable to resolve Sequelize constructor');
  });

  it('covers dynamodb repository error branch when connector is malformed', async () => {
    expect.hasAssertions();
    moduleMocks['@aws-sdk/client-dynamodb'] = {};
    await expect(
      new DynamoDbRepository({
        provider: 'aws-dynamodb'
      }).connect()
    ).rejects.toThrow('Unable to resolve DynamoDBClient');
  });

  it('covers cassandra repository error branch when connector is malformed', async () => {
    expect.hasAssertions();
    moduleMocks['cassandra-driver'] = {};
    await expect(
      new CassandraRepository({
        provider: 'cassandra'
      }).connect()
    ).rejects.toThrow('Unable to resolve cassandra-driver Client');
  });

  it('covers cassandra keyspace auto-create fallback branch', async () => {
    expect.hasAssertions();
    const connectWithKeyspace = jest.fn()
      .mockRejectedValueOnce(new Error('Keyspace does not exist'))
      .mockResolvedValue(undefined);
    const adminConnect = jest.fn().mockResolvedValue(undefined);
    const adminExecute = jest.fn().mockResolvedValue(undefined);
    const adminShutdown = jest.fn().mockResolvedValue(undefined);
    moduleMocks['cassandra-driver'] = {
      Client: jest.fn()
        .mockImplementationOnce(() => ({
          connect: connectWithKeyspace,
          shutdown: jest.fn().mockResolvedValue(undefined)
        }))
        .mockImplementationOnce(() => ({
          connect: adminConnect,
          execute: adminExecute,
          shutdown: adminShutdown
        }))
        .mockImplementationOnce(() => ({
          connect: jest.fn().mockResolvedValue(undefined),
          shutdown: jest.fn().mockResolvedValue(undefined)
        }))
    };

    const repository = new CassandraRepository({
      provider: 'cassandra',
      database: 'aaa'
    });
    await repository.connect();
    expect(adminConnect).toHaveBeenCalledWith();
    expect(adminExecute).toHaveBeenCalledWith(expect.stringContaining('CREATE KEYSPACE IF NOT EXISTS aaa'));
    expect(adminShutdown).toHaveBeenCalledWith();
  });

  it('covers firebase repository error branch when connector is malformed', async () => {
    expect.hasAssertions();
    moduleMocks['firebase-admin/app'] = {};
    await expect(
      new FirebaseRepository({
        provider: 'firebase'
      }).connect()
    ).rejects.toThrow('Unable to resolve initializeApp');
  });

  it('covers firebase repository firestore missing branch and option mapping', async () => {
    expect.hasAssertions();
    const initializeApp = jest.fn().mockImplementation(() => ({
      delete: jest.fn().mockResolvedValue(undefined)
    }));
    const cert = jest.fn().mockReturnValue('cert-object');
    moduleMocks['firebase-admin/app'] = { initializeApp, cert };
    moduleMocks['firebase-admin/firestore'] = {};
    await expect(
      new FirebaseRepository({
        provider: 'firebase',
        extra: {
          projectId: 'demo-project',
          serviceAccount: { project_id: 'demo-project' }
        }
      }).connect()
    ).rejects.toThrow('Unable to resolve getFirestore');
    expect(initializeApp).toHaveBeenCalledWith(expect.objectContaining({
      projectId: 'demo-project',
      credential: 'cert-object'
    }));
  });

  it('covers oracle repository error branch when connector is malformed', async () => {
    expect.hasAssertions();
    moduleMocks.oracledb = {};
    await expect(
      new OracleRepository({
        provider: 'oracle'
      }).connect()
    ).rejects.toThrow('Unable to resolve getConnection');
  });

  it('covers rds repository error branch when connector is malformed', async () => {
    expect.hasAssertions();
    moduleMocks.sequelize = {};
    await expect(
      new RdsRepository({
        provider: 'amazon-rds'
      }).connect()
    ).rejects.toThrow('Unable to resolve Sequelize constructor');
  });

  it('covers sql client authentication and shutdown branches', async () => {
    expect.hasAssertions();
    const auth = jest.fn().mockResolvedValue(undefined);
    const close = jest.fn().mockResolvedValue(undefined);
    moduleMocks.sequelize = {
      Sequelize: jest.fn().mockImplementation(() => ({
        authenticate: auth,
        close
      }))
    };

    const sqlRepository = new SqlSequelizeRepository({
      dialect: 'postgres',
      extra: {
        sequelizeAuthenticateOnConnect: true
      }
    });
    await sqlRepository.connect();
    expect(auth).toHaveBeenCalledTimes(1);
    expect(sqlRepository.getClient()).toBeTruthy();
    await sqlRepository.disconnect();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('covers rds client getter branch', async () => {
    expect.hasAssertions();
    moduleMocks.sequelize = {
      Sequelize: jest.fn().mockImplementation(() => ({
        authenticate: jest.fn().mockResolvedValue(undefined),
        close: jest.fn().mockResolvedValue(undefined)
      }))
    };
    const rdsRepository = new RdsRepository({
      provider: 'amazon-rds',
      extra: {
        dialect: 'postgres',
        sequelizeAuthenticateOnConnect: true
      }
    });
    await rdsRepository.connect();
    expect(rdsRepository.getClient()).toBeTruthy();
    await rdsRepository.disconnect();
  });

  it('covers dynamodb health check and getter branches', async () => {
    expect.hasAssertions();
    const send = jest.fn().mockResolvedValue(undefined);
    moduleMocks['@aws-sdk/client-dynamodb'] = {
      DynamoDBClient: jest.fn().mockImplementation(() => ({
        send,
        destroy: jest.fn()
      })),
      ListTablesCommand: jest.fn().mockImplementation((input) => ({ input }))
    };

    const dynamoRepository = new DynamoDbRepository({
      provider: 'aws-dynamodb',
      extra: {
        healthCheckOnConnect: true
      }
    });
    await dynamoRepository.connect();
    expect(send).toHaveBeenCalledWith(expect.any(Object));
    expect(dynamoRepository.getClient()).toBeTruthy();
    await dynamoRepository.disconnect();
  });

  it('covers mongo client getter branch', async () => {
    expect.hasAssertions();
    const mongoRepository = new MongoMongooseRepository({
      provider: 'mongoose-mongo'
    });
    await mongoRepository.connect();
    expect(mongoRepository.getClient()).toBeTruthy();
    await mongoRepository.disconnect();
  });

  it('covers cassandra client getter branch', async () => {
    expect.hasAssertions();
    const cassandraRepository = new CassandraRepository({
      provider: 'cassandra'
    });
    await cassandraRepository.connect();
    expect(cassandraRepository.getClient()).toBeTruthy();
    await cassandraRepository.disconnect();
  });

  it('covers firebase client getter branch', async () => {
    expect.hasAssertions();
    const firebaseRepository = new FirebaseRepository({
      provider: 'firebase'
    });
    await firebaseRepository.connect();
    expect(firebaseRepository.getClient()).toBeTruthy();
    await firebaseRepository.disconnect();
  });

  it('covers oracle client getter branch', async () => {
    expect.hasAssertions();
    const oracleRepository = new OracleRepository({
      provider: 'oracle',
      connectionUrl: 'oracle://aaa:aaa@127.0.0.1:1521/FREEPDB1'
    });
    await oracleRepository.connect();
    expect(moduleMocks.oracledb.getConnection).toHaveBeenCalledWith(
      expect.objectContaining({
        user: 'aaa',
        password: 'aaa'
      })
    );
    expect(oracleRepository.getClient()).toBeTruthy();
    await oracleRepository.disconnect();
  });

  it('covers aurora client getter branch', async () => {
    expect.hasAssertions();
    const auroraRepository = new AuroraRepository({
      provider: 'amazon-aurora',
      connectionUrl: 'postgres://localhost:5432/app'
    });
    await auroraRepository.connect();
    expect(auroraRepository.getClient()).toBeTruthy();
    await auroraRepository.disconnect();
  });
});
