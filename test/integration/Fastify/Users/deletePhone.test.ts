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
import { IUser } from '@src/domains/Users';
import { PhoneValueObject } from '@src/domains/valueObjects';

const webServer = new FastifyServer();
const API = new RestAPI<Fastify>({
  dbClient: InMemoryDbClient,
  webServer,
  infraHandlers,
  serverType: EHTTPFrameworks.fastify
});
const server = API.server.application;

describe('fastify -> User deletePhone suite', () => {
  let usersAll: IUser[];
  let user1: IUser;
  let phone1: PhoneValueObject;
  beforeAll(async () => {
    await server.ready();
    usersAll = await API.seedUsers();
    [user1] = usersAll;
    [phone1] = user1.phones || [];
    // delete .id;
  });
  afterAll(async () => {
    await API.stop();
    await server.close();
  });

  it('user1 must be able to delete a phone of an user', async () => {
    expect.hasAssertions();
    expect(user1.phones).toHaveLength(3);
    const response = await request(server.server)
      .delete(`/api/1.0.0/users/${user1.id}/deletePhone/${phone1.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.phones).toHaveLength(2);
    expect(response.body.phones[0].number).toBe(user1.phones![1].number);
    expect(response.body.phones[0].localCode).toBe(user1.phones![1].localCode);
    expect(response.statusCode).toBe(200);
  });

  it('user2 must not be able to delete a phone of an user - Forbidden: the role delete_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .delete(`/api/1.0.0/users/${user1.id}/deletePhone/${phone1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the delete_user role');
  });

  it('user3 must not be able to delete a phone of an user - Forbidden: the role delete_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .delete(`/api/1.0.0/users/${user1.id}/deletePhone/${phone1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the delete_user role');
  });

  it('user4 must not be able to delete a phone of an user - Forbidden: the role delete_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .delete(`/api/1.0.0/users/${user1.id}/deletePhone/${phone1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the delete_user role');
  });

  it('guest must not be able to delete a phone of an user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .delete(`/api/1.0.0/users/${user1.id}/deletePhone/${phone1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('user not found');
  });
});
