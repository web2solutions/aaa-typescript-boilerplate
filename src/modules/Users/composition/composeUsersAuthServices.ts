import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IPasswordCryptoService } from '@src/infra/security/IPasswordCryptoService';
import { IMutexService } from '@src/infra/mutex/port/IMutexService';
import { IJwtService } from '@src/infra/jwt/IJwtService';
import { IEventBus, IMessageMediator } from '@src/modules/port';

import { UserDataRepository } from '@src/modules/Users/adapters/out/persistence/UserDataRepository';
import { UserService } from '@src/modules/Users/service/UserService';
import { UserProviderLocal } from '@src/modules/Users/service/UserProviderLocal';
import { AuthService } from '@src/modules/Users/service/AuthService';
import { UserUseCases } from '@src/modules/Users/application/use-cases/UserUseCases';
import { AuthUseCases } from '@src/modules/Users/application/use-cases/AuthUseCases';
import { IUserUseCases } from '@src/modules/Users/application/ports/IUserUseCases';
import { IAuthUseCases } from '@src/modules/Users/application/ports/IAuthUseCases';
import { IUserEventListeners } from '@src/modules/Users/events/contracts/IUserEventListeners';
import { registerUserEventListeners } from '@src/modules/Users/events/listeners/registerUserEventListeners';
import { registerUserMessageHandlers } from '@src/modules/Users/events/listeners/registerUserMessageHandlers';
import { IUserProvider } from '@src/modules/Users/service/ports/IUserProvider';
import { IAuthService } from '@src/modules/Users/service/ports/IAuthService';

interface IUsersAuthCompositionConfig {
  databaseClient: IDatabaseClient;
  passwordCryptoService: IPasswordCryptoService;
  mutexService: IMutexService;
  jwtService: IJwtService;
  eventBus?: IEventBus;
  messageMediator?: IMessageMediator;
  userEventListeners?: IUserEventListeners;
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
    eventBus,
    messageMediator,
    userEventListeners
  } = config;
  const integrationBus = messageMediator ?? eventBus;

  const dataRepository = UserDataRepository.compile({
    databaseClient
  });
  const userService = UserService.compile({
    dataRepository,
    services: {
      passwordCryptoService,
      mutexService,
      eventBus: integrationBus
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

  if (integrationBus) {
    registerUserEventListeners(integrationBus, userEventListeners);
  }
  if (messageMediator) {
    registerUserMessageHandlers(messageMediator, authService);
  }

  return {
    dataRepository,
    userService,
    userProvider,
    authService,
    userUseCases,
    authUseCases
  };
};
