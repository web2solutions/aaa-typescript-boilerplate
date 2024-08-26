/* global  describe, it, expect */
import request from 'supertest';

import { FastifyServer, Fastify } from '@src/infra/server/HTTP/adapters/fastify/FastifyServer';
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/fastify/handlers/infraHandlers';
import { BasicAuthorizationHeaderUser1 } from '@test/mock';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';
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
const serverType = EHTTPFrameworks.fastify;
const webServer = new FastifyServer();
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
// eslint-disable-next-line prefer-destructuring
const application = API.server.application;

describe('/localhost suite', () => {
  beforeAll(async () => {
    await application.ready();
  });
  afterAll(async () => {
    await API.stop();
    await application.close();
  });

  it('fastify -> localhost should return 200', async () => {
    expect.hasAssertions();
    const response = await request(application.server)
      .get('/')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.statusCode).toBe(200);
  });
});
