/* global  describe, it, expect */
// file deepcode ignore NoHardcodedPasswords: <mocked passwords>
// file deepcode ignore NoHardcodedCredentials/test: <fake credential>
import request from 'supertest';
import { Express } from 'express';
import { ExpressServer } from '@src/infra/server/HTTP/adapters/express/ExpressServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/express/handlers/infraHandlers';
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

const webServer = new ExpressServer();
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

const serverType = EHTTPFrameworks.express;

let API: RestAPI<Express>;
let server: any;

describe('express -> updatePassword suite', () => {
  beforeAll(async () => {
    await databaseClient.connect();
    await keyValueStorageClient.connect();

    API = new RestAPI<Express>({
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
    await API.deleteUsers();
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    // await keyValueStorageClient.disconnect();
  });

  // eslint-disable-next-line jest/require-hook
  createdUsers.forEach((user, index) => {
    it(`user${index + 1} must be able to updatePassword with a Barer token`, async () => {
      expect.hasAssertions();
      const { username, password } = user;
      const newPassword = 'XXXXXXXX';
      let authResponse = await authService.authenticate(
        username,
        password,
        EAuthSchemaType.Bearer
      );
      const { result } = authResponse;
      const token = result!.Authorization;
      const response = await request(server)
        .post('/api/1.0.0/auth/updatePassword')
        .send({ password: newPassword })
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('Accept', 'application/json; charset=utf-8')
        .set({ Authorization: token });
      // console.log(response.body)
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeTruthy();
      authResponse = await authService.authenticate(
        username,
        newPassword,
        EAuthSchemaType.Bearer
      );
      expect(authResponse.result!).toHaveProperty('Authorization');
    });

    it(`user${index + 1} must be able to updatePassword with a Basic token`, async () => {
      expect.hasAssertions();
      const { username, password } = user;
      const newPassword = 'XXXXXXXX';
      let authResponse = await authService.authenticate(
        username,
        newPassword,
        EAuthSchemaType.Basic
      );
      const { result } = authResponse;
      const token = result!.Authorization;
      const response = await request(server)
        .post('/api/1.0.0/auth/updatePassword')
        .send({ password })
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('Accept', 'application/json; charset=utf-8')
        .set({ Authorization: token });
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeTruthy();
      authResponse = await authService.authenticate(
        username,
        password,
        EAuthSchemaType.Bearer
      );
      expect(authResponse.result!).toHaveProperty('Authorization');
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
      .post('/api/1.0.0/auth/updatePassword')
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
      .post('/api/1.0.0/auth/updatePassword')
      .send({ username: 'XXXXXX' })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set({ Authorization: token });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - The property username from input payload does not exist.');
  });

  it('undefined password must return 400', async () => {
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
      .post('/api/1.0.0/auth/updatePassword')
      .send({})
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set({ Authorization: token });
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
    const response = await request(server)
      .post('/api/1.0.0/auth/updatePassword')
      .send({ usernames: username, password })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set({ Authorization: token });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - The property usernames from input payload does not exist.');
  });
});