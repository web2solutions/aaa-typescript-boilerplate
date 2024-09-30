/* global  describe, it, expect */
import request from 'supertest';

import { Server as Restify } from 'restify';
import { RestifyServer } from '@src/infra/server/HTTP/adapters/restify/RestifyServer';
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/restify/handlers/infraHandlers';
import { BasicAuthorizationHeaderUser1 } from '@test/mock';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports';
import { AuthService } from '@src/infra/auth/AuthService';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { UserDataRepository, UserService } from '@src/domains/Users';
import { JwtService } from '@src/infra/jwt/JwtService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { UserProviderLocal } from '@src/infra/auth/UserProviderLocal';

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
const serverType = EHTTPFrameworks.restify;
const webServer = new RestifyServer();
const API: RestAPI<Restify> = new RestAPI<Restify>({
  databaseClient: InMemoryDbClient,
  webServer,
  infraHandlers,
  serverType,
  authService,
  passwordCryptoService,
  keyValueStorageClient,
  mutexService
});
// eslint-disable-next-line prefer-destructuring
const server = API.server.application;

describe('restify -> /localhost suite', () => {
  afterAll(async () => {
    await API.stop();
  });

  it('localhost should return 200', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get('/')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.statusCode).toBe(200);
  });
});
