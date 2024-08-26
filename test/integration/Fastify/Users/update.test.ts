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
  BasicAuthorizationHeaderUserGuest
} from '@test/mock';
import { UserDataRepository, UserService } from '@src/domains/Users';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { JwtService } from '@src/infra/jwt/JwtService';
import { UserProviderLocal } from '@src/infra/auth/UserProviderLocal';

import createdUsers from '@seed/users';
import { EAuthSchemaType } from '@src/infra/auth/EAuthSchemaType';
import { IAuthorizationHeader } from '@src/infra/auth/IAuthorizationHeader';

const [createdUser1, createdUser2, createdUser3, createdUser4] = createdUsers;

const webServer = new FastifyServer();
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

const serverType = EHTTPFrameworks.fastify;

let API: any;
let server: any;
let authorizationHeaderUser1: IAuthorizationHeader;
let authorizationHeaderUser2: IAuthorizationHeader;
let authorizationHeaderUser3: IAuthorizationHeader;
let authorizationHeaderUser4: IAuthorizationHeader;

describe('fastify -> update User suite', () => {
  beforeAll(async () => {
    await databaseClient.connect();
    await keyValueStorageClient.connect();
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
    await API.seedUsers();
    await server.ready();

    authorizationHeaderUser1 = {
      ...(await authService.authenticate(
        createdUser1.username,
        createdUser1.password,
        EAuthSchemaType.Basic
      ))
    };
    authorizationHeaderUser2 = {
      ...(await authService.authenticate(
        createdUser2.username,
        createdUser2.password,
        EAuthSchemaType.Basic
      ))
    };
    authorizationHeaderUser3 = {
      ...(await authService.authenticate(
        createdUser3.username,
        createdUser3.password,
        EAuthSchemaType.Basic
      ))
    };
    authorizationHeaderUser4 = {
      ...(await authService.authenticate(
        createdUser4.username,
        createdUser4.password,
        EAuthSchemaType.Basic
      ))
    };
  });

  afterAll(async () => {
    await API.stop();
    await server.close();
  });

  it('user1 must be able to update an user', async () => {
    expect.hasAssertions();
    const payload = {
      ...createdUser1,
      id: createdUser1.id
    };
    delete (payload as any).password;
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${createdUser1.id}`)
      .send(payload)
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.firstName).toBe(payload.firstName);
    expect(response.body.lastName).toBe(payload.lastName);
    expect(response.statusCode).toBe(200);
  });

  it('user1 must not be able to update a user with password', async () => {
    expect.hasAssertions();
    delete (createdUser1 as any).password;
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${createdUser1.id}`)
      .send({
        ...createdUser1,
        id: createdUser1.id,
        password: 'xxxxxxxx'
      })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property password from input payload does not exist inside the domain.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update an user with empty firstName', async () => {
    expect.hasAssertions();
    delete (createdUser4 as any).password;
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${createdUser4.id}`)
      .send({
        ...createdUser4,
        id: createdUser4.id,
        firstName: ''
      })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - firstName can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update user with unknown field', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${createdUser1.id}`)
      .send({ ...createdUser1, id: createdUser1.id, invalidFieldName: 50 })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property invalidFieldName from input payload does not exist inside the domain.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update new user with empty payload', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${createdUser1.id}`)
      .send({})
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser1);

    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to update new user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${createdUser2.id}`)
      .send({ ...createdUser2, id: createdUser2.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user3 must not be able to update new user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${createdUser1.id}`)
      .send({ ...createdUser1, id: createdUser1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser3);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user4 must not be able to update new user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${createdUser1.id}`)
      .send({ ...createdUser1, id: createdUser1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(authorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('guest must not be able to update new user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${createdUser1.id}`)
      .send({ ...createdUser1, id: createdUser1.id })
      .set('Content-Type', 'application/json; charset=utf-8')
      .set('Accept', 'application/json; charset=utf-8')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
