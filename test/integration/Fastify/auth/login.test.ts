/* global  describe, it, expect */
// file deepcode ignore NoHardcodedPasswords: <mocked passwords>
// file deepcode ignore NoHardcodedCredentials/test: <fake credential>
import request from 'supertest';
import { FastifyServer, Fastify } from '@src/interface/HTTP/adapters/fastify/FastifyServer';
import { infraHandlers } from '@src/interface/HTTP/adapters/fastify/handlers/infraHandlers';
import { RestAPI } from '@src/interface/HTTP/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/modules/Users/service/AuthService';
import { EHTTPFrameworks } from '@src/interface/HTTP/ports';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';

import createdUsers from '@seed/users';

import { UserDataRepository, UserService } from '@src/modules/Users';
import { UserProviderLocal } from '@src/modules/Users/service/UserProviderLocal';
import { JwtService } from '@src/infra/jwt/JwtService';

import { EAuthSchemaType } from '@src/modules/Users/service/ports/EAuthSchemaType';

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

describe('fastify -> Login suite', () => {
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
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    await server.close();
    // await keyValueStorageClient.disconnect();
  });

  // eslint-disable-next-line jest/require-hook
  createdUsers.forEach((user, index) => {
    it(`user${index + 1} must be able to login and get a Bearer token`, async () => {
      expect.hasAssertions();
      const { username, password } = user;
      const schemaType = EAuthSchemaType.Bearer;
      const response = await request(server.server)
        .post('/api/1.0.0/auth/login')
        .send({ username, password, schemaType })
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('Accept', 'application/json; charset=utf-8');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('Authorization');
      const schema = response.body.Authorization.split(' ')[0];
      expect(schema).toBe(EAuthSchemaType.Bearer);
    });

    it(`user${index + 1} must be able to login and get a Basic token`, async () => {
      expect.hasAssertions();
      const { username, password } = user;
      const schemaType = EAuthSchemaType.Basic;
      const response = await request(server.server)
        .post('/api/1.0.0/auth/login')
        .send({ username, password, schemaType })
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('Accept', 'application/json; charset=utf-8');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('Authorization');
      const schema = response.body.Authorization.split(' ')[0];
      expect(schema).toBe(EAuthSchemaType.Basic);
    });

    it(`user${index + 1} must be able to login and get a Bearer token when not setting a schemaType in the login request`, async () => {
      expect.hasAssertions();
      const { username, password } = user;
      const response = await request(server.server)
        .post('/api/1.0.0/auth/login')
        .send({ username, password })
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('Accept', 'application/json; charset=utf-8');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('Authorization');
      const schema = response.body.Authorization.split(' ')[0];
      expect(schema).toBe(EAuthSchemaType.Bearer);
    });
  });

  it('invalid uername must return 401', async () => {
    expect.hasAssertions();
    const { username, password } = {
      username: 'XXXXXXXXXXXXXXXX',
      password: createdUser1.password
    };
    const response = await request(server.server)
      .post('/api/1.0.0/auth/login')
      .send({ username, password })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Unauthorized - user not found');
  });

  it('invalid password must return 401', async () => {
    expect.hasAssertions();
    const { username, password } = {
      username: createdUser1.username,
      password: '1234567'
    };
    const response = await request(server.server)
      .post('/api/1.0.0/auth/login')
      .send({ username, password })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Unauthorized - password does not matches');
  });

  it('undefined password must return 401', async () => {
    expect.hasAssertions();
    const { username } = createdUser1;
    const response = await request(server.server)
      .post('/api/1.0.0/auth/login')
      .send({ username })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - The property password is required.');
  });

  it('undefined username must return 400', async () => {
    expect.hasAssertions();
    const { password } = createdUser1;
    const response = await request(server.server)
      .post('/api/1.0.0/auth/login')
      .send({ password })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - The property username is required.');
  });

  it('undefined username and password must return 400', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/auth/login')
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
    const response = await request(server.server)
      .post('/api/1.0.0/auth/login')
      .send({ usernames: username, password })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - The property usernames from input payload does not exist.');
  });
});
