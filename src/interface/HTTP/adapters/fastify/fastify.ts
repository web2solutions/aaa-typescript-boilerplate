/* eslint-disable quote-props */
import { FastifyServer, Fastify } from '@src/interface/HTTP/adapters/fastify/FastifyServer';
import { infraHandlers } from '@src/interface/HTTP/adapters/fastify/handlers/infraHandlers';

import {
  composeUsersAuthServices
} from '@src/modules/Users';

import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { JwtService } from '@src/infra/jwt/JwtService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { EHTTPFrameworks } from '@src/interface/HTTP/ports';
import { RestAPI } from '@src/interface/HTTP/RestAPI';

const serverType = EHTTPFrameworks.fastify;
const webServer = FastifyServer.compile();

const passwordCryptoService = PasswordCryptoService.compile();
const jwtService = JwtService.compile();
const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
const mutexService = MutexService.compile(keyValueStorageClient);

const { authService } = composeUsersAuthServices({
  databaseClient: InMemoryDbClient,
  passwordCryptoService,
  mutexService,
  jwtService
});

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
