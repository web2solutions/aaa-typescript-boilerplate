/* global describe, it, expect, beforeAll, afterAll */
import { io as createSocketClient, Socket } from 'socket.io-client';
import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { WebSocketAPI } from '@src/interface/WebSocket/WebSocketAPI';
import { GrpcAPI } from '@src/interface/gRPC/gRPCAPI';
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

const grpcUnaryRequest = (client: any, payload: Record<string, any>): Promise<any> => (
  new Promise((resolve, reject) => {
    client.request(payload, (error: Error | null, response: any) => (
      error ? reject(error) : resolve(response)
    ));
  })
);

describe('realtime api smoke', () => {
  const wsPort = 33301;
  const grpcPort = 33302;
  let wsApi: WebSocketAPI;
  let grpcApi: GrpcAPI;
  let wsClient: Socket;
  let grpcClient: any;

  beforeAll(async () => {
    wsApi = new WebSocketAPI({
      databaseClient,
      host: '127.0.0.1',
      port: wsPort,
      authService,
      passwordCryptoService,
      keyValueStorageClient,
      mutexService,
      eventBus: messageMediator,
      messageMediator
    });
    grpcApi = new GrpcAPI({
      databaseClient,
      host: '127.0.0.1',
      port: grpcPort,
      authService,
      passwordCryptoService,
      keyValueStorageClient,
      mutexService,
      eventBus: messageMediator,
      messageMediator
    });
    await wsApi.start();
    await grpcApi.start();

    wsClient = createSocketClient(`ws://127.0.0.1:${wsPort}`, {
      path: '/ws',
      transports: ['websocket'],
      forceNew: true
    });
    await new Promise<void>((resolve, reject) => {
      wsClient.on('connect', () => resolve());
      wsClient.on('connect_error', (error) => reject(error));
    });

    const protoFilePath = path.resolve(process.cwd(), 'src/interface/gRPC/proto/async-api.proto');
    const packageDefinition = protoLoader.loadSync(protoFilePath, {
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    const grpcObject = grpc.loadPackageDefinition(packageDefinition) as any;
    grpcClient = new grpcObject.realtime.AsyncApiGateway(
      `127.0.0.1:${grpcPort}`,
      grpc.credentials.createInsecure()
    );
  });

  afterAll(async () => {
    if (wsClient?.connected) wsClient.disconnect();
    await wsApi.stop();
    await grpcApi.stop();
  });

  it('websocket and grpc servers both accept requests and reply envelopes', async () => {
    expect.hasAssertions();
    const wsResponse = await emitWithAck(
      wsClient,
      { operationId: 'unknownOperation', metadata: { requestId: 'smoke-ws' } }
    );

    const grpcResponse = await grpcUnaryRequest(grpcClient, {
      operationId: 'unknownOperation',
      metadataJson: JSON.stringify({ requestId: 'smoke-grpc' })
    });

    expect(typeof wsResponse.ok).toBe('boolean');
    expect(wsResponse.operationId).toBe('unknownOperation');
    expect(grpcResponse.ok).toBe(false);
    expect(grpcResponse.operationId).toBe('unknownOperation');
  });
});
