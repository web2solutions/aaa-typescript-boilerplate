import { IAuthService } from '@src/infra/auth/IAuthService';
import { IMutexService } from '@src/infra/mutex/port/IMutexService';
import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';

export interface IControllerFactory {
  authService: IAuthService;
  openApiSpecification: any;
  databaseClient: IDatabaseClient;
  passwordCryptoService?: PasswordCryptoService,
  mutexService?: IMutexService;
}
