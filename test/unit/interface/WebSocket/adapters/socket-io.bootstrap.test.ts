/* eslint-disable jest/no-untyped-mock-factory */
import type { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';

const websocketAdapterStart = jest.fn().mockResolvedValue(undefined);
const websocketFallbackRestStart = jest.fn().mockResolvedValue(undefined);
const compileDatabaseClientMock = jest.fn<IDatabaseClient, []>().mockReturnValue({
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  stores: {} as IDatabaseClient['stores']
});

jest.mock('@src/interface/WebSocket/WebSocketAPI', () => ({
  WebSocketAPI: jest.fn().mockImplementation(() => ({
    start: websocketAdapterStart
  }))
}));

jest.mock('@src/interface/HTTP/RestAPI', () => ({
  RestAPI: jest.fn().mockImplementation(() => ({
    start: websocketFallbackRestStart
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

jest.mock('@src/infra/persistence/KeyValueStorage/compileKeyValueStorageClient', () => ({
  compileKeyValueStorageClient: jest.fn().mockReturnValue({})
}));

jest.mock('@src/infra/mutex/adapter/MutexService', () => ({
  MutexService: { compile: jest.fn().mockReturnValue({}) }
}));

jest.mock('@src/infra/persistence/compileDatabaseClient', () => ({
  compileDatabaseClient: () => compileDatabaseClientMock()
}));

describe('websocket socket-io adapter bootstrap', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    websocketAdapterStart.mockClear();
    websocketFallbackRestStart.mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('resolves fallback strategy from env', async () => {
    expect.assertions(3);
    const { shouldStartFallbackRestApi } = await import('@src/interface/WebSocket/adapters/socket-io/socket-io');
    expect(shouldStartFallbackRestApi({ AAA_DISABLE_FALLBACK_REST: 'true' } as any)).toBe(false);
    expect(shouldStartFallbackRestApi({ AAA_DISABLE_FALLBACK_REST: 'false' } as any)).toBe(true);
    expect(shouldStartFallbackRestApi({} as any)).toBe(true);
  });

  it('starts only websocket api when fallback rest is disabled', async () => {
    expect.assertions(2);
    process.env.AAA_DISABLE_FALLBACK_REST = 'true';
    const { startWebSocketAdapter } = await import('@src/interface/WebSocket/adapters/socket-io/socket-io');
    await startWebSocketAdapter();
    expect(websocketAdapterStart).toHaveBeenCalledTimes(1);
    expect(websocketFallbackRestStart).toHaveBeenCalledTimes(0);
  });

  it('starts websocket and fallback rest when fallback is enabled', async () => {
    expect.assertions(2);
    delete process.env.AAA_DISABLE_FALLBACK_REST;
    const { startWebSocketAdapter } = await import('@src/interface/WebSocket/adapters/socket-io/socket-io');
    await startWebSocketAdapter();
    expect(websocketFallbackRestStart).toHaveBeenCalledTimes(1);
    expect(websocketAdapterStart).toHaveBeenCalledTimes(1);
  });
});
