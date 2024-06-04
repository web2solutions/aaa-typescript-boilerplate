/* global  describe, it, expect */
import request from 'supertest';
import { FastifyServer, Fastify } from '@src/infra/server/HTTP/adapters/fastify/FastifyServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/express/handlers/infraHandlers';
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/infra/auth/AuthService';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';
import {
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser2,
  BasicAuthorizationHeaderUser3,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest
} from '@test/mock';
import { RequestUpdatePassword, IUser } from '@src/domains/Users';

const webServer = new FastifyServer();
const API = new RestAPI<Fastify>({
  databaseClient: InMemoryDbClient,
  webServer,
  infraHandlers,
  serverType: EHTTPFrameworks.fastify,
  authService: AuthService.compile()
});
const server = API.server.application;

describe('fastify -> User updatePassword suite', () => {
  let usersAll: IUser[];
  let user1: IUser;

  beforeAll(async () => {
    await server.ready();
    usersAll = await API.seedUsers();
    [user1] = usersAll;
  });

  beforeEach(async () => {
    const requestUpdatePassword: RequestUpdatePassword = {
      password: 'user1_password',
      oldPassword: 'new_password_xxxxxxxxxxxxxxxxxx'
    };
    await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePassword`)
      .send(requestUpdatePassword)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
  });

  afterAll(async () => {
    await API.stop();
    await server.close();
  });

  it('user1 must be able to update an user password', async () => {
    expect.hasAssertions();
    const requestUpdatePassword: RequestUpdatePassword = {
      password: 'new_password_xxxxxxxxxxxxxxxxxx',
      oldPassword: user1.password
    };
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePassword`)
      .send(requestUpdatePassword)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.password).toBe(requestUpdatePassword.password);
    expect(response.statusCode).toBe(200);
  });

  it('user1 must not be able to update an user password with empty password', async () => {
    expect.hasAssertions();
    const requestUpdatePassword: RequestUpdatePassword = {
      password: '',
      oldPassword: 'user1_password'//
    };
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePassword`)
      .send(requestUpdatePassword)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body)
    expect(response.body.message).toBe('Bad Request - password can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update an user password with empty oldPassword', async () => {
    expect.hasAssertions();
    const requestUpdatePassword: RequestUpdatePassword = {
      password: 'new_password_xxxxxxxxxxxxxxxxxx',
      oldPassword: ''
    };
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePassword`)
      .send(requestUpdatePassword)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - oldPassword can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update an user password with password having less than 8 chars', async () => {
    expect.hasAssertions();
    const requestUpdatePassword: RequestUpdatePassword = {
      password: '1234567',
      oldPassword: user1.password
    };
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePassword`)
      .send(requestUpdatePassword)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - password must have at least 8 chars.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update user password with unknown field', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePassword`)
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
      .put(`/api/1.0.0/users/${user1.id}/updatePassword`)
      .send({})
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to update new user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePassword`)
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
      .put(`/api/1.0.0/users/${user1.id}/updatePassword`)
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
      .put(`/api/1.0.0/users/${user1.id}/updatePassword`)
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
      .put(`/api/1.0.0/users/${user1.id}/updatePassword`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
