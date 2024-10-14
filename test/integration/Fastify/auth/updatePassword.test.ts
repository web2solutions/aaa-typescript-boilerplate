/* global  describe, it, expect */
// file deepcode ignore NoHardcodedPasswords: <mocked passwords>
// file deepcode ignore NoHardcodedCredentials/test: <fake credential>
import request from 'supertest';
import { FastifyServer, Fastify } from '@src/interface/HTTP/adapters/fastify/FastifyServer';
import { infraHandlers } from '@src/interface/HTTP/adapters/fastify/handlers/infraHandlers';
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

const webServer = new FastifyServer();
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

const serverType = EHTTPFrameworks.fastify;

let API: RestAPI<Fastify>;
let server: any;

describe('fastify -> updatePassword suite', () => {
  beforeAll(async () => {
    await databaseClient.connect();
    await keyValueStorageClient.connect();

    API = new RestAPI<Fastify>({
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
    await server.ready();
  });

  afterAll(async () => {
    await API.deleteUsers();
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    await server.close();
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
      const response = await request(server.server)
        .post('/api/1.0.0/auth/updateUserPassword')
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
      const response = await request(server.server)
        .post('/api/1.0.0/auth/updateUserPassword')
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
    const response = await request(server.server)
      .post('/api/1.0.0/auth/updateUserPassword')
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
    const response = await request(server.server)
      .post('/api/1.0.0/auth/updateUserPassword')
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
    const response = await request(server.server)
      .post('/api/1.0.0/auth/updateUserPassword')
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
    const response = await request(server.server)
      .post('/api/1.0.0/auth/updateUserPassword')
      .send({ usernames: username, password })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set({ Authorization: token });
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - The property usernames from input payload does not exist.');
  });
});
