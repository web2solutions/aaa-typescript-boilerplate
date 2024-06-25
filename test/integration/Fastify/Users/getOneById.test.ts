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
  IUser
} from '@src/domains/Users';
import {
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser2,
  BasicAuthorizationHeaderUser3,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest,
  user1
} from '@test/mock';
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

describe('fastify -> getUserById suite', () => {
  let createdUser: IUser;
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
    // create user
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);
    createdUser = response.body;
  });
  afterAll(async () => {
    await API.stop();
    await server.close();
  });

  it('user1 must be able to read an user data', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .get(`/api/1.0.0/users/${createdUser.id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe(createdUser.firstName);
  });

  it('user2 must be able to read an user data', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .get(`/api/1.0.0/users/${createdUser.id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser2);

    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe(createdUser.firstName);
  });

  it('user3 must be able to read an user data', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .get(`/api/1.0.0/users/${createdUser.id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUser3);

    expect(response.statusCode).toBe(200);
    expect(response.body.firstName).toBe(createdUser.firstName);
  });

  it('user4 must not be able to read an user data - Forbidden: read_user role required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
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
    const response = await request(server.server)
      .get(`/api/1.0.0/users/${createdUser.id}`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUserGuest);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
