/* eslint-disable quote-props */
import HyperExpress from 'hyper-express';
import { RestAPI } from '@src/infra/RestAPI';
import { HyperExpressServer } from '@src/infra/server/HTTP/adapters/hyper-express/HyperExpressServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/hyper-express/handlers/infraHandlers';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { mutexService } from '@src/infra/mutex/adapter/MutexService';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';

const webServer = new HyperExpressServer();

const API = new RestAPI<HyperExpress.Server>({
  dbClient: InMemoryDbClient,
  webServer,
  mutexService,
  infraHandlers,
  serverType: EHTTPFrameworks.hyper_express
});

// eslint-disable-next-line jest/require-hook
(async () => {
  await API.start();
  await API.seedAccounts();
})();
