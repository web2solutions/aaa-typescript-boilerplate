import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { IServiceResponse } from '@src/domains/ports/IServiceResponse';
import { IAuthService } from '@src/infra/auth/IAuthService';
import { IDbClient } from '@src/infra/persistence/port/IDbClient';

export interface IController {
  authService: IAuthService;
  openApiSpecification: any;
  dbClient: IDbClient;
  create(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  update(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  delete(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  getOneById(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  getAll(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  // update(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  // create(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
  // create(event: BaseDomainEvent): Promise<IServiceResponse<any>>;
}
