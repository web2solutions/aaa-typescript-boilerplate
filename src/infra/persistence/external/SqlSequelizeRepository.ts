import {
  BaseExternalDataRepository,
  IRepositoryConnectionOptions
} from '@src/infra/persistence/external/BaseExternalDataRepository';

export type ESqlDialect = 'postgres' | 'mysql' | 'mssql' | 'oracle' | 'sqlite';

export interface ISqlSequelizeRepositoryOptions extends IRepositoryConnectionOptions {
  dialect: ESqlDialect;
}

export class SqlSequelizeRepository extends BaseExternalDataRepository {
  private readonly dialect: ESqlDialect;

  private sequelize: any | null = null;

  constructor(options: ISqlSequelizeRepositoryOptions) {
    super({
      ...options,
      provider: `sequelize-${options.dialect}`
    });
    this.dialect = options.dialect;
  }

  public async connect(): Promise<void> {
    const sequelizeModule = await this.loadModule('sequelize');
    const Sequelize = (
      sequelizeModule.Sequelize || sequelizeModule.default?.Sequelize || sequelizeModule.default
    );

    if (!Sequelize) {
      throw new Error('Unable to resolve Sequelize constructor from "sequelize" package.');
    }

    const connectionUrl = this.options.connectionUrl
      || `${this.dialect}://localhost:5432/${this.options.database || 'app'}`;
    this.sequelize = new Sequelize(connectionUrl, {
      dialect: this.dialect,
      pool: {
        max: this.getExtraOption<number>('poolMax', 15),
        min: this.getExtraOption<number>('poolMin', 0),
        acquire: this.getExtraOption<number>('poolAcquireMs', 30000),
        idle: this.getExtraOption<number>('poolIdleMs', 10000),
        evict: this.getExtraOption<number>('poolEvictMs', 1000)
      },
      logging: this.getExtraOption<boolean>('sequelizeLogging', false)
    });

    if (
      this.getExtraOption<boolean>('sequelizeAuthenticateOnConnect', true)
      && typeof this.sequelize.authenticate === 'function'
    ) {
      await this.sequelize.authenticate();
    }

    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    if (this.sequelize && typeof this.sequelize.close === 'function') {
      await this.sequelize.close();
    }
    this.sequelize = null;
    this.connected = false;
  }

  public getDialect(): ESqlDialect {
    return this.dialect;
  }

  public getClient(): any | null {
    return this.sequelize;
  }
}
