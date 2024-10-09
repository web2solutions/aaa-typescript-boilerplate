/* eslint-disable no-param-reassign */
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

import users from '@seed/users';

import { UserDataRepository, UserService } from '@src/domains/Users';
import { JwtService } from '@src/infra/jwt/JwtService';
import { UserProviderLocal } from '@src/infra/auth/UserProviderLocal';

const [user1] = users;

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

describe('restify -> register suite', () => {
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

    // await API.seedData();
  });

  afterAll(async () => {
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    // await keyValueStorageClient.disconnect();
  });

  // eslint-disable-next-line jest/require-hook
  users.forEach((user, index) => {
    it(`user${index + 1} must be able to register`, async () => {
      expect.hasAssertions();
      delete (user as any).lastName;
      delete (user as any).id;
      delete (user as any).emails;
      delete (user as any).avatar;
      delete (user as any).roles;
      delete (user as any).documents;
      delete (user as any).phones;
      const response = await request(server)
        .post('/api/1.0.0/auth/register')
        .send(user)
        .set('Content-Type', 'application/json; charset=utf-8')
        .set('Accept', 'application/json; charset=utf-8');
      expect(response.statusCode).toBe(201);
      expect(response.body.username).toBe(user.username);
      expect(response.body.firstName).toBe(user.firstName);
      expect(response.body.password).toBeUndefined();
      expect(response.body.emails[0]).toMatchObject({
        email: user.username,
        type: 'work',
        isPrimary: true
      });
    });
  });

  it('invalid uername must return 400', async () => {
    expect.hasAssertions();
    const newUser = { ...user1 };
    delete (newUser as any).username;
    delete (newUser as any).id;
    const response = await request(server)
      .post('/api/1.0.0/auth/register')
      .send(newUser)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - The property username is required.');
  });

  it('invalid password must return 400', async () => {
    expect.hasAssertions();
    const newUser = { ...user1 };
    newUser.password = '123456';
    delete (newUser as any).id;
    const response = await request(server)
      .post('/api/1.0.0/auth/register')
      .send(newUser)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - password must have at least 8 chars.');
  });

  it('undefined password must return 400', async () => {
    expect.hasAssertions();
    const newUser = { ...user1 };
    delete (newUser as any).password;
    delete (newUser as any).id;
    const response = await request(server)
      .post('/api/1.0.0/auth/register')
      .send(newUser)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - The property password is required.');
  });

  it('non-existing fields must return 400', async () => {
    expect.hasAssertions();
    const { username, password } = user1;
    const response = await request(server)
      .post('/api/1.0.0/auth/register')
      .send({ usernames: username, password })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.message).toBe('Bad Request - The property usernames from input payload does not exist.');
  });
});
