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
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser2,
  BasicAuthorizationHeaderUser3,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest
} from '@test/mock';

import {
  IUser, RequestUpdatePhone, UserDataRepository, UserService
} from '@src/modules/Users';
import { PhoneValueObject } from '@src/modules/ddd/valueObjects';
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

describe('hyper-express -> User updatePhone suite', () => {
  let usersAll: IUser[];
  let user1: IUser;
  let phone1: PhoneValueObject;
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
    [phone1] = user1.phones || [];
  });
  afterAll(async () => {
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    await API.stop();
  });

  it('user1 must be able to update a phone for an user', async () => {
    expect.hasAssertions();
    const requestUpdatePhone: RequestUpdatePhone = {
      ...phone1,
      number: '99999-9999'
    };
    const response = await request('http://localhost:3000')
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send(requestUpdatePhone)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.phones[0].number).toBe(requestUpdatePhone.number);
    expect(response.body.phones[0].localCode).toBe(requestUpdatePhone.localCode);
    expect(response.statusCode).toBe(200);
  });

  it('user1 must not be able to update a phone for an user with empty number', async () => {
    expect.hasAssertions();
    const requestUpdatePhone: RequestUpdatePhone = {
      ...phone1,
      number: ''
    };
    const response = await request('http://localhost:3000')
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send(requestUpdatePhone)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - number can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update a phone for an user with empty countryCode', async () => {
    expect.hasAssertions();
    const requestUpdatePhone: RequestUpdatePhone = {
      ...phone1,
      countryCode: ''
    };
    const response = await request('http://localhost:3000')
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send(requestUpdatePhone)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - countryCode can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update a phone for an user with empty localCode', async () => {
    expect.hasAssertions();
    const requestUpdatePhone = {
      ...phone1,
      localCode: ''
    };
    const response = await request('http://localhost:3000')
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send(requestUpdatePhone)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - localCode can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update a phone for an user with unknown field', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send({
        invalidFieldName: 50
      })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property invalidFieldName from input payload does not exist.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update a phone for an user with empty payload', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send({})
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to update a phone for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user3 must not be able to update a phone for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user4 must not be able to update a phone for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('guest must not be able to update a phone for an user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request('http://localhost:3000')
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
