import { shouldStartRealtimeApi } from '@src/interface/runtime/RuntimeEnvironment';
import { startWebSocketAdapter } from '@src/interface/WebSocket/adapters/socket-io/socket-io';
import cluster from 'cluster';
import {
  isClusterSocketIoEnabled,
  resolveWebSocketClusterWorkers,
  setupSocketIoClusterPrimary
} from '@src/interface/WebSocket/adapters/socket-io/clusterAdapter';

export async function startWebSocketApiAdapter(
  env: NodeJS.ProcessEnv = process.env
): Promise<boolean> {
  if (!shouldStartRealtimeApi('websocket', env)) return false;
  if (isClusterSocketIoEnabled(env)) {
    if (cluster.isPrimary) {
      setupSocketIoClusterPrimary();
      const totalWorkers = resolveWebSocketClusterWorkers(env);
      for (let i = 0; i < totalWorkers; i += 1) {
        cluster.fork();
      }
      cluster.on('exit', () => {
        cluster.fork();
      });
      return true;
    }
  }
  await startWebSocketAdapter();
  return true;
}

// eslint-disable-next-line jest/require-hook
/* istanbul ignore if */
if (require.main === module) {
  startWebSocketApiAdapter();
}
