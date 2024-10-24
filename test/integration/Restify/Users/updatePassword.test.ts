/* global  describe, it, expect */
// file deepcode ignore NoHardcodedPasswords: <mocked passwords>
import request from 'supertest';
import { Server as Restify } from 'restify';
import { RestifyServer } from '@src/interface/HTTP/adapters/restify/RestifyServer';
import { infraHandlers } from '@src/interface/HTTP/adapters/restify/handlers/infraHandlers';
import { RestAPI } from '@src/interface/HTTP/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/modules/Users/service/AuthService';
import { EHTTPFrameworks } from '@src/interface/HTTP/ports';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import {
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser2,
  BasicAuthorizationHeaderUser3,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest
} from '@test/mock';
import {
  RequestUpdatePassword, IUser, UserDataRepository, UserService
} from '@src/modules/Users';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { JwtService } from '@src/infra/jwt/JwtService';
import { UserProviderLocal } from '@src/modules/Users/service/UserProviderLocal';

import createdUsers from '@seed/users';

const [createdUser1] = createdUsers;

const webServer = RestifyServer.compile();
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

describe('restify -> User updatePassword suite', () => {
  let user1: IUser;
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
    // await server.ready();
  });

  beforeEach(async () => {
    await authService.updatePassword(createdUser1.id, createdUser1.password);
  });

  afterAll(async () => {
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    await server.close();
  });

  it('user1 must be able to update an user password', async () => {
    expect.hasAssertions();
    const requestUpdatePassword: RequestUpdatePassword = {
      password: 'new_password_xxxxxxxxxxxxxxxxxx'
      // oldPassword: createdUser1.password
    };
    const response = await request(server)
      .put(`/api/1.0.0/users/${createdUser1.id}/updatePassword`)
      .send(requestUpdatePassword)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.statusCode).toBe(200);
  });

  it('user1 must not be able to update an user password with empty password', async () => {
    expect.hasAssertions();
    const requestUpdatePassword: RequestUpdatePassword = {
      password: ''
      // oldPassword: 'user1_password'//
    };
    const response = await request(server)
      .put(`/api/1.0.0/users/${createdUser1.id}/updatePassword`)
      .send(requestUpdatePassword)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - password can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update an user password with password having less than 8 chars', async () => {
    expect.hasAssertions();
    const requestUpdatePassword: RequestUpdatePassword = {
      password: '1234567'
      // oldPassword: createdUser1.password
    };
    const response = await request(server)
      .put(`/api/1.0.0/users/${createdUser1.id}/updatePassword`)
      .send(requestUpdatePassword)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - password must have at least 8 chars.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update user password with unknown field', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .put(`/api/1.0.0/users/${createdUser1.id}/updatePassword`)
      .send({
        invalidFieldName: 50
      })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property invalidFieldName from input payload does not exist.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update new user with empty payload', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .put(`/api/1.0.0/users/${createdUser1.id}/updatePassword`)
      .send({})
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to update new user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .put(`/api/1.0.0/users/${createdUser1.id}/updatePassword`)
      .send({ ...user1, id: createdUser1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user3 must not be able to update new user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .put(`/api/1.0.0/users/${createdUser1.id}/updatePassword`)
      .send({ ...user1, id: createdUser1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user4 must not be able to update new user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .put(`/api/1.0.0/users/${createdUser1.id}/updatePassword`)
      .send({ ...user1, id: createdUser1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('guest must not be able to update new user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .put(`/api/1.0.0/users/${createdUser1.id}/updatePassword`)
      .send({ ...user1, id: createdUser1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
