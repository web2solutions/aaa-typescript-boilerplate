/* global  describe, it, expect */
import request from 'supertest';
import { Express } from 'express';
import { ExpressServer } from '@src/infra/server/HTTP/adapters/express/ExpressServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/express/handlers/infraHandlers';
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import {
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser2,
  BasicAuthorizationHeaderUser3,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest,
  account1,
  account2,
  account3
} from '@test/mock';

const webServer = new ExpressServer();
const API = new RestAPI<Express>({
  dbClient: InMemoryDbClient,
  webServer,
  infraHandlers
});
const server = API.server.application;

describe('express -> add Account suite', () => {
  afterAll(async () => {
    await API.stop();
  });

  it('user1 must be able to create an account - account data 1', async () => {
    expect.hasAssertions();
    const { userEmail, balance } = account1;
    const response = await request(server)
      .post('/api/1.0.0/accounts')
      .send({ userEmail, balance })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.userEmail).toBe(account1.userEmail);
    expect(response.body.chain[0].data.balance).toBe(balance);
    expect(response.body.chain[0].data.id).toBe('_genesis_');
    expect(response.statusCode).toBe(201);
  });

  it('user1 must be able to create an account with balance equal 0 - account data 2', async () => {
    expect.hasAssertions();
    const { userEmail } = account2;
    const response = await request(server)
      .post('/api/1.0.0/accounts')
      .send({ userEmail, balance: 0 })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body)
    expect(response.body.userEmail).toBe(account2.userEmail);
    expect(response.body.chain[0].data.balance).toBe(0);
    expect(response.body.chain[0].data.id).toBe('_genesis_');
    expect(response.statusCode).toBe(201);
  });

  it('user1 must not be able to create a duplicated account - account data 1', async () => {
    expect.hasAssertions();
    const { userEmail, balance } = account1;
    const response = await request(server)
      .post('/api/1.0.0/accounts')
      .send({ userEmail, balance })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Duplicated record - userEmail already in use');
    expect(response.statusCode).toBe(409);
  });

  it('user1 must not be able to create an account with balance less than 0 - account data 1', async () => {
    expect.hasAssertions();
    const { userEmail } = account3;
    const response = await request(server)
      .post('/api/1.0.0/accounts')
      .send({ userEmail, balance: -1 })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.body.message).toBe('Bad Request - balance must be a positive number');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to place new account with unknown field', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/accounts')
      .send({
        invalidFieldName: 50
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.body.message).toBe('Bad Request - The property invalidFieldName from input payload does not exist inside the domain.');
    expect(response.statusCode).toBe(400);
  });

  it('user1 must not be able to place new account with empty payload', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/accounts')
      .send({})
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(400);
  });

  it('user2 must not be able to place new account - Forbidden: the role create_account is required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/accounts')
      .send(account1)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser2);
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the create_account role');
  });

  it('user3 must not be able to place new account - Forbidden: the role create_account is required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/accounts')
      .send(account1)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser3);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the create_account role');
  });

  it('user4 must not be able to place new account - Forbidden: the role create_account is required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/accounts')
      .send(account1)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the create_account role');
  });

  it('guest must not be able to place new account - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .post('/api/1.0.0/accounts')
      .send(account1)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
