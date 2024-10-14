import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import { IServiceResponse } from '@src/modules/port';
import { IAuthService } from '@src/modules/Users/service/ports/IAuthService';
import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';

export interface IController {
  authService: IAuthService;
  openApiSpecification: any;
  databaseClient: IDatabaseClient;
  create?(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  update?(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  delete?(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  getOneById?(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  getAll?(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  login?(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  logout?(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  register?(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  updatePassword?(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  // update(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  // create(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  // create(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
}
