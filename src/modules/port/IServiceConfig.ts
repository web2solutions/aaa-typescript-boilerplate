import { BaseModel } from './BaseModel';
import { BaseRepo } from './BaseRepo';

// import { IStore } from './IStore';
import { TRepos } from './TRepos';
import { TServices } from './TServices';

export interface IServiceConfig {
  repos?: TRepos;
  services?: TServices;
  dataRepository: BaseRepo<BaseModel<Record<any, any>>, Record<any, any>, Record<any, any>>
}
