import { IKeyValueStorageClient, IServiceResponse } from './contracts';
import { ServiceResponse } from './ServiceResponse';

const resolvePrefix = (): string => {
  const envPrefix = String(process.env.AAA_KV_KEY_PREFIX || '').trim();
  if (envPrefix) {
    return `${envPrefix}__`;
  }
  return 'aaa__';
};

export abstract class BaseKeyValueStorageClient implements IKeyValueStorageClient {
  public client: any;

  public prefix: string;

  public connected: boolean;

  public constructor() {
    this.prefix = resolvePrefix();
    this.connected = false;
  }

  public abstract get(keyName: string): Promise<IServiceResponse>;

  public abstract del(keyName: string): Promise<IServiceResponse>;

  public abstract set(keyName: string, value: any): Promise<IServiceResponse>;

  public async disconnect(): Promise<IServiceResponse> {
    this.connected = false;
    return new ServiceResponse({ result: { connected: this.connected } });
  }

  public async connect(): Promise<IServiceResponse> {
    this.connected = true;
    return new ServiceResponse({ result: { connected: this.connected } });
  }
}
