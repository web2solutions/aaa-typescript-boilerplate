import { BaseExternalDataRepository, IRepositoryConnectionOptions } from '@jumentix/external-persistence-core';

export class OracleRepository extends BaseExternalDataRepository {
  private connection: any | null = null;

  constructor(options: IRepositoryConnectionOptions) {
    super({
      ...options,
      provider: 'oracle'
    });
  }

  public async connect(): Promise<void> {
    const oracleModule = await this.loadModule('oracledb');
    const getConnection = oracleModule.getConnection || oracleModule.default?.getConnection;

    if (!getConnection) {
      throw new Error('Unable to resolve getConnection from "oracledb" package.');
    }

    const parsedUrl = OracleRepository.parseConnectionUrl(this.options.connectionUrl);
    const user = parsedUrl.user || this.getExtraOption<string>('user', 'aaa');
    const password = parsedUrl.password || this.getExtraOption<string>('password', 'aaa');
    const connectString = parsedUrl.connectString
      || this.getExtraOption<string>('connectString', '127.0.0.1:1521/FREEPDB1');

    this.connection = await getConnection({
      user,
      password,
      connectString
    });
    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    if (this.connection && typeof this.connection.close === 'function') {
      await this.connection.close();
    }
    this.connection = null;
    this.connected = false;
  }

  public getClient(): any | null {
    return this.connection;
  }

  private static parseConnectionUrl(connectionUrl?: string): {
    user?: string;
    password?: string;
    connectString?: string;
  } {
    if (!connectionUrl || connectionUrl.trim() === '') return {};
    try {
      const url = new URL(connectionUrl);
      const user = decodeURIComponent(url.username);
      const password = decodeURIComponent(url.password);
      const connectString = `${url.hostname}:${url.port || '1521'}${url.pathname || '/FREEPDB1'}`;
      return {
        user: user || undefined,
        password: password || undefined,
        connectString
      };
    } catch (error) {
      return {
        connectString: connectionUrl
      };
    }
  }
}
