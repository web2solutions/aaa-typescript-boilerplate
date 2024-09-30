/* global  describe, it, expect */
import request from 'supertest';
import { Server as Restify } from 'restify';
import { RestifyServer } from '@src/infra/server/HTTP/adapters/restify/RestifyServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/restify/handlers/infraHandlers';
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/infra/auth/AuthService';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports';
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
import { UserDataRepository, UserService } from '@src/domains/Users';
import { JwtService } from '@src/infra/jwt/JwtService';
import { UserProviderLocal } from '@src/infra/auth/UserProviderLocal';

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

let API: any;
let server: any;

describe('restify -> get Users suite', () => {
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

    // await server.ready();
    await API.seedUsers();
  });
  afterAll(async () => {
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    await server.close();
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

  it('set page 1 and size 1 should return 1 item', async () => {
    expect.hasAssertions();
    const paging = {
      page: 1, size: 1
    };
    const response = await request(server)
      .get(`/api/1.0.0/users?page=${paging.page}&size=${paging.size}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body.result).toHaveLength(1);
    expect(response.body.total).toBe(users.length);
  });

  it('set page 2 and size 1 should return 1 item', async () => {
    expect.hasAssertions();
    const paging = {
      page: 2, size: 1
    };
    const response = await request(server)
      .get(`/api/1.0.0/users?page=${paging.page}&size=${paging.size}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body.result).toHaveLength(1);
    expect(response.body.total).toBe(users.length);
  });

  it('set page number greater than existing page total number should return 400 http status', async () => {
    expect.hasAssertions();
    const paging = {
      page: 2, size: 10
    };
    const response = await request(server)
      .get(`/api/1.0.0/users?page=${paging.page}&size=${paging.size}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.statusCode).toBe(400);
    // console.log(response.body);
    expect(response.body.message).toBe('Bad Request - page number must be smaller than the number of total pages');
    expect(response.body.page).toBeUndefined();
    expect(response.body.size).toBeUndefined();
    expect(response.body.total).toBeUndefined();
  });

  it('set page number as 0 should return 400 http status', async () => {
    expect.hasAssertions();
    const paging = {
      page: 0, size: 10
    };
    const response = await request(server)
      .get(`/api/1.0.0/users?page=${paging.page}&size=${paging.size}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.statusCode).toBe(400);
    // console.log(response.body);
    expect(response.body.message).toBe('Bad Request - page must be greater than 0');
    expect(response.body.page).toBeUndefined();
    expect(response.body.size).toBeUndefined();
    expect(response.body.total).toBeUndefined();
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
