import { IAuthService } from '@src/modules/Users/service/ports/IAuthService';
import { UserService } from '@src/modules/Users/service/UserService';
import { IUserUseCases } from '@src/modules/Users/application/ports/IUserUseCases';
import { IAuthUseCases } from '@src/modules/Users/application/ports/IAuthUseCases';
import { IMutexService } from '@src/infra/mutex/port/IMutexService';
import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IPasswordCryptoService } from '@src/infra/security/IPasswordCryptoService';
// import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';

export interface IControllerFactory {
  authService: IAuthService;
  openApiSpecification: any;
  databaseClient: IDatabaseClient;
  userService?: UserService;
  userUseCases?: IUserUseCases;
  authUseCases?: IAuthUseCases;
  passwordCryptoService?: IPasswordCryptoService,
  mutexService?: IMutexService;
}
