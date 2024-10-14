/* eslint-disable no-console */
import {
  RedisClientType,
  RedisFunctions,
  RedisScripts,
  RedisModules,
  createClient
} from 'redis';

import { _KV_KEY_NAME_PREFIX_ } from '@src/config/constants';
import { redisConfig } from '@src/config/redis';
import { IServiceResponse } from '@src/modules/port/IServiceResponse';
import { ServiceResponse } from '@src/modules/port/ServiceResponse';
import { BaseKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/BaseKeyValueStorageClient';
import { BaseError } from '@src/infra/exceptions';

let redisKeyValueStorageClient: any;

export class RedisKeyValueStorageClient extends BaseKeyValueStorageClient {
  public client: RedisClientType<RedisModules, RedisFunctions, RedisScripts>;

  public prefix: string;

  public connected: boolean;

  private constructor() {
    super();
    this.client = createClient(redisConfig);
    this.client.on('error', (err) => console.log('Redis Client Error', err));
    this.client.on('connect', () => {
      // console.log('Redis connected');
      this.connected = true;
    });
    this.client.on('end', () => {
      // console.log('Redis disconnected');
      this.connected = false;
    });
    this.client.on('ready', () => {
      // console.log('Redis ready');
    });

    this.prefix = `${_KV_KEY_NAME_PREFIX_}__`;
    this.connected = false;
  }

  public async get(keyName: string): Promise<IServiceResponse> {
    try {
      await this.connect();
      const result = await this.client.get(`${this.prefix}:${keyName}`);
      return { result };
    } catch (error: unknown) {
      // console.log(error);
      return new ServiceResponse({ error: error as BaseError });
    }
  }

  public async del(keyName: string): Promise<IServiceResponse> {
    try {
      await this.connect();
      const result = await this.client.del(`${this.prefix}:${keyName}`);
      return { result };
    } catch (error: unknown) {
      // console.log(error);
      return new ServiceResponse({ error: error as BaseError });
    }
  }

  public async set(keyName: string, value: any): Promise<IServiceResponse> {
    try {
      await this.connect();
      const result = await this.client.set(`${this.prefix}:${keyName}`, value);
      return { result };
    } catch (error: unknown) {
      // console.log(error);
      return new ServiceResponse({ error: error as BaseError });
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
      return new ServiceResponse({ error: error as BaseError });
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
      // console.log(error);
      return new ServiceResponse({ error: error as BaseError });
    }
  }

  public static compile(): RedisKeyValueStorageClient {
    if (redisKeyValueStorageClient) return redisKeyValueStorageClient;
    redisKeyValueStorageClient = new RedisKeyValueStorageClient();
    return redisKeyValueStorageClient;
  }
}
