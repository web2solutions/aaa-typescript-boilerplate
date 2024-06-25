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

const serverType = EHTTPFrameworks.fastify;
const webServer = new FastifyServer();

const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
const mutexService = MutexService.compile(keyValueStorageClient);

const authService = AuthService.compile();
const passwordCryptoService = PasswordCryptoService.compile();

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
