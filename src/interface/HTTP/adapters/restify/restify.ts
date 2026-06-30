/* eslint-disable quote-props */
import restify from 'restify';
import { RestifyServer } from '@src/interface/HTTP/adapters/restify/RestifyServer';
import { infraHandlers } from '@src/interface/HTTP/adapters/restify/handlers/infraHandlers';

import {
  composeUsersAuthServices
} from '@src/modules/Users';

import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { compileDatabaseClient } from '@src/infra/persistence/compileDatabaseClient';
import { JwtService } from '@src/infra/jwt/JwtService';
import { compileKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/compileKeyValueStorageClient';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { compileMessageMediator } from '@src/infra/messages/compileMessageMediator';
import { EHTTPFrameworks } from '@src/interface/HTTP/ports/EHTTPFrameworks';
import { RestAPI } from '@src/interface/HTTP/RestAPI';

type Restify = restify.Server;

const serverType = EHTTPFrameworks.restify;
const webServer = RestifyServer.compile();

const passwordCryptoService = PasswordCryptoService.compile();
const jwtService = JwtService.compile();
const keyValueStorageClient = compileKeyValueStorageClient(process.env.AAA_KEYVALUESTORAGE_DRIVER);
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

const API = new RestAPI<Restify>({
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
