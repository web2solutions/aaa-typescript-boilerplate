/* global  describe, it, expect */
// file deepcode ignore NoHardcodedPasswords: <mocked passwords>
// file deepcode ignore NoHardcodedCredentials/test: <fake credential>
import HyperExpress from 'hyper-express';
import { HyperExpressServer } from '@src/interface/HTTP/adapters/hyper-express/HyperExpressServer';
import { infraHandlers } from '@src/interface/HTTP/adapters/hyper-express/handlers/infraHandlers';
import { RestAPI } from '@src/interface/HTTP/RestAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { AuthService } from '@src/modules/Users/service/AuthService';
import { EHTTPFrameworks } from '@src/interface/HTTP/ports';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { InMemoryKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';

import { UserDataRepository, UserService } from '@src/modules/Users';
import { JwtService } from '@src/infra/jwt/JwtService';
import { UserProviderLocal } from '@src/modules/Users/service/UserProviderLocal';
import { getAbsoluteEndPoint } from '@test/integration/Hyper-Express/getAbsoluteEndPoint';

const webServer = HyperExpressServer.compile();
const databaseClient = InMemoryDbClient;
const passwordCryptoService = PasswordCryptoService.compile();
const jwtService = JwtService.compile();
const keyValueStorageClient = InMemoryKeyValueStorageClient.compile();
const mutexService = MutexService.compile(keyValueStorageClient);

// LOCAL IDENTITY PROVIDER
const dataRepository = UserDataRepository.compile({
  databaseClient: InMemoryDbClient
});
const userService = UserService.compile({
  dataRepository,
  services: {
    passwordCryptoService,
    mutexService
  }
});
const userProvider = UserProviderLocal.compile(userService);

const authService = AuthService.compile(
  userProvider,
  passwordCryptoService,
  jwtService
);
// LOCAL IDENTITY PROVIDER

const serverType = EHTTPFrameworks.hyper_express;

let API: RestAPI<HyperExpress.Server>;

describe('hyper-express -> apiVersions end point', () => {
  beforeAll(async () => {
    await databaseClient.connect();
    await keyValueStorageClient.connect();
    API = new RestAPI<HyperExpress.Server>({
      databaseClient,
      webServer,
      infraHandlers,
      serverType,
      authService,
      passwordCryptoService,
      keyValueStorageClient,
      mutexService
    });
    // server = API.server;

    await API.start();
  });

  afterAll(async () => {
    await databaseClient.disconnect();
    await keyValueStorageClient.disconnect();
    await API.stop();
  });

  it('/version response must contain the version 1.0.0', async () => {
    expect.hasAssertions();
    const response = await fetch(getAbsoluteEndPoint('/versions'), {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('versions');
    expect(body.versions['1.0.0']).toBeDefined();

    const responseDoc = await fetch(getAbsoluteEndPoint(body.versions['1.0.0']), {
      method: 'GET',
      headers: {
        Accept: 'application/json; charset=utf-8'
      }
    });

    expect(responseDoc.status).toBe(200);
  });
});
