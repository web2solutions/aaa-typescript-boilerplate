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
  BasicAuthorizationHeaderUserGuest,
  emails
} from '@test/mock';
import { IUser, RequestCreateEmail } from '@src/domains/Users';
import { EmailValueObject } from '@src/domains/valueObjects';
// import { EEmailType } from '@src/domains/valueObjects';

const webServer = new FastifyServer();
const API = new RestAPI<Fastify>({
  databaseClient: InMemoryDbClient,
  webServer,
  infraHandlers,
  serverType: EHTTPFrameworks.fastify,
  authService: AuthService.compile()
});
const server = API.server.application;

describe('fastify -> User createEmail suite', () => {
  let usersAll: IUser[];
  let user1: IUser;
  let email1: EmailValueObject;
  beforeAll(async () => {
    await server.ready();
    usersAll = await API.seedUsers();
    [user1] = usersAll;
    [email1] = emails;
    // delete .id;
  });
  afterAll(async () => {
    await API.stop();
    await server.close();
  });

  it('user1 must be able to create a email for an user', async () => {
    expect.hasAssertions();
    const requestCreateEmail: RequestCreateEmail = {
      ...email1
    };
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createEmail`)
      .send(requestCreateEmail)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.body.emails[0].email).toBe(requestCreateEmail.email);
    expect(response.body.emails[0].type).toBe(requestCreateEmail.type);
    expect(response.statusCode).toBe(201);
  });

  it('user1 must not be able to create a email for an user with empty email', async () => {
    expect.hasAssertions();
    const requestCreateEmail: RequestCreateEmail = {
      ...email1,
      email: ''
    };
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createEmail`)
      .send(requestCreateEmail)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - email can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a email for an user with empty type', async () => {
    expect.hasAssertions();
    const requestCreateEmail = {
      ...email1,
      type: ''
    };
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createEmail`)
      .send(requestCreateEmail)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - type can not be empty');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a email for an user with unknown field', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createEmail`)
      .send({
        invalidFieldName: 50
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - The property invalidFieldName from input payload does not exist inside the domain.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to create a email for an user with empty payload', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createEmail`)
      .send({})
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to create a email for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createEmail`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user3 must not be able to create a email for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createEmail`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser3);
    // console.log(response.body);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('user4 must not be able to create a email for an user - Forbidden: the role update_user is required', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createEmail`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the update_user role');
  });

  it('guest must not be able to create a email for an user - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server.server)
      .post(`/api/1.0.0/users/${user1.id}/createEmail`)
      .send({ ...user1, id: user1.id })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
