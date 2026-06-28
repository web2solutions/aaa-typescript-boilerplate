/* eslint-disable jest/no-untyped-mock-factory */
import type { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';

const grpcAdapterStart = jest.fn().mockResolvedValue(undefined);
const grpcFallbackRestStart = jest.fn().mockResolvedValue(undefined);
const compileDatabaseClientMock = jest.fn<IDatabaseClient, []>().mockReturnValue({
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  stores: {} as IDatabaseClient['stores']
});

jest.mock('@src/interface/gRPC/gRPCAPI', () => ({
  GrpcAPI: jest.fn().mockImplementation(() => ({
    start: grpcAdapterStart
  }))
}));

jest.mock('@src/interface/HTTP/RestAPI', () => ({
  RestAPI: jest.fn().mockImplementation(() => ({
    start: grpcFallbackRestStart
  }))
}));

jest.mock('@src/interface/HTTP/adapters/express/ExpressServer', () => ({
  ExpressServer: { compile: jest.fn().mockReturnValue({}) }
}));

jest.mock('@src/interface/HTTP/adapters/express/handlers/infraHandlers', () => ({
  infraHandlers: []
}));

jest.mock('@src/interface/HTTP/ports', () => ({
  EHTTPFrameworks: { express: 'express' }
}));

jest.mock('@src/modules/Users', () => ({
  composeUsersAuthServices: jest.fn().mockReturnValue({ authService: {} })
}));

jest.mock('@src/infra/messages/compileMessageMediator', () => ({
  compileMessageMediator: jest.fn().mockReturnValue({})
}));

jest.mock('@src/infra/security/PasswordCryptoService', () => ({
  PasswordCryptoService: { compile: jest.fn().mockReturnValue({}) }
}));

jest.mock('@src/infra/jwt/JwtService', () => ({
  JwtService: { compile: jest.fn().mockReturnValue({}) }
}));

jest.mock('@src/infra/persistence/KeyValueStorage/InMemoryKeyValueStorageClient', () => ({
  InMemoryKeyValueStorageClient: { compile: jest.fn().mockReturnValue({}) }
}));

jest.mock('@src/infra/mutex/adapter/MutexService', () => ({
  MutexService: { compile: jest.fn().mockReturnValue({}) }
}));

jest.mock('@src/infra/persistence/compileDatabaseClient', () => ({
  compileDatabaseClient: () => compileDatabaseClientMock()
}));

describe('grpc adapter bootstrap', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    grpcAdapterStart.mockClear();
    grpcFallbackRestStart.mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('resolves fallback strategy from env', async () => {
    expect.assertions(3);
    const { shouldStartFallbackRestApi } = await import('@src/interface/gRPC/adapters/grpc/grpc');
    expect(shouldStartFallbackRestApi({ AAA_DISABLE_FALLBACK_REST: 'true' } as any)).toBe(false);
    expect(shouldStartFallbackRestApi({ AAA_DISABLE_FALLBACK_REST: 'false' } as any)).toBe(true);
    expect(shouldStartFallbackRestApi({} as any)).toBe(true);
  });

  it('starts only grpc api when fallback rest is disabled', async () => {
    expect.assertions(2);
    process.env.AAA_DISABLE_FALLBACK_REST = 'true';
    const { startGrpcAdapter } = await import('@src/interface/gRPC/adapters/grpc/grpc');
    await startGrpcAdapter();
    expect(grpcAdapterStart).toHaveBeenCalledTimes(1);
    expect(grpcFallbackRestStart).toHaveBeenCalledTimes(0);
  });

  it('starts grpc and fallback rest when fallback is enabled', async () => {
    expect.assertions(2);
    delete process.env.AAA_DISABLE_FALLBACK_REST;
    const { startGrpcAdapter } = await import('@src/interface/gRPC/adapters/grpc/grpc');
    await startGrpcAdapter();
    expect(grpcFallbackRestStart).toHaveBeenCalledTimes(1);
    expect(grpcAdapterStart).toHaveBeenCalledTimes(1);
  });
});
