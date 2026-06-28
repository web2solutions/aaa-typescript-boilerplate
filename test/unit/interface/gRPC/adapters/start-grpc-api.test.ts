/* eslint-disable jest/no-untyped-mock-factory */

const grpcLoaderAdapterStart = jest.fn().mockResolvedValue(undefined);

jest.mock('@src/interface/gRPC/adapters/grpc/grpc', () => ({
  startGrpcAdapter: grpcLoaderAdapterStart
}));

describe('start-grpc-api loader', () => {
  beforeEach(() => {
    grpcLoaderAdapterStart.mockClear();
  });

  it('starts grpc runtime when realtime protocol is grpc', async () => {
    expect.assertions(2);
    const { startGrpcApiAdapter } = await import('@src/interface/gRPC/adapters/start-grpc-api');
    const started = await startGrpcApiAdapter({
      AAA_REALTIME_API: 'yes',
      AAA_REALTIME_API_PROTOCOL: 'grpc'
    } as NodeJS.ProcessEnv);
    expect(started).toBe(true);
    expect(grpcLoaderAdapterStart).toHaveBeenCalledTimes(1);
  });

  it('does not start grpc runtime when realtime protocol is websocket', async () => {
    expect.assertions(2);
    const { startGrpcApiAdapter } = await import('@src/interface/gRPC/adapters/start-grpc-api');
    const started = await startGrpcApiAdapter({
      AAA_REALTIME_API: 'yes',
      AAA_REALTIME_API_PROTOCOL: 'websocket'
    } as NodeJS.ProcessEnv);
    expect(started).toBe(false);
    expect(grpcLoaderAdapterStart).toHaveBeenCalledTimes(0);
  });

  it('uses process env when env argument is omitted', async () => {
    expect.assertions(2);
    process.env.AAA_REALTIME_API = 'yes';
    process.env.AAA_REALTIME_API_PROTOCOL = 'grpc';
    const { startGrpcApiAdapter } = await import('@src/interface/gRPC/adapters/start-grpc-api');
    const started = await startGrpcApiAdapter();
    expect(started).toBe(true);
    expect(grpcLoaderAdapterStart).toHaveBeenCalledTimes(1);
  });
});
