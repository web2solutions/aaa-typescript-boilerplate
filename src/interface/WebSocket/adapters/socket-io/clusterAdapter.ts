import cluster from 'cluster';
import os from 'os';
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter';
import { Server } from 'socket.io';

export interface IClusterSocketIoAdapter {
  configure: (io: Server) => Promise<void>;
  cleanup: () => Promise<void>;
}

export const isClusterSocketIoEnabled = (
  env: NodeJS.ProcessEnv = process.env
): boolean => env.AAA_WEBSOCKET_SOCKETIO_ADAPTER === 'cluster';

export const resolveWebSocketClusterWorkers = (
  env: NodeJS.ProcessEnv = process.env
): number => {
  const parsed = Number(env.AAA_WEBSOCKET_CLUSTER_WORKERS || '');
  if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  return Math.max(1, os.cpus().length);
};

export const setupSocketIoClusterPrimary = (): void => {
  setupPrimary();
  cluster.setupPrimary({
    serialization: 'advanced'
  });
};

export const createClusterSocketIoAdapter = (): IClusterSocketIoAdapter => ({
  configure: async (io: Server): Promise<void> => {
    io.adapter(createAdapter());
  },
  cleanup: async (): Promise<void> => Promise.resolve()
});
