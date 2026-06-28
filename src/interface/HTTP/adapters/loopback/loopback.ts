/* eslint-disable quote-props */
import { LoopBackServer } from '@src/interface/HTTP/adapters/loopback/LoopBackServer';
import { infraHandlers } from '@src/interface/HTTP/adapters/loopback/handlers/infraHandlers';

import {
  composeUsersAuthServices
} from '@src/modules/Users';

import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { compileDatabaseClient } from '@src/infra/persistence/compileDatabaseClient';
import { JwtService } from '@src/infra/jwt/JwtService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { compileMessageMediator } from '@src/infra/messages/compileMessageMediator';
import { EHTTPFrameworks } from '@src/interface/HTTP/ports';
import { RestAPI } from '@src/interface/HTTP/RestAPI';

const serverType = EHTTPFrameworks.loopback;
const webServer = LoopBackServer.compile();

const passwordCryptoService = PasswordCryptoService.compile();
const jwtService = JwtService.compile();
const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
const mutexService = MutexService.compile(keyValueStorageClient);
const messageMediator = compileMessageMediator();
const databaseClient = compileDatabaseClient();

const { authService } = composeUsersAuthServices({
  databaseClient,
  passwordCryptoService,
  mutexService,
  jwtService,
  keyValueStorageClient,
  messageMediator
});

const API = new RestAPI<any>({
  databaseClient,
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
