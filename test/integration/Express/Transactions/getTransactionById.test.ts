/* global  describe, it, expect */
import request from 'supertest';
import { Express } from 'express';
import { ExpressServer } from '@src/infra/server/HTTP/adapters/express/ExpressServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/express/handlers/infraHandlers';
import {
  InMemoryDbClient
} from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import {
  RestAPI
} from '@src/infra/RestAPI';

import {
  ITransaction
} from '@src/domains/Transactions';

import { mutexService } from '@src/infra/mutex/adapter/MutexService';
import {
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser2,
  BasicAuthorizationHeaderUser3,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest,
  transaction1
} from '@test/mock';

const webServer = new ExpressServer();
const API = new RestAPI<Express>({
  dbClient: InMemoryDbClient,
  webServer,
  mutexService,
  infraHandlers
});
const server = API.server.application as Express;

describe('express -> getTransactionById suite', () => {
  let createdTransaction: ITransaction;
  beforeAll(async () => {
    const {
      userEmail,
      amount,
      type
    } = transaction1;

    await request(server)
      .post('/api/1.0.0/accounts')
      .send({
        userEmail,
        balance: 0
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);

    const response = await request(server)
      .post('/api/1.0.0/transactions')
      .send({
        userEmail,
        amount,
        type
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    createdTransaction = response.body;
  });

  afterAll(async () => {
    await API.stop();
  });

  it('user1 must be able to read an transaction data', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get(`/api/1.0.0/transactions/${createdTransaction.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(200);
    expect(response.body.userEmail).toBe(createdTransaction.userEmail);
  });

  it('user2 must be able to read an transaction data', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get(`/api/1.0.0/transactions/${createdTransaction.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser2);

    expect(response.statusCode).toBe(200);
    expect(response.body.userEmail).toBe(createdTransaction.userEmail);
  });

  it('user3 must be able to read an transaction data', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get(`/api/1.0.0/transactions/${createdTransaction.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser3);

    expect(response.statusCode).toBe(200);
    expect(response.body.userEmail).toBe(createdTransaction.userEmail);
  });

  it('user4 must not be able to read an transaction data - Forbidden: read_transaction role required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get(`/api/1.0.0/transactions/${createdTransaction.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the read_transaction role');
  });

  it('guest must not be able to read an transaction data - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get(`/api/1.0.0/transactions/${createdTransaction.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUserGuest);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('user not found');
  });
});
