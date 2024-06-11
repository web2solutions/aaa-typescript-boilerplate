import {
  RedisClientType,
  RedisFunctions,
  RedisScripts,
  RedisModules,
  createClient
} from 'redis';

import { _KV_KEY_NAME_PREFIX_ } from '@src/infra/config/constants';
import { redisConfig } from '@src/infra/config/redis';
import { IServiceResponse } from '@src/infra/service/port/IServiceResponse';
import { ServiceResponse } from '@src/infra/service/adapter/ServiceResponse';
import { IKeyValueStorageClient } from './IKeyValueStorageClient';

export class RedisKeyValueStorageClient implements IKeyValueStorageClient {
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

    this.prefix = `${_KV_KEY_NAME_PREFIX_}__`;
    this.connected = false;
  }

  public async get(keyName: string): Promise<IServiceResponse> {
    try {
      await this.connect();
      const value = await this.client.get(`${this.prefix}:${keyName}`);
      return { result: !!value };
    } catch (error: unknown) {
      // console.log(error);
      return new ServiceResponse({ error: error as Error });
    }
  }

  public async set(keyName: string, value: any): Promise<IServiceResponse> {
    try {
      await this.connect();
      const result = await this.client.set(`${this.prefix}:${keyName}`, value);
      return { result: !!result };
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
