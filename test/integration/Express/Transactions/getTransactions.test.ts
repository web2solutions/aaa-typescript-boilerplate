/* eslint-disable @typescript-eslint/no-explicit-any */
/* global  describe, it, expect */
import request from 'supertest';
import { Express } from 'express';
import { ExpressServer } from '@src/infra/server/HTTP/adapters/express/ExpressServer';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/express/handlers/infraHandlers';
import {
  RestAPI
} from '@src/infra/RestAPI';
import {
  InMemoryDbClient
} from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';

import { mutexService } from '@src/infra/mutex/adapter/MutexService';
import {
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser2,
  BasicAuthorizationHeaderUser3,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest
} from '@test/mock';

const webServer = new ExpressServer();
const API = new RestAPI<Express>({
  dbClient: InMemoryDbClient,
  webServer,
  mutexService,
  infraHandlers
});
const server = API.server.application as Express;

describe('express -> get Transactions suite', () => {
  beforeAll(async () => {
    try {
      await API.seedAccounts();
      await API.seedTransactions();
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.log(error.message);
    }
  });

  afterAll(async () => {
    await API.stop();
  });

  it('user1 must be able to read all transactions', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get('/api/1.0.0/transactions')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    // console.log(response.body);
    expect(response.statusCode).toBe(200);

    expect(response.body.length > 0).toBeTruthy();
  });

  it('user2 must be able to read all transactions', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get('/api/1.0.0/transactions')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser2);
    // console.log(response.body);
    expect(response.statusCode).toBe(200);

    expect(response.body.length > 0).toBeTruthy();
  });

  it('user3 must be able to read all transactions', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get('/api/1.0.0/transactions')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser3);

    expect(response.statusCode).toBe(200);

    expect(response.body.length > 0).toBeTruthy();
  });

  it('user4 must not be able to read all transactions - Forbidden: read_transaction role required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get('/api/1.0.0/transactions')
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
      .get('/api/1.0.0/transactions')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUserGuest);
    // console.log(response.body)
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('user not found');
  });
});
