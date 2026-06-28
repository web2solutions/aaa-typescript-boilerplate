import { BaseExternalDataRepository, IRepositoryConnectionOptions } from '@src/infra/persistence/external/BaseExternalDataRepository';

export class AuroraRepository extends BaseExternalDataRepository {
  private client: any | null = null;

  constructor(options: IRepositoryConnectionOptions) {
    super({
      ...options,
      provider: 'amazon-aurora'
    });
  }

  public async connect(): Promise<void> {
    const postgresModule = await this.loadModule('postgres');
    const postgres = postgresModule.default || postgresModule;
    const connectionUrl = this.options.connectionUrl || this.getExtraOption<string>('connectionUrl', '');
    const max = this.getExtraOption<number>('poolMax', 20);

    const dsqlConnector = await this.loadOptionalModule('@aws/aurora-dsql-postgresjs')
      || await this.loadOptionalModule('@aws/aurora-dsql-connector')
      || await this.loadOptionalModule('@aws/aurora-dsql');

    if (dsqlConnector) {
      const createDsqlClient = (
        dsqlConnector.createClient || dsqlConnector.default?.createClient
      );
      const dsqlConfig = {
        region: this.options.region || this.getExtraOption<string>('region', 'us-east-1'),
        endpoint: this.options.endpoint
          || this.getExtraOption<string | undefined>('endpoint', undefined),
        database: this.options.database
          || this.getExtraOption<string | undefined>('database', undefined)
      };
      if (typeof createDsqlClient === 'function') {
        this.client = await createDsqlClient({
          ...dsqlConfig,
          max
        });
      }
    }

    if (!this.client) {
      if (!connectionUrl) {
        throw new Error(
          'AuroraRepository requires a "connectionUrl" when Aurora DSQL connector package is not available.'
        );
      }
      this.client = postgres(connectionUrl, {
        max,
        connect_timeout: this.getExtraOption<number>('connectTimeoutSec', 10),
        idle_timeout: this.getExtraOption<number>('idleTimeoutSec', 30)
      });
    }

    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    if (this.client && typeof this.client.end === 'function') {
      await this.client.end({
        timeout: this.getExtraOption<number>('closeTimeoutSec', 5)
      });
    } else if (this.client && typeof this.client.close === 'function') {
      await this.client.close();
    }
    this.client = null;
    this.connected = false;
  }

  public getClient(): any | null {
    return this.client;
  }
}
