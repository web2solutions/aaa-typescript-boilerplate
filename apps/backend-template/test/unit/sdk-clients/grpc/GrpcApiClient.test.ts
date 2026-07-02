/* eslint-disable jest/no-untyped-mock-factory */
const loadSpecsMock = jest.fn();
const loadSyncMock = jest.fn();
const loadPackageDefinitionMock = jest.fn();
const createInsecureMock = jest.fn();
const requestMock = jest.fn();

jest.mock('../../../../../../packages/sdk-grpc-client/src/spec/loadSpecs', () => ({
  loadSpecs: () => loadSpecsMock()
}));

jest.mock('@grpc/proto-loader', () => ({
  __esModule: true,
  loadSync: (...args: any[]) => loadSyncMock(...args)
}));

jest.mock('@grpc/grpc-js', () => ({
  __esModule: true,
  loadPackageDefinition: (...args: any[]) => loadPackageDefinitionMock(...args),
  credentials: {
    createInsecure: (...args: any[]) => createInsecureMock(...args)
  },
  default: {
    loadPackageDefinition: (...args: any[]) => loadPackageDefinitionMock(...args),
    credentials: {
      createInsecure: (...args: any[]) => createInsecureMock(...args)
    }
  }
}));

describe('grpc api client sdk', () => {
  beforeEach(() => {
    loadSpecsMock.mockReset();
    loadSyncMock.mockReset();
    loadPackageDefinitionMock.mockReset();
    createInsecureMock.mockReset();
    requestMock.mockReset();
    loadSpecsMock.mockReturnValue({
      asyncApiGrpc: {
        servers: {
          local: {
            host: 'localhost:3999'
          }
        }
      }
    });
    loadPackageDefinitionMock.mockReturnValue({
      realtime: {
        AsyncApiGateway: jest.fn().mockImplementation(() => ({
          request: requestMock
        }))
      }
    });
    createInsecureMock.mockReturnValue('insecure');
  });

  it('builds grpc client from spec and returns parsed response', async () => {
    expect.hasAssertions();
    const { GrpcApiClient } = await import('../../../../../../packages/sdk-grpc-client/src/GrpcApiClient');
    requestMock.mockImplementation(
      (_payload: any, callback: (...args: any[]) => void) => callback(null, {
        ok: true,
        operationId: 'getAll',
        version: '1.0.0',
        resultJson: '{"items":[1,2]}'
      })
    );
    const client = new GrpcApiClient();
    const response = await client.request({ operationId: 'getAll' });
    expect(loadSyncMock).toHaveBeenCalledWith(expect.any(String), expect.any(Object));
    expect(response.ok).toBe(true);
    expect(response.result).toStrictEqual({ items: [1, 2] });
  });

  it('rejects when grpc returns transport/domain error', async () => {
    expect.hasAssertions();
    const { GrpcApiClient } = await import('../../../../../../packages/sdk-grpc-client/src/GrpcApiClient');
    requestMock.mockImplementation(
      (_payload: any, callback: (...args: any[]) => void) => callback(null, {
        ok: false,
        operationId: 'create',
        errorMessage: 'failed'
      })
    );
    const client = new GrpcApiClient('localhost:5000');
    await expect(client.request({ operationId: 'create' })).rejects.toThrow('failed');
  });

  it('rejects when grpc transport callback returns error', async () => {
    expect.hasAssertions();
    const { GrpcApiClient } = await import('../../../../../../packages/sdk-grpc-client/src/GrpcApiClient');
    requestMock.mockImplementation(
      (_payload: any, callback: (...args: any[]) => void) => callback(new Error('transport down'))
    );
    const client = new GrpcApiClient('localhost:5000');
    await expect(client.request({ operationId: 'create' })).rejects.toThrow('transport down');
  });

  it('supports module fallback when grpc/proto-loader default export is undefined', async () => {
    expect.hasAssertions();
    const grpcModule: any = await import('@grpc/grpc-js');
    const protoLoaderModule: any = await import('@grpc/proto-loader');
    const previousGrpcDefault = grpcModule.default;
    const previousProtoDefault = protoLoaderModule.default;
    grpcModule.default = undefined;
    protoLoaderModule.default = undefined;

    requestMock.mockImplementation(
      (_payload: any, callback: (...args: any[]) => void) => callback(null, {
        ok: true,
        operationId: 'getAll',
        resultJson: '{}'
      })
    );
    const { GrpcApiClient } = await import('../../../../../../packages/sdk-grpc-client/src/GrpcApiClient');
    const client = new GrpcApiClient('localhost:5000');
    const response = await client.request({ operationId: 'getAll' });

    expect(response.ok).toBe(true);
    expect(loadSyncMock).toHaveBeenCalledWith(expect.any(String), expect.any(Object));

    grpcModule.default = previousGrpcDefault;
    protoLoaderModule.default = previousProtoDefault;
  });
});
