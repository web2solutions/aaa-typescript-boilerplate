/* global  describe, it, expect */
// file deepcode ignore NoHardcodedPasswords: <mocked passwords>
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
  user1,
  user3
} from '@test/mock';
import { IUser } from '@src/domains/Users';
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

describe('fastify -> update User suite', () => {
  let usersAll: IUser[];

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
  });

  afterAll(async () => {
    await API.stop();
    await server.close();
  });

  it('user1 must be able to update an user', async () => {
    expect.hasAssertions();
    const payload = {
      id: usersAll[0].id,
      ...user1
    };
    delete (payload as any).password;
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${usersAll[0].id}`)
      .send(payload)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.firstName).toBe(user1.firstName);
    expect(response.body.lastName).toBe(user1.lastName);
    expect(response.statusCode).toBe(200);
  });

  it('user1 must not be able to update a user with empty username', async () => {
    expect.hasAssertions();
    delete (user1 as any).password;
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${usersAll[0].id}`)
      .send({ ...user1, id: usersAll[0].id, username: '' })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - username can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update a user with password', async () => {
    expect.hasAssertions();
    delete (user1 as any).password;
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${usersAll[0].id}`)
      .send({
        ...user1,
        id: usersAll[0].id,
        password: 'xxxxxxxx'
      })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property password from input payload does not exist inside the domain.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update an user with empty firstName', async () => {
    expect.hasAssertions();
    delete (user3 as any).password;
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${usersAll[2].id}`)
      .send({ ...user3, id: usersAll[2].id, firstName: '' })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - firstName can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update new user with unknown field', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${usersAll[0].id}`)
      .send({
        invalidFieldName: 50
      })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property invalidFieldName from input payload does not exist inside the domain.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update new user with empty payload', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${usersAll[0].id}`)
      .send({})
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to update new user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${usersAll[0].id}`)
      .send({ ...user1, id: usersAll[0].id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user3 must not be able to update new user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${usersAll[0].id}`)
      .send({ ...user1, id: usersAll[0].id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user4 must not be able to update new user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${usersAll[0].id}`)
      .send({ ...user1, id: usersAll[0].id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('guest must not be able to update new user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${usersAll[0].id}`)
      .send({ ...user1, id: usersAll[0].id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
