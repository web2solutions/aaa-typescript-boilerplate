/* eslint-disable jest/no-untyped-mock-factory */

const websocketLoaderAdapterStart = jest.fn().mockResolvedValue(undefined);

jest.mock('@src/interface/WebSocket/adapters/socket-io/socket-io', () => ({
  startWebSocketAdapter: websocketLoaderAdapterStart
}));

describe('start-websocket-api loader', () => {
  beforeEach(() => {
    websocketLoaderAdapterStart.mockClear();
  });

  it('starts websocket runtime when realtime protocol is websocket', async () => {
    expect.assertions(2);
    const { startWebSocketApiAdapter } = await import('@src/interface/WebSocket/adapters/start-websocket-api');
    const started = await startWebSocketApiAdapter({
      AAA_REALTIME_API: 'yes',
      AAA_REALTIME_API_PROTOCOL: 'websocket'
    } as NodeJS.ProcessEnv);
    expect(started).toBe(true);
    expect(websocketLoaderAdapterStart).toHaveBeenCalledTimes(1);
  });

  it('does not start websocket runtime when realtime protocol is grpc', async () => {
    expect.assertions(2);
    const { startWebSocketApiAdapter } = await import('@src/interface/WebSocket/adapters/start-websocket-api');
    const started = await startWebSocketApiAdapter({
      AAA_REALTIME_API: 'yes',
      AAA_REALTIME_API_PROTOCOL: 'grpc'
    } as NodeJS.ProcessEnv);
    expect(started).toBe(false);
    expect(websocketLoaderAdapterStart).toHaveBeenCalledTimes(0);
  });

  it('uses process env when env argument is omitted', async () => {
    expect.assertions(2);
    process.env.AAA_REALTIME_API = 'yes';
    process.env.AAA_REALTIME_API_PROTOCOL = 'websocket';
    const { startWebSocketApiAdapter } = await import('@src/interface/WebSocket/adapters/start-websocket-api');
    const started = await startWebSocketApiAdapter();
    expect(started).toBe(true);
    expect(websocketLoaderAdapterStart).toHaveBeenCalledTimes(1);
  });
});
