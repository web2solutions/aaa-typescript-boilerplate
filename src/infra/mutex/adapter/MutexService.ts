import { IMutexService } from '@src/infra/mutex/port/IMutexService';
import { IServiceResponse } from '@src/modules/port/IServiceResponse';
import { ServiceResponse } from '@src/modules/port/ServiceResponse';
import { IKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/IKeyValueStorageClient';
import { _MUTEX_KEY_NAME_PREFIX_ } from '@src/config/constants';
import { BaseError } from '@src/infra/exceptions';

let mutexService: any;

export class MutexService implements IMutexService {
  private keyValueStorageClient: IKeyValueStorageClient;

  public prefix: string;

  private constructor(keyValueStorageClient: IKeyValueStorageClient) {
    if (!keyValueStorageClient) {
      throw new Error('MutexService depends on KeyValueStorageClient implementation');
    }
    this.keyValueStorageClient = keyValueStorageClient;
    this.prefix = `${_MUTEX_KEY_NAME_PREFIX_}:`;
  }

  public async lock(resourceName: string, uuid: string): Promise<IServiceResponse> {
    try {
      const previouslyLocked = await this.isLocked(resourceName, uuid);
      if (previouslyLocked.result) return { result: { previouslyLocked: previouslyLocked.result } };
      const { result, error } = await this.keyValueStorageClient.set(`${this.prefix}:${resourceName}:${uuid}`, 'locked');
      if (error) throw error;
      return new ServiceResponse({ result });
    } catch (error: unknown) {
      // console.log(error);
      return new ServiceResponse({ error: error as BaseError });
    }
  }

  public async isLocked(resourceName: string, uuid: string): Promise<IServiceResponse> {
    try {
      const { result, error } = await this.keyValueStorageClient.get(`${this.prefix}:${resourceName}:${uuid}`);
      if (error) throw error;
      return new ServiceResponse({ result: !!result });
    } catch (error: unknown) {
      // console.log(error);
      return new ServiceResponse({ error: error as BaseError });
    }
  }

  public async unlock(resourceName: string, uuid: string): Promise<IServiceResponse> {
    try {
      const { result, error } = await this.keyValueStorageClient.del(`${this.prefix}:${resourceName}:${uuid}`);
      if (error) throw error;
      return new ServiceResponse({ result });
    } catch (error: unknown) {
      // console.log(error);
      return new ServiceResponse({ error: error as BaseError });
    }
  }

  public static compile(keyValueStorageClient: IKeyValueStorageClient): MutexService {
    if (mutexService) return mutexService;
    mutexService = new MutexService(keyValueStorageClient);
    return mutexService;
  }
}
