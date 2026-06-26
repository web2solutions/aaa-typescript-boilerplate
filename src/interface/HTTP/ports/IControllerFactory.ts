import { IAuthService } from '@src/modules/Users/service/ports/IAuthService';
import { UserService } from '@src/modules/Users/service/UserService';
import { IMutexService } from '@src/infra/mutex/port/IMutexService';
import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IPasswordCryptoService } from '@src/infra/security/IPasswordCryptoService';
// import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';

export interface IControllerFactory {
  authService: IAuthService;
  openApiSpecification: any;
  databaseClient: IDatabaseClient;
  userService?: UserService;
  passwordCryptoService?: IPasswordCryptoService,
  mutexService?: IMutexService;
}
