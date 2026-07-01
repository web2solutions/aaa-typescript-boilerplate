/* eslint-disable no-console */
/* istanbul ignore file */
import {
  createClient
} from 'redis';

import { IServiceResponse } from './contracts';
import { ServiceResponse } from './ServiceResponse';
import { BaseKeyValueStorageClient } from './BaseKeyValueStorageClient';

let redisKeyValueStorageClient: BaseKeyValueStorageClient | undefined;

const resolveRedisConfig = (): Record<string, any> => {
  const socketPort = Number(process.env.AAA_REDIS_PORT || 6379);
  return {
    socket: {
      host: process.env.AAA_REDIS_HOST || '127.0.0.1',
      port: Number.isFinite(socketPort) ? socketPort : 6379
    },
    username: process.env.AAA_REDIS_USERNAME || undefined,
    password: process.env.AAA_REDIS_PASSWORD || undefined,
    database: Number(process.env.AAA_REDIS_DB || 0)
  };
};

export class RedisKeyValueStorageClient extends BaseKeyValueStorageClient {
  public client: ReturnType<typeof createClient>;

  public connected: boolean;

  private constructor() {
    super();
    this.client = createClient(resolveRedisConfig() as any);
    this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.on('connect', () => {
      this.connected = true;
    });
    this.client.on('end', () => {
      this.connected = false;
    });
    this.connected = false;
  }

  public async get(keyName: string): Promise<IServiceResponse> {
    try {
      await this.connect();
      const result = await this.client.get(`${this.prefix}:${keyName}`);
      return { result };
    } catch (error: unknown) {
      return new ServiceResponse({ error: error as Error });
    }
  }

  public async del(keyName: string): Promise<IServiceResponse> {
    try {
      await this.connect();
      const result = await this.client.del(`${this.prefix}:${keyName}`);
      return { result };
    } catch (error: unknown) {
      return new ServiceResponse({ error: error as Error });
    }
  }

  public async set(keyName: string, value: any): Promise<IServiceResponse> {
    try {
      await this.connect();
      const result = await this.client.set(`${this.prefix}:${keyName}`, value);
      return { result };
    } catch (error: unknown) {
      return new ServiceResponse({ error: error as Error });
    }
  }

  public async disconnect(): Promise<IServiceResponse> {
    try {
      await this.client.quit();
      this.connected = false;
      return {
        result: {
          connected: this.connected
        }
      };
    } catch (error: unknown) {
      return new ServiceResponse({ error: error as Error });
    }
  }

  public async connect(): Promise<IServiceResponse> {
    try {
      if (!this.connected) {
        await this.client.connect();
        this.connected = true;
      }
      return {
        result: {
          connected: this.connected
        }
      };
    } catch (error: unknown) {
      return new ServiceResponse({ error: error as Error });
    }
  }

  public static compile(): RedisKeyValueStorageClient {
    if (redisKeyValueStorageClient) {
      return redisKeyValueStorageClient as RedisKeyValueStorageClient;
    }
    redisKeyValueStorageClient = new RedisKeyValueStorageClient();
    return redisKeyValueStorageClient as RedisKeyValueStorageClient;
  }
}
