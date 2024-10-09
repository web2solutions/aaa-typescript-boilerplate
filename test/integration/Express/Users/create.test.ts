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
import {
  BasicAuthorizationHeaderUserGuest,
  user1,
  // user2,
  user3
} from '@test/mock';

import createdUsers from '@seed/users';

import { UserDataRepository, UserService } from '@src/domains/Users';
import { UserProviderLocal } from '@src/infra/auth/UserProviderLocal';
import { JwtService } from '@src/infra/jwt/JwtService';
import { IAuthorizationHeader } from '@src/infra/auth/IAuthorizationHeader';
import { EAuthSchemaType } from '@src/infra/auth/EAuthSchemaType';

const [createdUser1, createdUser2, createdUser3, createdUser4] = createdUsers;

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
let authorizationHeaderUser1: IAuthorizationHeader;
let authorizationHeaderUser2: IAuthorizationHeader;
let authorizationHeaderUser3: IAuthorizationHeader;
let authorizationHeaderUser4: IAuthorizationHeader;

describe('express -> Auth -> Basic suite', () => {
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
    // await server.ready();

    authorizationHeaderUser1 = {
      ...(await authService.authenticate(
        createdUser1.username,
        createdUser1.password,
        EAuthSchemaType.Basic
      )).result!
    };
    authorizationHeaderUser2 = {
      ...(await authService.authenticate(
        createdUser2.username,
        createdUser2.password,
        EAuthSchemaType.Basic
      )).result!
    };
    authorizationHeaderUser3 = {
      ...(await authService.authenticate(
        createdUser3.username,
        createdUser3.password,
        EAuthSchemaType.Basic
      )).result!
    };
    authorizationHeaderUser4 = {
      ...(await authService.authenticate(
        createdUser4.username,
        createdUser4.password,
        EAuthSchemaType.Basic
      )).result!
    };
  });

  afterAll(async () => {
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    // await server.close();
    // await keyValueStorageClient.disconnect();
  });

  it('user1 must be able to create an user', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    expect(response.statusCode).toBe(201);
    expect(response.body.firstName).toBe(user1.firstName);
    expect(response.body.lastName).toBe(user1.lastName);
  });

  it('user1 must not be able to create a duplicated username', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.message).toBe('Duplicated record - username already in use');
    expect(response.statusCode).toBe(409);
  });

  it('user1 must not be able to create a user with empty username', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/users')
      .send({ ...user1, username: '', password: '12345678' })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - username can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a user with empty password', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/users')
      .send({ ...user1, username: 'loginname', password: '' })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.message).toBe('Bad Request - password must have at least 8 chars.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a user with password having less than 8 chars', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/users')
      .send({ ...user1, username: 'loginname', password: '1234567' })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - password must have at least 8 chars.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create an user with empty firstName', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/users')
      .send({ ...user3, firstName: '' })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - firstName can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create new user with unknown field', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/users')
      .send({
        invalidFieldName: 50
      })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property invalidFieldName from input payload does not exist.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create new user with empty payload', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/users')
      .send({})
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    // console.log(response.body)
    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to create new user - Forbidden: the role create_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the create_user role');
  });

  it('user3 must not be able to create new user - Forbidden: the role create_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the create_user role');
  });

  it('user4 must not be able to create new user - Forbidden: the role create_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the create_user role');
  });

  it('guest must not be able to create new user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
