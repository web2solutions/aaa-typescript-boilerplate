import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { _DEFAULT_PAGE_SIZE_ } from '@src/infra/config/constants';
import { IRepoConfig } from './IRepoConfig';

import { IPagingRequest } from './IPagingRequest';
import { IPagingResponse } from './IPagingResponse';

export abstract class BaseRepo<Model, RequestCreateDTO, RequestUpdateDTO> {
  public databaseClient: IDatabaseClient;

  public limit: number;

  constructor(config: IRepoConfig) {
    const { limit, databaseClient } = config;

    this.databaseClient = databaseClient;

    this.limit = limit ?? _DEFAULT_PAGE_SIZE_;
  }

  public abstract create(data: RequestCreateDTO): Promise<Model>;

  public abstract update(id: string, data: RequestUpdateDTO): Promise<Model>;

  public abstract delete(id: string): Promise<boolean>;

  public abstract getOneById(id: string): Promise<Model>;

  public abstract getAll(
    filters: Record<string, string|number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<Model[]>>;
}
