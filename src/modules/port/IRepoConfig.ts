import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
// import { IStore } from './IStore';

export interface IRepoConfig {
    limit?: number;
    // store: IStore<T>;
    databaseClient: IDatabaseClient;
  }
