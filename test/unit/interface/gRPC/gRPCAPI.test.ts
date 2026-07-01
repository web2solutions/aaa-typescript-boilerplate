/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jest/no-untyped-mock-factory */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable jest/max-expects */
/* eslint-disable jest/prefer-spy-on */

import { GrpcAPI } from '@src/interface/gRPC/gRPCAPI';

const grpcMockState: Record<string, any> = {};
const protoMockState: Record<string, any> = {};

jest.mock('@grpc/grpc-js', () => ({
  __esModule: true,
  Server: function MockedGrpcServer(...args: any[]) {
    return grpcMockState.Server(...args);
  },
  loadPackageDefinition: (...args: any[]) => grpcMockState.loadPackageDefinition(...args),
  ServerCredentials: {
    createInsecure: (...args: any[]) => grpcMockState.createInsecure(...args)
  },
  default: {
    Server: function MockedGrpcServer(...args: any[]) {
      return grpcMockState.Server(...args);
    },
    loadPackageDefinition: (...args: any[]) => grpcMockState.loadPackageDefinition(...args),
    ServerCredentials: {
      createInsecure: (...args: any[]) => grpcMockState.createInsecure(...args)
    }
  }
}));

jest.mock('@grpc/proto-loader', () => ({
  __esModule: true,
  loadSync: (...args: any[]) => protoMockState.loadSync(...args),
  default: {
    loadSync: (...args: any[]) => protoMockState.loadSync(...args)
  }
}));

describe('grpc api', () => {
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
    grpcMockState.addService = jest.fn();
    grpcMockState.bindAsync = jest.fn((
      address: string,
      credentials: unknown,
      callback: Function
    ) => callback());
    grpcMockState.start = jest.fn();
    grpcMockState.tryShutdown = jest.fn((callback: Function) => callback());
    grpcMockState.Server = jest.fn(() => ({
      addService: grpcMockState.addService,
      bindAsync: grpcMockState.bindAsync,
      start: grpcMockState.start,
      tryShutdown: grpcMockState.tryShutdown
    }));
    grpcMockState.loadPackageDefinition = jest.fn(() => ({
      realtime: {
        AsyncApiGateway: {
          service: {}
        }
      }
    }));
    grpcMockState.createInsecure = jest.fn();
    protoMockState.loadSync = jest.fn();
  });

  it('starts and stops grpc server lifecycle', async () => {
    expect.hasAssertions();
    const api = new GrpcAPI({
      databaseClient,
      specDir: './spec/asyncapi'
    });

    await api.start();
    await api.stop();

    expect(protoMockState.loadSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object)
    );
    expect(grpcMockState.addService).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
    expect(grpcMockState.bindAsync).toHaveBeenCalledWith(
      expect.stringContaining('0.0.0.0'),
      undefined,
      expect.any(Function)
    );
    expect(grpcMockState.start).toHaveBeenCalledWith();
    expect(grpcMockState.tryShutdown).toHaveBeenCalledWith(expect.any(Function));
    expect(databaseClient.connect).toHaveBeenCalledWith();
    expect(databaseClient.disconnect).toHaveBeenCalledWith();
  });

  it('handles unary and stream grpc operations', async () => {
    expect.hasAssertions();
    const api = new GrpcAPI({
      databaseClient,
      specDir: './spec/asyncapi'
    });
    jest.spyOn(api as any, 'executeOperation').mockResolvedValue({
      ok: true,
      operationId: 'login',
      result: { token: 'abc' }
    });

    await api.start();
    const serviceImpl = grpcMockState.addService.mock.calls[0][1];

    const callback = jest.fn();
    await serviceImpl.request(
      {
        request: {
          operationId: 'login',
          inputJson: '{"username":"john"}'
        }
      },
      callback
    );

    const streamHandlers = new Map<string, Function>();
    const write = jest.fn();
    const end = jest.fn();
    serviceImpl.exchange({
      on: jest.fn((event: string, handler: Function) => {
        streamHandlers.set(event, handler);
      }),
      write,
      end
    });
    await streamHandlers.get('data')!({
      operationId: 'login',
      inputJson: '{"username":"john"}'
    });
    streamHandlers.get('end')!();

    expect(callback).toHaveBeenCalledWith(null, expect.objectContaining({
      ok: true,
      operationId: 'login'
    }));
    expect(write).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      operationId: 'login'
    }));
    expect(end).toHaveBeenCalledWith();
  });

  it('is idempotent on start/stop and parses invalid json safely', async () => {
    expect.hasAssertions();
    const api = new GrpcAPI({
      databaseClient,
      keyValueStorageClient,
      specDir: './spec/asyncapi'
    });
    const executeOperation = jest
      .spyOn(api as any, 'executeOperation')
      .mockResolvedValue({
        ok: true,
        operationId: 'login',
        result: { token: 'abc' }
      });

    await api.start();
    await api.start();

    const serviceImpl = grpcMockState.addService.mock.calls[0][1];
    const callback = jest.fn();
    await serviceImpl.request(
      {
        request: {
          operationId: 'login',
          inputJson: '{invalid-json'
        }
      },
      callback
    );

    expect(executeOperation).toHaveBeenCalledWith(expect.objectContaining({
      input: {}
    }));

    await api.stop();
    await api.stop();

    expect(keyValueStorageClient.connect).toHaveBeenCalledTimes(1);
    expect(keyValueStorageClient.disconnect).toHaveBeenCalledTimes(1);
  });

  it('rejects startup when grpc bindAsync returns an error', async () => {
    expect.hasAssertions();
    grpcMockState.bindAsync = jest.fn((
      address: string,
      credentials: unknown,
      callback: Function
    ) => callback(new Error('bind failed')));
    grpcMockState.Server = jest.fn(() => ({
      addService: grpcMockState.addService,
      bindAsync: grpcMockState.bindAsync,
      start: grpcMockState.start,
      tryShutdown: grpcMockState.tryShutdown
    }));

    const api = new GrpcAPI({
      databaseClient,
      specDir: './spec/asyncapi'
    });
    await expect(api.start()).rejects.toThrow('bind failed');
  });

  it('supports module fallback when grpc/proto-loader default export is undefined', async () => {
    expect.hasAssertions();
    const grpcModule: any = await import('@grpc/grpc-js');
    const protoLoaderModule: any = await import('@grpc/proto-loader');
    const previousGrpcDefault = grpcModule.default;
    const previousProtoDefault = protoLoaderModule.default;
    grpcModule.default = undefined;
    protoLoaderModule.default = undefined;

    const api = new GrpcAPI({
      databaseClient,
      specDir: './spec/asyncapi'
    });

    await api.start();
    await api.stop();

    expect(protoMockState.loadSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object)
    );
    expect(grpcMockState.start).toHaveBeenCalledWith();

    grpcModule.default = previousGrpcDefault;
    protoLoaderModule.default = previousProtoDefault;
  });
});
