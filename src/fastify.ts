/* eslint-disable quote-props */
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { mutexService } from '@src/infra/mutex/adapter/MutexService';
import { FastifyServer, Fastify } from '@src/infra/server/HTTP/adapters/fastify/FastifyServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/fastify/handlers/infraHandlers';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';
import { AuthService } from './infra/auth/AuthService';
import { PasswordCryptoService } from './infra/security/PasswordCryptoService';

const webServer = new FastifyServer();

const API: RestAPI<Fastify> = new RestAPI<Fastify>({
  databaseClient: InMemoryDbClient,
  webServer,
  mutexService,
  infraHandlers,
  serverType: EHTTPFrameworks.fastify,
  authService: AuthService.compile(),
  passwordCryptoService: PasswordCryptoService.compile()
});

// eslint-disable-next-line jest/require-hook
(async () => {
  await API.start();
  await API.seedData();
})();
