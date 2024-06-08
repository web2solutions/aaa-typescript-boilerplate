import { BaseModel } from './persistence/BaseModel';
import { BaseRepo } from './persistence/BaseRepo';

// import { IStore } from './IStore';
export type TRepos = Record<any, any>;
export type TServices = Record<any, any>

export interface IServiceConfig {
  repos?: TRepos;
  services?: TServices;
  repo: BaseRepo<BaseModel<Record<any, any>>, Record<any, any>, Record<any, any>>
}
