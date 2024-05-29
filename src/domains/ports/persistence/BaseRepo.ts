import { IDbClient } from '@src/infra/persistence/port/IDbClient';
import { IRepoConfig } from './IRepoConfig';
// import { IStore } from './IStore';

export abstract class BaseRepo<Model, RequestCreateObject, RequestUpdateObject> {
  // public store: IStore<Model>;
  public dbClient: IDbClient;

  public limit: number;

  constructor(config: IRepoConfig) {
    const { limit, dbClient } = config;
    this.dbClient = dbClient;
    this.limit = limit ?? 30;
    // this.store = store;
  }

  public abstract create(data: RequestCreateObject): Promise<Model>;

  public abstract update(id: string, data: RequestUpdateObject): Promise<Model>;

  public abstract delete(id: string): Promise<boolean>;

  public abstract getOneById(id: string): Promise<Model>;

  public abstract getAll(page: number):Promise<Model[]>;
}
