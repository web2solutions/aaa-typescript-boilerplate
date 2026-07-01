import { IServiceResponse } from './contracts';
import { ServiceResponse } from './ServiceResponse';
import { BaseKeyValueStorageClient } from './BaseKeyValueStorageClient';

let inMemoryKeyValueStorageClient: BaseKeyValueStorageClient | undefined;

export class InMemoryKeyValueStorageClient extends BaseKeyValueStorageClient {
  public client: Map<string, any>;

  private constructor() {
    super();
    this.client = new Map();
  }

  public async get(keyName: string): Promise<IServiceResponse> {
    try {
      const result = await Promise.resolve(this.client.get(`${this.prefix}:${keyName}`));
      return { result };
    } catch (error: unknown) {
      return new ServiceResponse({ error: error as Error });
    }
  }

  public async del(keyName: string): Promise<IServiceResponse> {
    try {
      const result = await Promise.resolve(this.client.delete(`${this.prefix}:${keyName}`));
      return { result };
    } catch (error: unknown) {
      return new ServiceResponse({ error: error as Error });
    }
  }

  public async set(keyName: string, value: any): Promise<IServiceResponse> {
    try {
      const result = await Promise.resolve(this.client.set(`${this.prefix}:${keyName}`, value));
      return { result };
    } catch (error: unknown) {
      return new ServiceResponse({ error: error as Error });
    }
  }

  public async disconnect(): Promise<IServiceResponse> {
    this.connected = false;
    return new ServiceResponse({ result: { connected: this.connected } });
  }

  public async connect(): Promise<IServiceResponse> {
    this.connected = true;
    return new ServiceResponse({ result: { connected: this.connected } });
  }

  public static compile(): InMemoryKeyValueStorageClient {
    if (inMemoryKeyValueStorageClient) {
      return inMemoryKeyValueStorageClient as InMemoryKeyValueStorageClient;
    }
    inMemoryKeyValueStorageClient = new InMemoryKeyValueStorageClient();
    return inMemoryKeyValueStorageClient as InMemoryKeyValueStorageClient;
  }
}
