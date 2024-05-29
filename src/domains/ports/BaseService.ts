import { IServiceResponse } from '@src/domains/ports/IServiceResponse';
import { IServiceConfig, TRepos } from './IServiceConfig';

export abstract class BaseService<T, M> {
  // public store: IStore<T>;
  public repos: TRepos;

  constructor(config: IServiceConfig) {
    this.repos = config.repos ?? {};
  }

  public abstract create(data: unknown): Promise<IServiceResponse<T>>;

  public abstract update(id: string, data: T): Promise<IServiceResponse<T>>;

  public abstract delete(id: string): Promise<IServiceResponse<boolean>>;

  public abstract getOneById(id: string): Promise<IServiceResponse<T>>;

  public abstract getAll(page: number):Promise<IServiceResponse<T[]>>;

  public getOneByUserEmail?(userEmail: string): Promise<IServiceResponse<T>>;

  public sendTokens?(account: M, data: any): Promise<M>;

  public receiveTokens?(account: M, data: any): Promise<M>;
}
