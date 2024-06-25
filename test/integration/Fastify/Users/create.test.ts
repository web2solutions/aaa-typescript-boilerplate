/* global  describe, it, expect */
// file deepcode ignore NoHardcodedPasswords: <mocked passwords>
// file deepcode ignore NoHardcodedCredentials/test: <fake credential>
import request from 'supertest';
import { FastifyServer, Fastify } from '@src/infra/server/HTTP/adapters/fastify/FastifyServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/express/handlers/infraHandlers';
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/infra/auth/AuthService';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import {
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser2,
  BasicAuthorizationHeaderUser3,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest,
  user1,
  // user2,
  user3
} from '@test/mock';

const webServer = new FastifyServer();

const databaseClient = InMemoryDbClient;
const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
const mutexService = MutexService.compile(keyValueStorageClient);

const authService = AuthService.compile();
const passwordCryptoService = PasswordCryptoService.compile();

const serverType = EHTTPFrameworks.fastify;

let API: any;
let server: any;

describe('fastify -> create User suite', () => {
  beforeAll(async () => {
    // await keyValueStorageClient.connect();

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
  });
  afterAll(async () => {
    await API.stop();
    await server.close();
    // await keyValueStorageClient.disconnect();
  });

  it('user1 must be able to create an user', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.body.firstName).toBe(user1.firstName);
    expect(response.body.lastName).toBe(user1.lastName);
    expect(response.statusCode).toBe(201);
  });

  it('user1 must not be able to create a duplicated username', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.message).toBe('Duplicated record - username already in use');
    expect(response.statusCode).toBe(409);
  });

  it('user1 must not be able to create a user with empty username', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send({ ...user1, username: '', password: '12345678' })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - username can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a user with empty password', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send({ ...user1, username: 'loginname', password: '' })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.message).toBe('Bad Request - password must have at least 8 chars.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a user with password having less than 8 chars', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send({ ...user1, username: 'loginname', password: '1234567' })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - password must have at least 8 chars.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create an user with empty firstName', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send({ ...user3, firstName: '' })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - firstName can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create new user with unknown field', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send({
        invalidFieldName: 50
      })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property invalidFieldName from input payload does not exist inside the domain.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create new user with empty payload', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send({})
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body)
    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to create new user - Forbidden: the role create_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the create_user role');
  });

  it('user3 must not be able to create new user - Forbidden: the role create_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the create_user role');
  });

  it('user4 must not be able to create new user - Forbidden: the role create_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the create_user role');
  });

  it('guest must not be able to create new user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
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
