/* global  describe, it, expect */
import request from 'supertest';
import { Express } from 'express';
import { ExpressServer } from '@src/interface/HTTP/adapters/express/ExpressServer';
import { infraHandlers } from '@src/interface/HTTP/adapters/express/handlers/infraHandlers';
import { RestAPI } from '@src/interface/HTTP/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/modules/Users/service/AuthService';
import { EHTTPFrameworks } from '@src/interface/HTTP/ports';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import users from '@seed/users';
import {
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser2,
  BasicAuthorizationHeaderUser3,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest
} from '@test/mock';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { UserDataRepository, UserService } from '@src/modules/Users';
import { JwtService } from '@src/infra/jwt/JwtService';
import { UserProviderLocal } from '@src/modules/Users/service/UserProviderLocal';

const webServer = ExpressServer.compile();
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

let API: any;
let server: any;

describe('express -> get Users suite', () => {
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
  });

  beforeEach(async () => {
    // await server.ready();
    await API.deleteUsers();
    await API.seedUsers();
  });

  afterAll(async () => {
    await API.deleteUsers();
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    // await server.close();
  });

  it('user1 must be able to read all users', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get('/api/1.0.0/users')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.statusCode).toBe(200);
    expect(response.body.result).toHaveLength(users.length);
    expect(response.body.total).toBe(users.length);
  });

  it('user2 must be able to read all users', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get('/api/1.0.0/users')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(200);
    expect(response.body.result).toHaveLength(users.length);
    expect(response.body.total).toBe(users.length);
  });

  it('user3 must be able to read all users', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get('/api/1.0.0/users')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser3);
    expect(response.statusCode).toBe(200);
    expect(response.body.result).toHaveLength(users.length);
    expect(response.body.total).toBe(users.length);
  });

  it('user4 must not be able to read all users - Forbidden: read_user role required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get('/api/1.0.0/users')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the read_user role');
  });

  it('guest must not be able to read an user data - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get('/api/1.0.0/users')
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
