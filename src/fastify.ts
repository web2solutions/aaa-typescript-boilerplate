/* eslint-disable quote-props */
import { RestAPI } from '@src/infra/RestAPI';

import { FastifyServer, Fastify } from '@src/infra/server/HTTP/adapters/fastify/FastifyServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/fastify/handlers/infraHandlers';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';

import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { AuthService } from './infra/auth/AuthService';
import { PasswordCryptoService } from './infra/security/PasswordCryptoService';
import { InMemoryKeyValueStorageClient } from './infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { UserProviderLocal } from './infra/auth/UserProviderLocal';
import { UserDataRepository, UserService } from './domains/Users';
import { JwtService } from './infra/jwt/JwtService';

const serverType = EHTTPFrameworks.fastify;
const webServer = new FastifyServer();

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

const API: RestAPI<Fastify> = new RestAPI<Fastify>({
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
