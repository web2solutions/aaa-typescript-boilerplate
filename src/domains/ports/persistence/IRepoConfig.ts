import { IDbClient } from '@src/infra/persistence/port/IDbClient';
// import { IStore } from './IStore';

export interface IRepoConfig {
    limit?: number;
    // store: IStore<T>;
    dbClient: IDbClient;
  }
