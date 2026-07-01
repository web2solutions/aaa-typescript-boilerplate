import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-streams-adapter';
import { Server } from 'socket.io';

export interface IRedisStreamsSocketIoAdapter {
  configure: (io: Server) => Promise<void>;
  cleanup: () => Promise<void>;
}

export const isRedisStreamsSocketIoEnabled = (
  env: NodeJS.ProcessEnv = process.env
): boolean => env.AAA_WEBSOCKET_SOCKETIO_ADAPTER === 'redis-streams';

export const buildRedisConnectionUrl = (
  env: NodeJS.ProcessEnv = process.env
): string => {
  if (env.AAA_WEBSOCKET_REDIS_URL) return env.AAA_WEBSOCKET_REDIS_URL;
  if (env.AAA_REDIS_URL) return env.AAA_REDIS_URL;

  const host = env.AAA_REDIS_HOST || '127.0.0.1';
  const port = env.AAA_REDIS_PORT || '6379';
  const db = env.AAA_REDIS_DATABASE || '0';
  const password = env.AAA_REDIS_PASSWORD;
  const authPrefix = password ? `:${encodeURIComponent(password)}@` : '';

  return `redis://${authPrefix}${host}:${port}/${db}`;
};

export const createRedisStreamsSocketIoAdapter = (
  env: NodeJS.ProcessEnv = process.env
): IRedisStreamsSocketIoAdapter => {
  const client = createClient({
    url: buildRedisConnectionUrl(env)
  });

  return {
    configure: async (io: Server): Promise<void> => {
      if (!client.isOpen) {
        await client.connect();
      }
      io.adapter(createAdapter(client));
    },
    cleanup: async (): Promise<void> => {
      if (client.isOpen) {
        await client.quit();
      }
    }
  };
};
