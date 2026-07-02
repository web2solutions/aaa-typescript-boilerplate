import os from 'os';
import {
  isClusterSocketIoEnabled,
  resolveWebSocketClusterWorkers
} from '@src/interface/WebSocket/adapters/socket-io/clusterAdapter';

describe('clusterAdapter', () => {
  it('should enable cluster adapter when configured', () => {
    expect.hasAssertions();
    expect(isClusterSocketIoEnabled({
      AAA_WEBSOCKET_SOCKETIO_ADAPTER: 'cluster'
    } as NodeJS.ProcessEnv)).toBe(true);
  });

  it('should disable cluster adapter for other values', () => {
    expect.hasAssertions();
    expect(isClusterSocketIoEnabled({
      AAA_WEBSOCKET_SOCKETIO_ADAPTER: 'redis-streams'
    } as NodeJS.ProcessEnv)).toBe(false);
  });

  it('should resolve worker count from env', () => {
    expect.hasAssertions();
    expect(resolveWebSocketClusterWorkers({
      AAA_WEBSOCKET_CLUSTER_WORKERS: '8'
    } as NodeJS.ProcessEnv)).toBe(8);
  });

  it('should fallback to cpu count when env is missing/invalid', () => {
    expect.hasAssertions();
    const fallback = Math.max(1, os.cpus().length);
    expect(resolveWebSocketClusterWorkers({} as NodeJS.ProcessEnv)).toBe(fallback);
    expect(resolveWebSocketClusterWorkers({
      AAA_WEBSOCKET_CLUSTER_WORKERS: '0'
    } as NodeJS.ProcessEnv)).toBe(fallback);
  });
});
