import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { IServiceResponse } from '@src/domains/ports/IServiceResponse';
import { IAuthService } from '@src/infra/auth/IAuthService';
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
