import { IServiceResponse } from '@src/domains/ports/IServiceResponse';
import { IServiceConfig, TRepos, TServices } from './IServiceConfig';
import { IPagingRequest } from './persistence/IPagingRequest';
import { BaseRepo } from './persistence/BaseRepo';
import { BaseModel } from './persistence/BaseModel';

export abstract class BaseService<ResponseDataEntity, RequestCreateDTO, RequestUpdateDTO> {
  /**
   * repo is the main data repo associated to the service.
   * Mandatory
   */
  public repo: BaseRepo<BaseModel<Record<any, any>>, Record<any, any>, Record<any, any>>;

  /**
   * repos hold a collection of injected repos to be used when needed inside the service
   * Not Mandatory
   */
  public repos: TRepos;

  /**
   * services hold a collection of injected services to be used when needed inside the service
   * Not Mandatory
   */
  public services: TServices;

  constructor(config: IServiceConfig) {
    this.repos = config.repos ?? {};
    this.services = config.repos ?? {};
    if (!config.repo) throw Error('You must provide a data repository when creating a service instance.');
    this.repo = config.repo;
  }

  public abstract create(data: RequestCreateDTO): Promise<IServiceResponse<ResponseDataEntity>>;

  public abstract update(
    id: string,
    data: RequestUpdateDTO
  ): Promise<IServiceResponse<ResponseDataEntity>>;

  public abstract delete(id: string): Promise<IServiceResponse<boolean>>;

  public abstract getOneById(id: string): Promise<IServiceResponse<ResponseDataEntity>>;

  public abstract getAll(
    filters: Record<string, string|number>,
    paging: IPagingRequest
  ):Promise<IServiceResponse<ResponseDataEntity[]>>;
}
