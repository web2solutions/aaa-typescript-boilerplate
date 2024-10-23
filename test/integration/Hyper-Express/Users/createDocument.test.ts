/* global  describe, it, expect */
import request from 'supertest';
import HyperExpress from 'hyper-express';
import { HyperExpressServer } from '@src/interface/HTTP/adapters/hyper-express/HyperExpressServer';
import { infraHandlers } from '@src/interface/HTTP/adapters/hyper-express/handlers/infraHandlers';
import { RestAPI } from '@src/interface/HTTP/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/modules/Users/service/AuthService';
import { EHTTPFrameworks } from '@src/interface/HTTP/ports';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
// import { RedisKeyValueStorageClient } from
// '@src/infra/persistence/KeyValueStorage/RedisKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import {
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser2,
  BasicAuthorizationHeaderUser3,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest,
  documents
} from '@test/mock';

import {
  IUser, RequestCreateDocument, UserDataRepository, UserService
} from '@src/modules/Users';
import { DocumentValueObject } from '@src/modules/ddd/valueObjects';
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

describe('hyper-express -> User createDocument suite', () => {
  let usersAll: IUser[];
  let user1: IUser;
  let document1: DocumentValueObject;
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

    usersAll = await API.seedUsers();
    [user1] = usersAll;
    [document1] = documents;
    // delete .id;
  });
  afterAll(async () => {
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    await API.stop();
  });

  it('user1 must be able to create a document for an user', async () => {
    expect.hasAssertions();
    const requestCreateDocument: RequestCreateDocument = {
      ...document1
    };
    const response = await request('http://localhost:3000')
      .post(`/api/1.0.0/users/${user1.id}/createDocument`)
      .send(requestCreateDocument)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.documents[0].data).toBe(requestCreateDocument.data);
    expect(response.body.documents[0].type).toBe(requestCreateDocument.type);
    expect(response.statusCode).toBe(201);
  });

  it('user1 must not be able to create a document for an user with empty data', async () => {
    expect.hasAssertions();
    const requestCreateDocument: RequestCreateDocument = {
      ...document1,
      data: ''
    };
    const response = await request('http://localhost:3000')
      .post(`/api/1.0.0/users/${user1.id}/createDocument`)
      .send(requestCreateDocument)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - data can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a document for an user with empty countryIssue', async () => {
    expect.hasAssertions();
    const requestCreateDocument: RequestCreateDocument = {
      ...document1,
      countryIssue: ''
    };
    const response = await request('http://localhost:3000')
      .post(`/api/1.0.0/users/${user1.id}/createDocument`)
      .send(requestCreateDocument)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - countryIssue can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a document for an user with empty type', async () => {
    expect.hasAssertions();
    const requestCreateDocument = {
      ...document1,
      type: ''
    };
    const response = await request('http://localhost:3000')
      .post(`/api/1.0.0/users/${user1.id}/createDocument`)
      .send(requestCreateDocument)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - type can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a document for an user with unknown field', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .post(`/api/1.0.0/users/${user1.id}/createDocument`)
      .send({
        invalidFieldName: 50
      })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property invalidFieldName from input payload does not exist.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a document for an user with empty payload', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .post(`/api/1.0.0/users/${user1.id}/createDocument`)
      .send({})
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to create a document for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .post(`/api/1.0.0/users/${user1.id}/createDocument`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user3 must not be able to create a document for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .post(`/api/1.0.0/users/${user1.id}/createDocument`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user4 must not be able to create a document for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .post(`/api/1.0.0/users/${user1.id}/createDocument`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('guest must not be able to create a document for an user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .post(`/api/1.0.0/users/${user1.id}/createDocument`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});