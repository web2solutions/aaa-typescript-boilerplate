import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IPasswordCryptoService } from '@src/infra/security/IPasswordCryptoService';
import { IMutexService } from '@src/infra/mutex/port/IMutexService';
import { IJwtService } from '@src/infra/jwt/IJwtService';
import { IEventBus } from '@src/modules/port';

import { UserDataRepository } from '@src/modules/Users/infra/repository/UserDataRepository';
import { UserService } from '@src/modules/Users/service/UserService';
import { UserProviderLocal } from '@src/modules/Users/service/UserProviderLocal';
import { AuthService } from '@src/modules/Users/service/AuthService';
import { UserUseCases } from '@src/modules/Users/application/UserUseCases';
import { AuthUseCases } from '@src/modules/Users/application/AuthUseCases';
import { IUserUseCases } from '@src/modules/Users/application/ports/IUserUseCases';
import { IAuthUseCases } from '@src/modules/Users/application/ports/IAuthUseCases';
import { IUserProvider } from '@src/modules/Users/service/ports/IUserProvider';
import { IAuthService } from '@src/modules/Users/service/ports/IAuthService';

interface IUsersAuthCompositionConfig {
  databaseClient: IDatabaseClient;
  passwordCryptoService: IPasswordCryptoService;
  mutexService: IMutexService;
  jwtService: IJwtService;
  eventBus?: IEventBus;
}

interface IUsersAuthComposition {
  dataRepository: UserDataRepository;
  userService: UserService;
  userProvider: IUserProvider;
  authService: IAuthService;
  userUseCases: IUserUseCases;
  authUseCases: IAuthUseCases;
}

export const composeUsersAuthServices = (
  config: IUsersAuthCompositionConfig
): IUsersAuthComposition => {
  const {
    databaseClient,
    passwordCryptoService,
    mutexService,
    jwtService,
    eventBus
  } = config;

  const dataRepository = UserDataRepository.compile({
    databaseClient
  });
  const userService = UserService.compile({
    dataRepository,
    services: {
      passwordCryptoService,
      mutexService,
      eventBus
    }
  });
  const userProvider = UserProviderLocal.compile(userService);
  const authService = AuthService.compile(
    userProvider,
    passwordCryptoService,
    jwtService
  );
  const userUseCases = UserUseCases.compile(userService);
  const authUseCases = AuthUseCases.compile(authService, mutexService);

  return {
    dataRepository,
    userService,
    userProvider,
    authService,
    userUseCases,
    authUseCases
  };
};
