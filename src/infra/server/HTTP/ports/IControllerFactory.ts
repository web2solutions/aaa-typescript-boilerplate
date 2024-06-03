import { IAuthService } from '@src/infra/auth/IAuthService';
import { IDbClient } from '@src/infra/persistence/port/IDbClient';

export interface IControllerFactory {
  authService: IAuthService;
  openApiSpecification: any;
  dbClient: IDbClient;
}
