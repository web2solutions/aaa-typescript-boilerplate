/* eslint-disable quote-props */
import HyperExpress from 'hyper-express';

import { HyperExpressServer } from '@src/infra/server/HTTP/adapters/hyper-express/HyperExpressServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/hyper-express/handlers/infraHandlers';
import { AuthService } from '@src/infra/auth/AuthService';
import { UserProviderLocal } from '@src/infra/auth/UserProviderLocal';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { JwtService } from '@src/infra/jwt/JwtService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';
import { RestAPI } from '@src/infra/RestAPI';

import { UserDataRepository, UserService } from '@src/domains/Users';

const serverType = EHTTPFrameworks.hyper_express;
const webServer = new HyperExpressServer();

const passwordCryptoService = PasswordCryptoService.compile();
const jwtService = JwtService.compile();
const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
const mutexService = MutexService.compile(keyValueStorageClient);

// LOCAL IDENTITY PROVIDER
const dataRepository = UserDataRepository.compile({
  databaseClient: InMemoryDbClient
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
// LOCAL IDENTITY PROVIDER

const API = new RestAPI<HyperExpress.Server>({
  databaseClient: InMemoryDbClient,
  webServer,
  infraHandlers,
  serverType,
  authService,
  passwordCryptoService,
  keyValueStorageClient,
  mutexService
});

// eslint-disable-next-line jest/require-hook
(async () => {
  await API.start();
  await API.seedData();
})();
