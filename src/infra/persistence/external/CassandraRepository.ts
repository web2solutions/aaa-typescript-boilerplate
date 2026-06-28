import { BaseExternalDataRepository, IRepositoryConnectionOptions } from '@src/infra/persistence/external/BaseExternalDataRepository';

export class CassandraRepository extends BaseExternalDataRepository {
  private client: any | null = null;

  constructor(options: IRepositoryConnectionOptions) {
    super({
      ...options,
      provider: 'cassandra'
    });
  }

  public async connect(): Promise<void> {
    const cassandraModule = await this.loadModule('cassandra-driver');
    const CassandraClient = cassandraModule.Client || cassandraModule.default?.Client;

    if (!CassandraClient) {
      throw new Error('Unable to resolve cassandra-driver Client.');
    }

    const contactPoints = this.getExtraOption<string[]>('contactPoints', ['127.0.0.1']);
    const localDataCenter = this.getExtraOption<string>('localDataCenter', 'datacenter1');
    const keyspace = this.options.database || this.getExtraOption<string | undefined>('keyspace', undefined);

    const baseConfig = {
      contactPoints,
      localDataCenter
    };
    this.client = new CassandraClient({
      ...baseConfig,
      keyspace
    });

    if (typeof this.client.connect === 'function') {
      try {
        await this.client.connect();
      } catch (error: any) {
        const message = String(error?.message || '');
        if (keyspace && message.toLowerCase().includes('keyspace')) {
          const adminClient = new CassandraClient(baseConfig);
          await adminClient.connect();
          await adminClient.execute(
            `CREATE KEYSPACE IF NOT EXISTS ${keyspace} WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}`
          );
          await adminClient.shutdown();
          this.client = new CassandraClient({
            ...baseConfig,
            keyspace
          });
          await this.client.connect();
        } else {
          throw error;
        }
      }
    }

    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    if (this.client && typeof this.client.shutdown === 'function') {
      await this.client.shutdown();
    }
    this.client = null;
    this.connected = false;
  }

  public getClient(): any | null {
    return this.client;
  }
}
