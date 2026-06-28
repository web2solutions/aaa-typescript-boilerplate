import { BaseExternalDataRepository, IRepositoryConnectionOptions } from '@src/infra/persistence/external/BaseExternalDataRepository';

export class MongoMongooseRepository extends BaseExternalDataRepository {
  private mongooseModule: any | null = null;

  private connection: any | null = null;

  constructor(options: IRepositoryConnectionOptions) {
    super({
      ...options,
      provider: 'mongoose-mongo'
    });
  }

  public async connect(): Promise<void> {
    this.mongooseModule = await this.loadModule('mongoose');
    const mongooseConnection = this.mongooseModule.default || this.mongooseModule;

    const connectionUrl = this.options.connectionUrl || `mongodb://127.0.0.1:27017/${this.options.database || 'app'}`;
    await mongooseConnection.connect(connectionUrl, {
      maxPoolSize: this.getExtraOption<number>('maxPoolSize', 20),
      minPoolSize: this.getExtraOption<number>('minPoolSize', 0),
      serverSelectionTimeoutMS: this.getExtraOption<number>('serverSelectionTimeoutMS', 5000),
      socketTimeoutMS: this.getExtraOption<number>('socketTimeoutMS', 45000),
      dbName: this.options.database
    });

    this.connection = mongooseConnection.connection;
    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    const mongooseConnection = this.mongooseModule?.default || this.mongooseModule;
    if (mongooseConnection && typeof mongooseConnection.disconnect === 'function') {
      await mongooseConnection.disconnect();
    }
    this.mongooseModule = null;
    this.connection = null;
    this.connected = false;
  }

  public getClient(): any | null {
    return this.connection;
  }
}
