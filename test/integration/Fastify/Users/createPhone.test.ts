/* global  describe, it, expect */
import request from 'supertest';
import { FastifyServer, Fastify } from '@src/infra/server/HTTP/adapters/fastify/FastifyServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/express/handlers/infraHandlers';
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/infra/auth/AuthService';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import {
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser2,
  BasicAuthorizationHeaderUser3,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest,
  phones
} from '@test/mock';
import { IUser, RequestCreatePhone } from '@src/domains/Users';
import { PhoneValueObject } from '@src/domains/valueObjects';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';

const webServer = new FastifyServer();

const databaseClient = InMemoryDbClient;
const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
const mutexService = MutexService.compile(keyValueStorageClient);

const authService = AuthService.compile();
const passwordCryptoService = PasswordCryptoService.compile();

const serverType = EHTTPFrameworks.fastify;

let API: any;
let server: any;

describe('fastify -> User createPhone suite', () => {
  let usersAll: IUser[];
  let user1: IUser;
  let phone1: PhoneValueObject;
  beforeAll(async () => {
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

    await API.start();
    await server.ready();
    usersAll = await API.seedUsers();
    [user1] = usersAll;
    [phone1] = phones;
    // delete .id;
  });
  afterAll(async () => {
    await API.stop();
    await server.close();
  });

  it('user1 must be able to create a phone for an user', async () => {
    expect.hasAssertions();
    const requestCreatePhone: RequestCreatePhone = {
      ...phone1
    };
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createPhone`)
      .send(requestCreatePhone)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.phones[0].number).toBe(requestCreatePhone.number);
    expect(response.body.phones[0].localCode).toBe(requestCreatePhone.localCode);
    expect(response.statusCode).toBe(201);
  });

  it('user1 must not be able to create a phone for an user with empty number', async () => {
    expect.hasAssertions();
    const requestCreatePhone: RequestCreatePhone = {
      ...phone1,
      number: ''
    };
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createPhone`)
      .send(requestCreatePhone)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - number can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a phone for an user with empty countryCode', async () => {
    expect.hasAssertions();
    const requestCreatePhone: RequestCreatePhone = {
      ...phone1,
      countryCode: ''
    };
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createPhone`)
      .send(requestCreatePhone)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - countryCode can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a phone for an user with empty localCode', async () => {
    expect.hasAssertions();
    const requestCreatePhone = {
      ...phone1,
      localCode: ''
    };
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createPhone`)
      .send(requestCreatePhone)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - localCode can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a phone for an user with unknown field', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createPhone`)
      .send({
        invalidFieldName: 50
      })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property invalidFieldName from input payload does not exist inside the domain.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a phone for an user with empty payload', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createPhone`)
      .send({})
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to create a phone for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createPhone`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user3 must not be able to create a phone for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createPhone`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user4 must not be able to create a phone for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createPhone`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('guest must not be able to create a phone for an user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createPhone`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
