import {
  IPagingRequest, IServiceResponse, IServiceConfig, TRepos, TServices, BaseRepo, BaseModel
} from '@src/modules/port';

export abstract class BaseService<ResponseDataEntity, RequestCreateDTO, RequestUpdateDTO> {
  /**
   * dataRepository is the main data dataRepository associated to the service.
   * Mandatory
   */
  public dataRepository: BaseRepo<BaseModel<Record<any, any>>, Record<any, any>, Record<any, any>>;

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
    if (!config.dataRepository) throw Error('You must provide a data repository when creating a service instance.');
    this.dataRepository = config.dataRepository;
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
