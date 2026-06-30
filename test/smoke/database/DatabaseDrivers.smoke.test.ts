/* eslint-disable jest/prefer-expect-assertions */
import { compileDatabaseClientByDriver } from '@src/infra/persistence/compileDatabaseClient';

interface IDriverSmokeCase {
  driver: string;
  env: Record<string, string>;
}

const shouldRunSmoke = process.env.RUN_DB_SMOKE === '1';
jest.setTimeout(180000);
const smokeDriverFilter = (process.env.AAA_DB_SMOKE_DRIVERS || '')
  .split(',')
  .map((item) => item.trim().toLowerCase())
  .filter((item) => item.length > 0);

const smokeCases: IDriverSmokeCase[] = [
  {
    driver: 'InMemory',
    env: {}
  },
  {
    driver: 'Mongo',
    env: {
      AAA_DATABASE_CONNECTION_URL: process.env.AAA_DATABASE_CONNECTION_URL || 'mongodb://127.0.0.1:27017/aaa'
    }
  },
  {
    driver: 'PostgreSQL',
    env: {
      AAA_DATABASE_CONNECTION_URL: process.env.AAA_DATABASE_CONNECTION_URL || 'postgres://aaa:aaa@127.0.0.1:5432/aaa'
    }
  },
  {
    driver: 'MySQL',
    env: {
      AAA_DATABASE_CONNECTION_URL: process.env.AAA_DATABASE_CONNECTION_URL || 'mysql://aaa:aaa@127.0.0.1:3306/aaa'
    }
  },
  {
    driver: 'MSSQL',
    env: {
      AAA_DATABASE_CONNECTION_URL: process.env.AAA_DATABASE_CONNECTION_URL
        || 'mssql://sa:example_mssql_password_change_me@127.0.0.1:1433/master?encrypt=false&trustServerCertificate=true'
    }
  },
  {
    driver: 'Oracle',
    env: {
      AAA_DATABASE_CONNECTION_URL: process.env.AAA_DATABASE_CONNECTION_URL || 'oracle://aaa:aaa@127.0.0.1:1521/FREEPDB1'
    }
  },
  {
    driver: 'SQLite',
    env: {
      AAA_DATABASE_CONNECTION_URL: process.env.AAA_DATABASE_CONNECTION_URL || 'sqlite::memory:'
    }
  },
  {
    driver: 'DynamoDB',
    env: {
      AAA_DATABASE_REGION: process.env.AAA_DATABASE_REGION || 'us-east-1',
      AAA_DATABASE_ENDPOINT: process.env.AAA_DATABASE_ENDPOINT || 'http://127.0.0.1:8000'
    }
  },
  {
    driver: 'Cassandra',
    env: {
      AAA_DATABASE_CASSANDRA_CONTACT_POINTS: process.env.AAA_DATABASE_CASSANDRA_CONTACT_POINTS || '127.0.0.1',
      AAA_DATABASE_CASSANDRA_DATACENTER: process.env.AAA_DATABASE_CASSANDRA_DATACENTER || 'datacenter1'
    }
  },
  {
    driver: 'Firebase',
    env: {
      AAA_DATABASE_PROJECT_ID: process.env.AAA_DATABASE_PROJECT_ID || 'demo-project'
    }
  },
  {
    driver: 'Aurora',
    env: {
      AAA_DATABASE_CONNECTION_URL: process.env.AAA_DATABASE_CONNECTION_URL || 'postgres://aaa:aaa@127.0.0.1:5433/aaa'
    }
  },
  {
    driver: 'RDS',
    env: {
      AAA_DATABASE_CONNECTION_URL: process.env.AAA_DATABASE_CONNECTION_URL || 'postgres://aaa:aaa@127.0.0.1:5434/aaa',
      AAA_DATABASE_DIALECT: process.env.AAA_DATABASE_DIALECT || 'postgres'
    }
  }
];
const selectedCases = smokeDriverFilter.length === 0
  ? smokeCases
  : smokeCases.filter((item) => smokeDriverFilter.includes(item.driver.toLowerCase()));

const wait = (ms: number): Promise<void> => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const connectWithRetry = async (
  connectFn: () => Promise<void>,
  attempts = 20,
  delayMs = 1000
): Promise<void> => {
  try {
    await connectFn();
  } catch (error) {
    if (attempts <= 1) throw error;
    await wait(delayMs);
    await connectWithRetry(connectFn, attempts - 1, delayMs);
  }
};

const getRetryConfig = (
  driver: string
): { attempts: number; delayMs: number } => {
  if (driver === 'Cassandra') {
    return { attempts: 60, delayMs: 2000 };
  }
  if (driver === 'Oracle') {
    return { attempts: 60, delayMs: 2000 };
  }
  return { attempts: 25, delayMs: 1000 };
};

describe('database driver smoke tests', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    Object.keys(process.env).forEach((key) => {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    });
    Object.entries(originalEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
  });

  if (!shouldRunSmoke) {
    it('is disabled unless RUN_DB_SMOKE=1', () => {
      expect.hasAssertions();
      expect(true).toBe(true);
    });
    return;
  }

  it.each(selectedCases)('driver $driver can connect/disconnect', async (smokeCase) => {
    process.env.AAA_DATABASE_DRIVER = smokeCase.driver;
    process.env.AAA_DATABASE_NAME = 'aaa';
    Object.entries(smokeCase.env).forEach(([key, value]) => {
      process.env[key] = value;
    });

    const client = compileDatabaseClientByDriver(smokeCase.driver);
    const retryConfig = getRetryConfig(smokeCase.driver);
    await expect(connectWithRetry(
      () => client.connect(),
      retryConfig.attempts,
      retryConfig.delayMs
    )).resolves.toBeUndefined();
    await expect(client.disconnect()).resolves.toBeUndefined();
  });
});
