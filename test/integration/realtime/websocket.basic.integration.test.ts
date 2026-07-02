/* global describe, it, expect, beforeAll, afterAll */
import { io as createSocketClient, Socket } from 'socket.io-client';
import { WebSocketAPI } from '@src/interface/WebSocket/WebSocketAPI';
import { InMemoryDbClient } from '@src/infra/persistence/InMemoryDatabase/InMemoryDbClient';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { JwtService } from '@src/infra/jwt/JwtService';
import { compileKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/compileKeyValueStorageClient';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { composeUsersAuthServices } from '@src/modules/Users';
import { InMemoryMessageMediator } from '@src/infra/messages/InMemoryMessageMediator';

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

const emitWithAck = (
  socket: Socket,
  payload: Record<string, any>
): Promise<any> => new Promise((resolve, reject) => {
  socket.timeout(10000).emit(
    'api:request',
    payload,
    (ackError: any, ackPayload: any) => (ackError ? reject(ackError) : resolve(ackPayload))
  );
});

describe('realtime websocket integration', () => {
  const port = 33201;
  let api: WebSocketAPI;
  let client: Socket;

  beforeAll(async () => {
    api = new WebSocketAPI({
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
    client = createSocketClient(`ws://127.0.0.1:${port}`, {
      path: '/ws',
      transports: ['websocket'],
      forceNew: true
    });
    await new Promise<void>((resolve, reject) => {
      client.on('connect', () => resolve());
      client.on('connect_error', (error) => reject(error));
    });
  });

  afterAll(async () => {
    if (client?.connected) client.disconnect();
    await api.stop();
  });

  it('responds with normalized error envelope for unknown operation', async () => {
    expect.hasAssertions();
    const response = await emitWithAck(client, {
      version: '1.0.0',
      operationId: 'unknownOperation',
      metadata: { requestId: 'ws-int-1' }
    });

    expect(response.ok).toBe(false);
    expect(response.operationId).toBe('unknownOperation');
    expect(response.error).toBeDefined();
    expect(response.metadata.requestId).toBe('ws-int-1');
  });
});
