/* global  describe, it, expect */
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
import { IUser, UserDataRepository, UserService } from '@src/modules/Users';
import { DocumentValueObject } from '@src/modules/ddd/valueObjects';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { JwtService } from '@src/infra/jwt/JwtService';
import { UserProviderLocal } from '@src/modules/Users/service/UserProviderLocal';

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

describe('restify -> User deleteDocument suite', () => {
  let usersAll: IUser[];
  let user1: IUser;
  let document1: DocumentValueObject;
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
    usersAll = await API.seedUsers();
    [user1] = usersAll;
    [document1] = user1.documents || [];
    // delete .id;
  });
  afterAll(async () => {
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    await server.close();
  });

  it('user1 must be able to delete a document of an user', async () => {
    expect.hasAssertions();
    expect(user1.documents).toHaveLength(3);
    const response = await request(server)
      .delete(`/api/1.0.0/users/${user1.id}/deleteDocument/${document1.id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.documents).toHaveLength(2);
    expect(response.body.documents[0].data).toBe(user1.documents![1].data);
    expect(response.body.documents[0].type).toBe(user1.documents![1].type);
    expect(response.statusCode).toBe(200);
  });

  it('user2 must not be able to delete a document of an user - Forbidden: the role delete_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .delete(`/api/1.0.0/users/${user1.id}/deleteDocument/${document1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the delete_user role');
  });

  it('user3 must not be able to delete a document of an user - Forbidden: the role delete_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .delete(`/api/1.0.0/users/${user1.id}/deleteDocument/${document1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the delete_user role');
  });

  it('user4 must not be able to delete a document of an user - Forbidden: the role delete_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .delete(`/api/1.0.0/users/${user1.id}/deleteDocument/${document1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the delete_user role');
  });

  it('guest must not be able to delete a document of an user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .delete(`/api/1.0.0/users/${user1.id}/deleteDocument/${document1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
