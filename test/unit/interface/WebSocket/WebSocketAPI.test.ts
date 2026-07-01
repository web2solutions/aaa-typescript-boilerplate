/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jest/no-untyped-mock-factory */
/* eslint-disable jest/prefer-spy-on */

import { WebSocketAPI } from '@src/interface/WebSocket/WebSocketAPI';

const httpMockState: Record<string, any> = {};
const ioMockState: Record<string, any> = {};

jest.mock('http', () => ({
  __esModule: true,
  default: {
    createServer: (...args: any[]) => httpMockState.createServer(...args)
  }
}));

jest.mock('socket.io', () => ({
  Server: function MockedSocketIOServer(...args: any[]) {
    return ioMockState.Server(...args);
  }
}));

describe('websocket api', () => {
  const databaseClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined)
  } as any;
  const keyValueStorageClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined)
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    keyValueStorageClient.connect.mockClear();
    keyValueStorageClient.disconnect.mockClear();
    httpMockState.listen = jest.fn((
      port: number,
      host: string,
      callback: () => void
    ) => callback());
    httpMockState.closeServer = jest.fn((callback: () => void) => callback());
    httpMockState.createServer = jest.fn(() => ({
      listen: httpMockState.listen,
      close: httpMockState.closeServer
    }));

    ioMockState.on = jest.fn();
    ioMockState.close = jest.fn();
    ioMockState.Server = jest.fn(() => ({
      on: ioMockState.on,
      close: ioMockState.close
    }));
  });

  it('starts and stops websocket server', async () => {
    expect.hasAssertions();
    const api = new WebSocketAPI({
      databaseClient,
      specDir: './spec/asyncapi'
    });

    await api.start();
    await api.stop();

    expect(databaseClient.connect).toHaveBeenCalledWith();
    expect(databaseClient.disconnect).toHaveBeenCalledWith();
    expect(httpMockState.createServer).toHaveBeenCalledWith();
    expect(ioMockState.Server).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
    expect(ioMockState.close).toHaveBeenCalledWith();
  });

  it('binds generic and operation-specific socket listeners', async () => {
    expect.hasAssertions();
    const api = new WebSocketAPI({
      databaseClient,
      specDir: './spec/asyncapi'
    });

    jest.spyOn(api as any, 'listOperationIds').mockReturnValue(['login']);
    jest.spyOn(api as any, 'executeOperation').mockResolvedValue({
      ok: true,
      operationId: 'login',
      result: { token: 'abc' }
    });

    type TSocketHandler = (...args: any[]) => Promise<void>;
    const handlers = new Map<string, TSocketHandler>();
    const emit = jest.fn();
    const socket = {
      on: jest.fn((event: string, cb: (...args: any[]) => Promise<void>) => {
        handlers.set(event, cb);
      }),
      emit
    };

    (api as any).bindSocket(socket);

    const ack = jest.fn();
    const requestHandler = handlers.get('api:request');
    const operationRequestHandler = handlers.get('api:login:request');
    expect(requestHandler).toBeDefined();
    expect(operationRequestHandler).toBeDefined();
    await requestHandler!({
      operationId: 'login',
      input: { username: 'john' }
    }, ack);

    await operationRequestHandler!({
      input: { username: 'john' }
    }, ack);

    expect(emit).toHaveBeenCalledWith('api:response', expect.any(Object));
    expect(emit).toHaveBeenCalledWith('api:login:response', expect.any(Object));
    expect(ack).toHaveBeenCalledWith(expect.any(Object));
  });

  it('handles start/stop idempotency and key-value lifecycle hooks', async () => {
    expect.hasAssertions();
    const api = new WebSocketAPI({
      databaseClient,
      keyValueStorageClient,
      specDir: './spec/asyncapi',
      host: '127.0.0.1',
      port: 3010,
      path: '/socket'
    });

    await api.start();
    await api.start();
    await api.stop();
    await api.stop();

    expect(keyValueStorageClient.connect).toHaveBeenCalledTimes(1);
    expect(keyValueStorageClient.disconnect).toHaveBeenCalledTimes(1);
    expect(httpMockState.listen).toHaveBeenCalledWith(3010, '127.0.0.1', expect.any(Function));
    const bindSocketSpy = jest.spyOn(api as any, 'bindSocket').mockImplementation(() => undefined);
    const onConnectionCall = ioMockState.on.mock.calls.find((call: any[]) => call[0] === 'connection');
    expect(onConnectionCall).toBeDefined();
    const socket = { on: jest.fn(), emit: jest.fn() };
    onConnectionCall[1](socket);
    expect(bindSocketSpy).toHaveBeenCalledWith(socket);
  });

  it('runs optional socket.io configure/cleanup hooks', async () => {
    expect.hasAssertions();
    const configureSocketIo = jest.fn().mockResolvedValue(undefined);
    const cleanupSocketIo = jest.fn().mockResolvedValue(undefined);
    const api = new WebSocketAPI({
      databaseClient,
      specDir: './spec/asyncapi',
      configureSocketIo,
      cleanupSocketIo
    });

    await api.start();
    await api.stop();

    expect(configureSocketIo).toHaveBeenCalledTimes(1);
    expect(cleanupSocketIo).toHaveBeenCalledTimes(1);
  });
});
