/* eslint-disable quote-props */
import { AdonisJsServer } from '@src/interface/HTTP/adapters/adonis-js/AdonisJsServer';
import { infraHandlers } from '@src/interface/HTTP/adapters/adonis-js/handlers/infraHandlers';

import {
  composeUsersAuthServices
} from '@src/modules/Users';

import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { JwtService } from '@src/infra/jwt/JwtService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { compileMessageMediator } from '@src/infra/messages/compileMessageMediator';
import { EHTTPFrameworks } from '@src/interface/HTTP/ports';
import { RestAPI } from '@src/interface/HTTP/RestAPI';

const serverType = EHTTPFrameworks.adonis_js;
const webServer = AdonisJsServer.compile();

const passwordCryptoService = PasswordCryptoService.compile();
const jwtService = JwtService.compile();
const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
const mutexService = MutexService.compile(keyValueStorageClient);
const messageMediator = compileMessageMediator();

const { authService } = composeUsersAuthServices({
  databaseClient: InMemoryDbClient,
  passwordCryptoService,
  mutexService,
  jwtService,
  messageMediator
});

const API = new RestAPI<any>({
  databaseClient: InMemoryDbClient,
  webServer,
  infraHandlers,
  serverType,
  authService,
  passwordCryptoService,
  keyValueStorageClient,
  mutexService,
  eventBus: messageMediator,
  messageMediator
});

// eslint-disable-next-line jest/require-hook
(async () => {
  await API.start();
  await API.seedData();
})();
