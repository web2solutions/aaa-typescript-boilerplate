/* global  describe, it, expect */
import request from 'supertest';
import HyperExpress from 'hyper-express';
import { HyperExpressServer } from '@src/interface/HTTP/adapters/hyper-express/HyperExpressServer';
import { infraHandlers } from '@src/interface/HTTP/adapters/hyper-express/handlers/infraHandlers';
import { RestAPI } from '@src/interface/HTTP/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/modules/Users/service/AuthService';
import { EHTTPFrameworks } from '@src/interface/HTTP/ports';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import {
  IUser,
  UserDataRepository,
  UserService
} from '@src/modules/Users';
import {
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser2,
  BasicAuthorizationHeaderUser3,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest,
  user1
} from '@test/mock';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { JwtService } from '@src/infra/jwt/JwtService';
import { UserProviderLocal } from '@src/modules/Users/service/UserProviderLocal';

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

let API: any;

describe('hyper-express -> getUserById suite', () => {
  let createdUser: IUser;
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

    // create user
    const response = await request('http://localhost:3000')
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    createdUser = response.body;
  });
  afterAll(async () => {
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    await API.stop();
  });

  it('user1 must be able to read an user data', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .get(`/api/1.0.0/users/${createdUser.id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe(createdUser.firstName);
  });

  it('user2 must be able to read an user data', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .get(`/api/1.0.0/users/${createdUser.id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser2);

    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe(createdUser.firstName);
  });

  it('user3 must be able to read an user data', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .get(`/api/1.0.0/users/${createdUser.id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser3);

    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe(createdUser.firstName);
  });

  it('user4 must not be able to read an user data - Forbidden: read_user role required', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .get(`/api/1.0.0/users/${createdUser.id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the read_user role');
  });

  it('guest must not be able to read an user data - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .get(`/api/1.0.0/users/${createdUser.id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUserGuest);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
