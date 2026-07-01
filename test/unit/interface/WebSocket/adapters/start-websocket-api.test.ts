/* eslint-disable jest/no-untyped-mock-factory */

const websocketLoaderAdapterStart = jest.fn().mockResolvedValue(undefined);
const clusterForkMock = jest.fn();
const clusterOnMock = jest.fn();
const isClusterSocketIoEnabledMock = jest.fn().mockReturnValue(false);
const resolveWebSocketClusterWorkersMock = jest.fn().mockReturnValue(2);
const setupSocketIoClusterPrimaryMock = jest.fn();

jest.mock('@src/interface/WebSocket/adapters/socket-io/socket-io', () => ({
  startWebSocketAdapter: websocketLoaderAdapterStart
}));

jest.mock('cluster', () => ({
  __esModule: true,
  default: {
    isPrimary: true,
    fork: (...args: any[]) => clusterForkMock(...args),
    on: (...args: any[]) => clusterOnMock(...args),
    setupPrimary: jest.fn()
  }
}));

jest.mock('@src/interface/WebSocket/adapters/socket-io/clusterAdapter', () => ({
  isClusterSocketIoEnabled: (...args: any[]) => isClusterSocketIoEnabledMock(...args),
  resolveWebSocketClusterWorkers: (...args: any[]) => resolveWebSocketClusterWorkersMock(...args),
  setupSocketIoClusterPrimary: (...args: any[]) => setupSocketIoClusterPrimaryMock(...args)
}));

describe('start-websocket-api loader', () => {
  beforeEach(() => {
    websocketLoaderAdapterStart.mockClear();
    clusterForkMock.mockClear();
    clusterOnMock.mockClear();
    isClusterSocketIoEnabledMock.mockReset();
    isClusterSocketIoEnabledMock.mockReturnValue(false);
    resolveWebSocketClusterWorkersMock.mockClear();
    setupSocketIoClusterPrimaryMock.mockClear();
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

  it('starts in cluster primary mode and forks workers', async () => {
    expect.assertions(5);
    const clusterModule = await import('cluster');
    (clusterModule.default as any).isPrimary = true;
    isClusterSocketIoEnabledMock.mockReturnValue(true);
    resolveWebSocketClusterWorkersMock.mockReturnValue(3);

    const { startWebSocketApiAdapter } = await import('@src/interface/WebSocket/adapters/start-websocket-api');
    const started = await startWebSocketApiAdapter({
      AAA_REALTIME_API: 'yes',
      AAA_REALTIME_API_PROTOCOL: 'websocket',
      AAA_WEBSOCKET_SOCKETIO_ADAPTER: 'cluster'
    } as NodeJS.ProcessEnv);

    expect(started).toBe(true);
    expect(setupSocketIoClusterPrimaryMock).toHaveBeenCalledTimes(1);
    expect(clusterForkMock).toHaveBeenCalledTimes(3);
    expect(clusterOnMock).toHaveBeenCalledWith('exit', expect.any(Function));
    expect(websocketLoaderAdapterStart).toHaveBeenCalledTimes(0);
  });

  it('starts websocket adapter in cluster worker mode', async () => {
    expect.assertions(2);
    const clusterModule = await import('cluster');
    (clusterModule.default as any).isPrimary = false;
    isClusterSocketIoEnabledMock.mockReturnValue(true);

    const { startWebSocketApiAdapter } = await import('@src/interface/WebSocket/adapters/start-websocket-api');
    const started = await startWebSocketApiAdapter({
      AAA_REALTIME_API: 'yes',
      AAA_REALTIME_API_PROTOCOL: 'websocket',
      AAA_WEBSOCKET_SOCKETIO_ADAPTER: 'cluster'
    } as NodeJS.ProcessEnv);

    expect(started).toBe(true);
    expect(websocketLoaderAdapterStart).toHaveBeenCalledTimes(1);
  });
});
