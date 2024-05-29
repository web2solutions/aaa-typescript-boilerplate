import {
  RedisClientType,
  RedisFunctions,
  RedisScripts,
  RedisModules,
  createClient
} from 'redis';

import { redisConfig } from '@src/infra/config/redis';
import { IMutexClient } from '@src/infra/mutex/port/IMutexClient';
import { IServiceResponse } from '@src/infra/service/port/IServiceResponse';
import { ServiceResponse } from '@src/infra/service/adapter/ServiceResponse';

class MutexService implements IMutexClient {
  private client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

  private prefix: string;

  private connected: boolean;

  constructor() {
    this.client = createClient(redisConfig);
    // this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.on('connect', () => {
      // console.log('Redis connected');
      this.connected = true;
    });
    this.client.on('end', () => {
      // console.log('Redis disconnected');
      this.connected = false;
    });
    // this.client.on('ready', () => console.log('Redis ready'));

    this.prefix = 'mutex__';
    this.connected = false;
  }

  public async lock(resourceName: string, uuid: string): Promise<IServiceResponse> {
    try {
      const wasAlreadyLocked = await this.isLocked(resourceName, uuid);
      if (wasAlreadyLocked.result) return { result: { wasAlreadyLocked: wasAlreadyLocked.result } };
      await this.connect();
      await this.client.set(`${this.prefix}:${resourceName}:${uuid}`, 'locked');
      return new ServiceResponse({ result: { locked: true } });
    } catch (error: unknown) {
      // console.log(error);
      return new ServiceResponse({ error: error as Error });
    }
  }

  public async isLocked(resourceName: string, uuid: string): Promise<IServiceResponse> {
    try {
      await this.connect();
      const value = await this.client.get(`${this.prefix}:${resourceName}:${uuid}`);
      return { result: !!value };
    } catch (error: unknown) {
      // console.log(error);
      return new ServiceResponse({ error: error as Error });
    }
  }

  public async unlock(resourceName: string, uuid: string): Promise<IServiceResponse> {
    try {
      await this.connect();
      const value = await this.client.del(`${this.prefix}:${resourceName}:${uuid}`);
      return { result: value };
    } catch (error: unknown) {
      // console.log(error);
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
      // console.log(error);
      return new ServiceResponse({ error: error as Error });
    }
  }

  public async connect(): Promise<IServiceResponse> {
    try {
      if (!this.connected) {
        await this.client.connect();
      }
      return {
        result: {
          connected: this.connected
        }
      };
    } catch (error: unknown) {
      // console.log(error);
      return new ServiceResponse({ error: error as Error });
    }
  }
}

export const mutexService = new MutexService();
