/* global  describe, it, expect */
// file deepcode ignore NoHardcodedPasswords: <mocked passwords>
// file deepcode ignore NoHardcodedCredentials/test: <fake credential>
import request from 'supertest';
import HyperExpress from 'hyper-express';
import { HyperExpressServer } from '@src/interface/HTTP/adapters/hyper-express/HyperExpressServer';
import { infraHandlers } from '@src/interface/HTTP/adapters/hyper-express/handlers/infraHandlers';

import { EHTTPFrameworks } from '@src/interface/HTTP/ports';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { JwtService } from '@src/infra/jwt/JwtService';
import { RestAPI } from '@src/interface/HTTP/RestAPI';

import {
  UserDataRepository, UserService, UserProviderLocal, AuthService, EAuthSchemaType
} from '@src/modules/Users';

import createdUsers from '@seed/users';

const [createdUser1] = createdUsers;

const webServer = HyperExpressServer.compile();
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

const serverType = EHTTPFrameworks.hyper_express;

let API: RestAPI<HyperExpress.Server>;

describe('hyper-express -> logout suite', () => {
  beforeAll(async () => {
    await databaseClient.connect();
    await keyValueStorageClient.connect();

    API = new RestAPI<HyperExpress.Server>({
      databaseClient,
      webServer,
      infraHandlers,
      serverType,
      authService,
      passwordCryptoService,
      keyValueStorageClient,
      mutexService
    });

    await API.start();
    await API.seedData();
  });

  afterAll(async () => {
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    await API.stop();
  });

  // eslint-disable-next-line jest/require-hook
  createdUsers.forEach((user, index) => {
    it(`user${index + 1} must be able to logout with a Barer token`, async () => {
      expect.hasAssertions();
      const { username, password } = user;
      const authResponse = await authService.authenticate(
        username,
        password,
        EAuthSchemaType.Bearer
      );
      const { result } = authResponse;
      const token = result!.Authorization;
      const response = await request('http://localhost:3000')
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
      const response = await request('http://localhost:3000')
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
    const response = await request('http://localhost:3000')
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
    const response = await request('http://localhost:3000')
      .post('/api/1.0.0/auth/logout')
      .send({ username: 'XXXXXX' })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set({ Authorization: token });
    // console.log(response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - Invalid request');
  });

  it('undefined username must return 400', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .post('/api/1.0.0/auth/logout')
      .send({})
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - message.input can not be empty');
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
    const response = await request('http://localhost:3000')
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
