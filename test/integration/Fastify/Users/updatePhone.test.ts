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
import { IUser, RequestUpdatePhone } from '@src/domains/Users';
import { PhoneValueObject } from '@src/domains/valueObjects';

const webServer = new FastifyServer();
const API = new RestAPI<Fastify>({
  dbClient: InMemoryDbClient,
  webServer,
  infraHandlers,
  serverType: EHTTPFrameworks.fastify
});
const server = API.server.application;

describe('fastify -> User updatePhone suite', () => {
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

  it('user1 must be able to update a phone for an user', async () => {
    expect.hasAssertions();
    const requestUpdatePhone: RequestUpdatePhone = {
      ...phone1,
      number: '99999-9999'
    };
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send(requestUpdatePhone)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.phones[0].number).toBe(requestUpdatePhone.number);
    expect(response.body.phones[0].localCode).toBe(requestUpdatePhone.localCode);
    expect(response.statusCode).toBe(200);
  });

  it('user1 must not be able to update a phone for an user with empty number', async () => {
    expect.hasAssertions();
    const requestUpdatePhone: RequestUpdatePhone = {
      ...phone1,
      number: ''
    };
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send(requestUpdatePhone)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - number can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update a phone for an user with empty countryCode', async () => {
    expect.hasAssertions();
    const requestUpdatePhone: RequestUpdatePhone = {
      ...phone1,
      countryCode: ''
    };
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send(requestUpdatePhone)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - countryCode can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update a phone for an user with empty localCode', async () => {
    expect.hasAssertions();
    const requestUpdatePhone = {
      ...phone1,
      localCode: ''
    };
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send(requestUpdatePhone)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - localCode can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update a phone for an user with unknown field', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send({
        invalidFieldName: 50
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property invalidFieldName from input payload does not exist inside the domain.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to update a phone for an user with empty payload', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send({})
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to update a phone for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user3 must not be able to update a phone for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user4 must not be able to update a phone for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('guest must not be able to update a phone for an user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .put(`/api/1.0.0/users/${user1.id}/updatePhone/${phone1.id}`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('user not found');
  });
});
