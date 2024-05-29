/* eslint-disable quote-props */
import { Express } from 'express';
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { mutexService } from '@src/infra/mutex/adapter/MutexService';
import { ExpressServer } from '@src/infra/server/HTTP/adapters/express/ExpressServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/express/handlers/infraHandlers';

const webServer = new ExpressServer();

const API = new RestAPI<Express>({
  dbClient: InMemoryDbClient,
  webServer,
  mutexService,
  infraHandlers
});

// eslint-disable-next-line jest/require-hook
(async () => {
  await API.start();
  await API.seedAccounts();
})();
