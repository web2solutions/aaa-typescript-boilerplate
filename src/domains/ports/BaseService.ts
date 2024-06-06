import { IServiceResponse } from '@src/domains/ports/IServiceResponse';
import { IServiceConfig, TRepos } from './IServiceConfig';
import { IPagingRequest } from './persistence/IPagingRequest';

export abstract class BaseService<ResponseDataEntity, RequestCreate, RequestUpdate> {
  public repos: TRepos;

  constructor(config: IServiceConfig) {
    this.repos = config.repos ?? {};
  }

  public abstract create(data: RequestCreate): Promise<IServiceResponse<ResponseDataEntity>>;

  public abstract update(
    id: string,
    data: RequestUpdate
  ): Promise<IServiceResponse<ResponseDataEntity>>;

  public abstract delete(id: string): Promise<IServiceResponse<boolean>>;

  public abstract getOneById(id: string): Promise<IServiceResponse<ResponseDataEntity>>;

  public abstract getAll(
    filters: Record<string, string|number>,
    paging: IPagingRequest
  ):Promise<IServiceResponse<ResponseDataEntity[]>>;
}
