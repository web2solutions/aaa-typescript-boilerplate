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
  BasicAuthorizationHeaderUserGuest
} from '@test/mock';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';
import { RequestUpdateLogin, IUser } from '@src/domains/Users';

const webServer = new FastifyServer();
const API = new RestAPI<Fastify>({
  dbClient: InMemoryDbClient,
  webServer,
  infraHandlers,
  serverType: EHTTPFrameworks.fastify
});
const server = API.server.application;

describe('fastify -> User updateLogin suite', () => {
  let usersAll: IUser[];
  let user1: IUser;
  beforeAll(async () => {
    await server.ready();
    usersAll = await API.seedUsers();
    [user1] = usersAll;
  });
  afterAll(async () => {
    await API.stop();
    await server.close();
  });

  it('user1 must be able to update an user login - user data 1', async () => {
    expect.hasAssertions();
    const requestUpdateLogin: RequestUpdateLogin = {
      username: 'new_username_1',
      password: 'new_password_123456678'
    };
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updateLogin`)
      .send(requestUpdateLogin)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.login.username).toBe(requestUpdateLogin.username);
    expect(response.body.login.password).toBe(requestUpdateLogin.password);
    expect(response.statusCode).toBe(200);
  });

  it('user1 must not be able to update an user login with empty login.username - user data 1', async () => {
    expect.hasAssertions();
    const requestUpdateLogin: RequestUpdateLogin = {
      username: '',
      password: 'new_password_123456678'
    };
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updateLogin`)
      .send(requestUpdateLogin)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - login.username can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update an user login with empty login.password - user data 1', async () => {
    expect.hasAssertions();
    const requestUpdateLogin: RequestUpdateLogin = {
      username: 'new_username_1',
      password: ''
    };
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updateLogin`)
      .send(requestUpdateLogin)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - login.password can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update an user login with login.password having less than 8 chars - user data 1', async () => {
    expect.hasAssertions();
    const requestUpdateLogin: RequestUpdateLogin = {
      username: 'new_username_1',
      password: '1234567'
    };
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updateLogin`)
      .send(requestUpdateLogin)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - login.password must have at least 8 chars.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update new user with unknown field', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updateLogin`)
      .send({
        invalidFieldName: 50
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property invalidFieldName from input payload does not exist inside the domain.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update new user with empty payload', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updateLogin`)
      .send({})
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to update new user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updateLogin`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user3 must not be able to update new user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updateLogin`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user4 must not be able to update new user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updateLogin`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('guest must not be able to update new user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updateLogin`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('user not found');
  });
});
