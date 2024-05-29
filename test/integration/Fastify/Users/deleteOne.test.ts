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
  // user1,
  // user2,
  // user3
} from '@test/mock';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';
import { IUser } from '../../../../src/domains/Users/Entity/IUser';

const webServer = new FastifyServer();
const API = new RestAPI<Fastify>({
  dbClient: InMemoryDbClient,
  webServer,
  infraHandlers,
  serverType: EHTTPFrameworks.fastify
});
const server = API.server.application;

describe('fastify -> delete User suite', () => {
  let usersAll: IUser[];
  // let user1: IUser;
  // let user2: IUser;
  // let user3: IUser;
  beforeAll(async () => {
    await server.ready();
    usersAll = await API.seedUsers();
    // user1 = usersAll[0];
    // user2 = usersAll[1];
    // user3 = usersAll[2];
    // console.log(usersAll);
  });
  afterAll(async () => {
    await API.stop();
    await server.close();
  });

  it('user1 must be able to delete an user - user data 1', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .delete(`/api/1.0.0/users/${usersAll[1].id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.deleted).toBeTruthy();
    expect(response.statusCode).toBe(200);
  });

  it('user2 must not be able to delete new user - Forbidden: the role delete_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .delete(`/api/1.0.0/users/${usersAll[0].id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the delete_user role');
  });

  it('user3 must not be able to delete new user - Forbidden: the role delete_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .delete(`/api/1.0.0/users/${usersAll[0].id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the delete_user role');
  });

  it('user4 must not be able to delete new user - Forbidden: the role delete_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .delete(`/api/1.0.0/users/${usersAll[0].id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the delete_user role');
  });

  it('guest must not be able to delete new user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .delete(`/api/1.0.0/users/${usersAll[0].id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('user not found');
  });
});
