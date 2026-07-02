/* global describe, it, expect, beforeAll, afterAll */
import { GrpcAPI } from '@src/interface/gRPC/gRPCAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { JwtService } from '@src/infra/jwt/JwtService';
import { compileKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/compileKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { composeUsersAuthServices } from '@src/modules/Users';
import { InMemoryMessageMediator } from '@src/infra/messages/InMemoryMessageMediator';
import { GrpcApiClient } from '../../../sdk-clients/grpc/GrpcApiClient';

const databaseClient = InMemoryDbClient;
const passwordCryptoService = PasswordCryptoService.compile();
const jwtService = JwtService.compile();
const keyValueStorageClient = compileKeyValueStorageClient('inmemory');
const mutexService = MutexService.compile(keyValueStorageClient);
const messageMediator = new InMemoryMessageMediator();
const { authService } = composeUsersAuthServices({
  databaseClient,
  passwordCryptoService,
  mutexService,
  jwtService,
  keyValueStorageClient,
  messageMediator
});

jest.setTimeout(30000);

describe('realtime grpc integration', () => {
  const port = 33202;
  let api: GrpcAPI;
  let client: GrpcApiClient;

  beforeAll(async () => {
    api = new GrpcAPI({
      databaseClient,
      host: '127.0.0.1',
      port,
      authService,
      passwordCryptoService,
      keyValueStorageClient,
      mutexService,
      eventBus: messageMediator,
      messageMediator
    });
    await api.start();
    client = new GrpcApiClient(`127.0.0.1:${port}`);
  });

  afterAll(async () => {
    await api.stop();
  });

  it('responds with normalized error envelope for unknown operation', async () => {
    expect.hasAssertions();
    await expect(client.request({
      version: '1.0.0',
      operationId: 'unknownOperation',
      metadata: { requestId: 'grpc-int-1' }
    })).rejects.toThrow('Operation "unknownOperation" not found.');
  });
});
