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
  IAccount
} from '@src/domains/Accounts';
import {
  BasicAuthorizationHeaderUser1,
  BasicAuthorizationHeaderUser4,
  BasicAuthorizationHeaderUserGuest
} from '@test/mock';

const webServer = new ExpressServer();
const API = new RestAPI<Express>({
  dbClient: InMemoryDbClient,
  webServer,
  infraHandlers
});
const server = API.server.application;

describe('express -> checkAccountIntegrity suite', () => {
  let createdAccount: IAccount;
  beforeAll(async () => {
    // create account
    await API.seedAccounts();
    await API.seedTransactions();
  });
  afterAll(async () => {
    await API.stop();
  });

  it('account integrity status must be healthy', async () => {
    expect.hasAssertions();
    const { body } = await request(server)
      .get('/api/1.0.0/accounts')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    [createdAccount] = body;

    const response = await request(server)
      .get(`/api/1.0.0/accounts/${createdAccount.id}/checkIntegrity`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);

    expect(response.statusCode).toBe(200);
    const lastBlock = createdAccount.chain[createdAccount.chain.length - 1];

    expect(createdAccount.balance).toBe(lastBlock.data.balance);
  });

  it('user4 must not be able to check account integrity - Forbidden: read_account role required', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get(`/api/1.0.0/accounts/${createdAccount.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser4);
    // console.log(response.body.message)
    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Forbidden - Insufficient permission - user must have the read_account role');
  });

  it('guest must not be able to check account integrity - Unauthorized', async () => {
    expect.hasAssertions();
    const response = await request(server)
      .get(`/api/1.0.0/accounts/${createdAccount.id}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUserGuest);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Unauthorized - user not found');
  });
});
