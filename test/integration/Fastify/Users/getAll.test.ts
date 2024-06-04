/* global  describe, it, expect */
import request from 'supertest';
import { FastifyServer, Fastify } from '@src/infra/server/HTTP/adapters/fastify/FastifyServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/express/handlers/infraHandlers';
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/infra/auth/AuthService';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';
import users from '@seed/users';
import {
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser2,
  BasicAuthorizationHeaderUser3,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest
} from '@test/mock';

const webServer = new FastifyServer();
const API = new RestAPI<Fastify>({
  databaseClient: InMemoryDbClient,
  webServer,
  infraHandlers,
  serverType: EHTTPFrameworks.fastify,
  authService: AuthService.compile()
});
const server = API.server.application;

describe('fastify -> get Users suite', () => {
  beforeAll(async () => {
    await server.ready();
    await API.seedUsers();
  });
  afterAll(async () => {
    await API.stop();
    await server.close();
  });

  it('user1 must be able to read all users', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .get('/api/1.0.0/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(users.length);
    expect(response.body[0].firstName).toBe(users[0].firstName);
    expect(response.body[0].lastName).toBe(users[0].lastName);
  });

  it('user2 must be able to read all users', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .get('/api/1.0.0/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser2);
    // console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(users.length);
    expect(response.body[0].firstName).toBe(users[0].firstName);
    expect(response.body[0].lastName).toBe(users[0].lastName);
  });

  it('user3 must be able to read all users', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .get('/api/1.0.0/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(users.length);
    expect(response.body[0].firstName).toBe(users[0].firstName);
    expect(response.body[0].lastName).toBe(users[0].lastName);
  });

  it('user4 must not be able to read all users - Forbidden: read_user role required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .get('/api/1.0.0/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the read_user role');
  });

  it('guest must not be able to read an user data - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .get('/api/1.0.0/users')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
