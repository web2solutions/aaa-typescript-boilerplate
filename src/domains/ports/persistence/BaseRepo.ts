import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IRepoConfig } from './IRepoConfig';
// import { IStore } from './IStore';

export abstract class BaseRepo<Model, RequestCreateObject, RequestUpdateObject> {
  // public store: IStore<Model>;
  public databaseClient: IDatabaseClient;

  public limit: number;

  constructor(config: IRepoConfig) {
    const { limit, databaseClient } = config;
    this.databaseClient = databaseClient;
    this.limit = limit ?? 30;
    // this.store = store;
  }

  public abstract create(data: RequestCreateObject): Promise<Model>;

  public abstract update(id: string, data: RequestUpdateObject): Promise<Model>;

  public abstract delete(id: string): Promise<boolean>;

  public abstract getOneById(id: string): Promise<Model>;

  public abstract getAll(page: number):Promise<Model[]>;
}
