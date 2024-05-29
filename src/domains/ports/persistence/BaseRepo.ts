import { IDbClient } from '@src/infra/persistence/port/IDbClient';
import { IRepoConfig } from './IRepoConfig';
// import { IStore } from './IStore';

export abstract class BaseRepo<T> {
  // public store: IStore<T>;
  public dbClient: IDbClient;

  public limit: number;

  constructor(config: IRepoConfig) {
    const { limit, dbClient } = config;
    this.dbClient = dbClient;
    this.limit = limit ?? 30;
    // this.store = store;
  }

  public abstract create(data: T): Promise<T>;

  public abstract update(id: string, data: T): Promise<T>;

  public abstract delete(id: string): Promise<boolean>;

  public abstract getOneById(id: string): Promise<T>;

  public abstract getAll(page: number):Promise<T[]>;
}
