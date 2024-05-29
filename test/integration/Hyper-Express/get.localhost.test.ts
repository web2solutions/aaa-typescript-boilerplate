/* global  describe, it, expect */
import HyperExpress from 'hyper-express';
import { HyperExpressServer } from '@src/infra/server/HTTP/adapters/hyper-express/HyperExpressServer';
import { RestAPI } from '@src/infra/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { infraHandlers } from '@src/infra/server/HTTP/adapters/hyper-express/handlers/infraHandlers';
import { BasicAuthorizationHeaderUser1 } from '@test/mock';
import { EHTTPFrameworks } from '@src/infra/server/HTTP/ports/EHTTPFrameworks';
import { mutexService } from '@src/infra/mutex/adapter/MutexService';

describe('hyper-express -> /localhost suite', () => {
  let webServer: HyperExpressServer;
  let API: RestAPI<HyperExpress.Server>;
  beforeAll(async () => {
    webServer = new HyperExpressServer();
    API = new RestAPI<HyperExpress.Server>({
      dbClient: InMemoryDbClient,
      webServer,
      mutexService,
      infraHandlers,
      serverType: EHTTPFrameworks.hyper_express
    });

    await API.start();
    await API.seedAccounts();
  });
  afterAll(async () => {
    await API.stop();
  });

  it('localhost should return 200', async () => {
    expect.hasAssertions();
    const response = await fetch('http://0.0.0.0:3000/', {
      method: 'GET',
      headers: {
        ...BasicAuthorizationHeaderUser1
      }
    });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
  });
});

// loadtest -n 1000 http://localhost:3000

// loadtest -n 1000000 -c 100 http://localhost:3000/api/1.0.0/accounts -H 'Authorization:Basic ZW1wbG95ZWUxOmVtcGxveWVlMV9wYXNzd29yZA=='

// loadtest -n 20000 http://localhost:3000/api/1.0.0/accounts -H 'Authorization:Basic ZW1wbG95ZWUxOmVtcGxveWVlMV9wYXNzd29yZA=='

// loadtest -c 10 --rps 400 http://localhost:3000/api/1.0.0/accounts -H 'Authorization:Basic ZW1wbG95ZWUxOmVtcGxveWVlMV9wYXNzd29yZA=='
