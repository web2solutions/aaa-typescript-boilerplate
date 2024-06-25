import { _KV_KEY_NAME_PREFIX_ } from '@src/infra/config/constants';
import { IServiceResponse } from '@src/infra/service/port/IServiceResponse';
import { ServiceResponse } from '@src/infra/service/adapter/ServiceResponse';
import { IKeyValueStorageClient } from './IKeyValueStorageClient';

export abstract class BaseKeyValueStorageClient implements IKeyValueStorageClient {
  public client: any;

  public prefix: string;

  public connected: boolean;

  constructor() {
    this.prefix = `${_KV_KEY_NAME_PREFIX_}__`;
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

  // public abstract compile(): BaseKeyValueStorageClient;
}
