/* eslint-disable quote-props */
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { mutexService } from '@src/infra/mutex/adapter/MutexService';
import { FastifyServer, Fastify } from '@src/infra/server/HTTP/adapters/fastify/FastifyServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/fastify/handlers/infraHandlers';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';

const webServer = new FastifyServer();

const API = new RestAPI<Fastify>({
  dbClient: InMemoryDbClient,
  webServer,
  mutexService,
  infraHandlers,
  serverType: EHTTPFrameworks.fastify
});

// eslint-disable-next-line jest/require-hook
(async () => {
  await API.start();
  await API.seedAccounts();
})();
