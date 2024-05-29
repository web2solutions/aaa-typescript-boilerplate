/* global  describe, it, expect */
import request from 'supertest';

import { FastifyServer, Fastify } from '@src/infra/server/HTTP/adapters/fastify/FastifyServer';
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/fastify/handlers/infraHandlers';
import { BasicAuthorizationHeaderUser1 } from '@test/mock';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';

const webServer = new FastifyServer();
const API = new RestAPI<Fastify>({
  dbClient: InMemoryDbClient,
  webServer,
  infraHandlers,
  serverType: EHTTPFrameworks.fastify
});
// eslint-disable-next-line prefer-destructuring
const application = API.server.application;

describe('/localhost suite', () => {
  beforeAll(async () => {
    await application.ready();
  });
  afterAll(async () => {
    await API.stop();
    await application.close();
  });

  it('fastify -> localhost should return 200', async () => {
    expect.hasAssertions();
    const response = await request(application.server)
      .get('/')
      .set('Accept', 'application/json')
      .set(BasicAuthorizationHeaderUser1);
    expect(response.statusCode).toBe(200);
  });
});
