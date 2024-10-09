/* global  describe, it, expect */
// file deepcode ignore NoHardcodedPasswords: <mocked passwords>
// file deepcode ignore NoHardcodedCredentials/test: <fake credential>
import request from 'supertest';
import { Server as Restify } from 'restify';
import { RestifyServer } from '@src/infra/server/HTTP/adapters/restify/RestifyServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/restify/handlers/infraHandlers';
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/infra/auth/AuthService';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';

import createdUsers from '@seed/users';

import { UserDataRepository, UserService } from '@src/domains/Users';
import { JwtService } from '@src/infra/jwt/JwtService';
import { UserProviderLocal } from '@src/infra/auth/UserProviderLocal';

import { EAuthSchemaType } from '@src/infra/auth/EAuthSchemaType';

const [createdUser1] = createdUsers;

const webServer = new RestifyServer();
const databaseClient = InMemoryDbClient;
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

let API: RestAPI<Restify>;
let server: any;

describe('restify -> logout suite', () => {
  beforeAll(async () => {
    await databaseClient.connect();
    await keyValueStorageClient.connect();

    API = new RestAPI<Restify>({
      databaseClient,
      webServer,
      infraHandlers,
      serverType,
      authService,
      passwordCryptoService,
      keyValueStorageClient,
      mutexService
    });

    server = API.server.application;

    await API.seedData();
  });

  afterAll(async () => {
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    // await keyValueStorageClient.disconnect();
  });

  // eslint-disable-next-line jest/require-hook
  createdUsers.forEach((user, index) => {
    it(`user${index + 1} must be able to logout`, async () => {
      expect.hasAssertions();
      const { username, password } = user;
      const authResponse = await authService.authenticate(
        username,
        password,
        EAuthSchemaType.Bearer
      );
      const { result } = authResponse;
      const token = result!.Authorization;
      const response = await request(server)
        .post('/api/1.0.0/auth/logout')
        .send({ username })
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('Accept', 'application/json; charset=utf-8')
        .set({ Authorization: token });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeTruthy();
    });

    it(`user${index + 1} must be able to logout with a Basic token`, async () => {
      expect.hasAssertions();
      const { username, password } = user;
      const authResponse = await authService.authenticate(
        username,
        password,
        EAuthSchemaType.Basic
      );
      const { result } = authResponse;
      const token = result!.Authorization;
      const response = await request(server)
        .post('/api/1.0.0/auth/logout')
        .send({ username })
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('Accept', 'application/json; charset=utf-8')
        .set({ Authorization: token });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeTruthy();
    });
  });

  it('invalid token must return 401', async () => {
    expect.hasAssertions();
    const { username, password } = createdUser1;
    await authService.authenticate(
      username,
      password,
      EAuthSchemaType.Bearer
    );
    const response = await request(server)
      .post('/api/1.0.0/auth/logout')
      .send({ username })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set({ Authorization: '' });
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Unauthorized - invalid token');
  });

  it('invalid username must return 400', async () => {
    expect.hasAssertions();
    const { username, password } = createdUser1;
    const authResponse = await authService.authenticate(
      username,
      password,
      EAuthSchemaType.Bearer
    );
    const { result } = authResponse;
    const token = result!.Authorization;
    const response = await request(server)
      .post('/api/1.0.0/auth/logout')
      .send({ username: 'XXXXXX' })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set({ Authorization: token });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - Invalid request');
  });

  it('undefined username must return 400', async () => {
    expect.hasAssertions();
    const { username, password } = createdUser1;
    const authResponse = await authService.authenticate(
      username,
      password,
      EAuthSchemaType.Bearer
    );
    const { result } = authResponse;
    const token = result!.Authorization;
    const response = await request(server)
      .post('/api/1.0.0/auth/logout')
      .send({})
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set({ Authorization: token });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - The property username is required.');
  });

  it('non-existing fields must return 400', async () => {
    expect.hasAssertions();
    const { username, password } = createdUser1;
    const authResponse = await authService.authenticate(
      username,
      password,
      EAuthSchemaType.Bearer
    );
    const { result } = authResponse;
    const token = result!.Authorization;
    const response = await request(server)
      .post('/api/1.0.0/auth/logout')
      .send({ usernames: username, password })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set({ Authorization: token });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - The property usernames from input payload does not exist.');
  });
});
