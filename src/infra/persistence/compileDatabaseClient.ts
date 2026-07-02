import { buildDatabaseClientCompilers } from '@jumentix/database-client-factory';
import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';

const compilers = buildDatabaseClientCompilers<IDatabaseClient>({
  inMemoryClient: InMemoryDbClient
});

export const {
  compileDatabaseClient,
  compileDatabaseClientByDriver,
  compileMongoDbClient,
  compilePostgreSqlDbClient,
  compileMySqlDbClient,
  compileMsSqlDbClient,
  compileOracleDbClient,
  compileSqliteDbClient,
  compileDynamoDbClient,
  compileCassandraDbClient,
  compileFirebaseDbClient,
  compileAuroraDbClient,
  compileRdsDbClient
} = compilers;
