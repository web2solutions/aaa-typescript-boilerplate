import { BaseExternalDataRepository, IRepositoryConnectionOptions } from '@src/infra/persistence/external/BaseExternalDataRepository';

export class DynamoDbRepository extends BaseExternalDataRepository {
  private client: any | null = null;

  constructor(options: IRepositoryConnectionOptions) {
    super({
      ...options,
      provider: 'aws-dynamodb'
    });
  }

  public async connect(): Promise<void> {
    const dynamoModule = await this.loadModule('@aws-sdk/client-dynamodb');
    const DynamoDBClient = (
      dynamoModule.DynamoDBClient || dynamoModule.default?.DynamoDBClient
    );

    if (!DynamoDBClient) {
      throw new Error('Unable to resolve DynamoDBClient from "@aws-sdk/client-dynamodb".');
    }

    this.client = new DynamoDBClient({
      region: this.options.region || this.getExtraOption<string>('region', 'us-east-1'),
      endpoint: this.options.endpoint
        || this.getExtraOption<string | undefined>('endpoint', undefined)
    });

    if (this.getExtraOption<boolean>('healthCheckOnConnect', false)) {
      const ListTablesCommand = (
        dynamoModule.ListTablesCommand || dynamoModule.default?.ListTablesCommand
      );
      if (ListTablesCommand && typeof this.client.send === 'function') {
        await this.client.send(new ListTablesCommand({ Limit: 1 }));
      }
    }

    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    if (this.client && typeof this.client.destroy === 'function') {
      this.client.destroy();
    }
    this.client = null;
    this.connected = false;
  }

  public getClient(): any | null {
    return this.client;
  }
}
