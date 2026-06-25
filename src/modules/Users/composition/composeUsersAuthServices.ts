import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IPasswordCryptoService } from '@src/infra/security/IPasswordCryptoService';
import { IMutexService } from '@src/infra/mutex/port/IMutexService';
import { IJwtService } from '@src/infra/jwt/IJwtService';

import {
  UserDataRepository,
  UserService,
  UserProviderLocal,
  AuthService,
  IUserProvider,
  IAuthService
} from '@src/modules/Users';

interface IUsersAuthCompositionConfig {
  databaseClient: IDatabaseClient;
  passwordCryptoService: IPasswordCryptoService;
  mutexService: IMutexService;
  jwtService: IJwtService;
}

interface IUsersAuthComposition {
  dataRepository: UserDataRepository;
  userService: UserService;
  userProvider: IUserProvider;
  authService: IAuthService;
}

export const composeUsersAuthServices = (
  config: IUsersAuthCompositionConfig
): IUsersAuthComposition => {
  const {
    databaseClient,
    passwordCryptoService,
    mutexService,
    jwtService
  } = config;

  const dataRepository = UserDataRepository.compile({
    databaseClient
  });
  const userService = UserService.compile({
    dataRepository,
    services: {
      passwordCryptoService,
      mutexService
    }
  });
  const userProvider = UserProviderLocal.compile(userService);
  const authService = AuthService.compile(
    userProvider,
    passwordCryptoService,
    jwtService
  );

  return {
    dataRepository,
    userService,
    userProvider,
    authService
  };
};
