/* global  describe, it, expect */
import request from 'supertest';
import { FastifyServer, Fastify } from '@src/infra/server/HTTP/adapters/fastify/FastifyServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/express/handlers/infraHandlers';
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
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
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';

const webServer = new FastifyServer();
const API = new RestAPI<Fastify>({
  dbClient: InMemoryDbClient,
  webServer,
  infraHandlers,
  serverType: EHTTPFrameworks.fastify
});
const server = API.server.application;

describe('fastify -> create User suite', () => {
  beforeAll(async () => {
    await server.ready();
  });
  afterAll(async () => {
    await API.stop();
    await server.close();
  });

  it('user1 must be able to create an user - user data 1', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.firstName).toBe(user1.firstName);
    expect(response.body.lastName).toBe(user1.lastName);
    expect(response.statusCode).toBe(201);
  });

  it('user1 must not be able to create a duplicated login.username - user data 1', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.message).toBe('Duplicated record - login.username already in use');
    expect(response.statusCode).toBe(409);
  });

  it('user1 must not be able to create a user with empty login.username - user data 1', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send({ ...user1, login: { username: '', password: '123' } })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - login.username can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a user with empty login.password - user data 1', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send({ ...user1, login: { username: 'loginname', password: '' } })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - login.password can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a user with login.password having less than 8 chars - user data 1', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send({ ...user1, login: { username: 'loginname', password: '1234567' } })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - login.password must have at least 8 chars.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create an user with empty firstName - user data 3', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send({ ...user3, firstName: '' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
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
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property invalidFieldName from input payload does not exist inside the domain.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create new user with empty payload', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send({})
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to create new user - Forbidden: the role create_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the create_user role');
  });

  it('user3 must not be able to create new user - Forbidden: the role create_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post('/api/1.0.0/users')
      .send(user1)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
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
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
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
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('user not found');
  });
});
