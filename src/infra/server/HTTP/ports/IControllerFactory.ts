import { IAuthService } from '@src/infra/auth/IAuthService';
import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';

export interface IControllerFactory {
  authService: IAuthService;
  openApiSpecification: any;
  databaseClient: IDatabaseClient;
}
