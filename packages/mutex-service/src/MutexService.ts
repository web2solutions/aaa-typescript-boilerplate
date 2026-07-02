import { IKeyValueStorageClient, IMutexService, IServiceResponse } from './contracts';
import { ServiceResponse } from './ServiceResponse';

let mutexService: IMutexService | undefined;

export interface IMutexServiceOptions {
  prefix?: string;
}

export class MutexService implements IMutexService {
  private keyValueStorageClient: IKeyValueStorageClient;

  public prefix: string;

  private constructor(
    keyValueStorageClient: IKeyValueStorageClient,
    { prefix = 'mutex' }: IMutexServiceOptions = {}
  ) {
    if (!keyValueStorageClient) {
      throw new Error('MutexService depends on KeyValueStorageClient implementation');
    }
    this.keyValueStorageClient = keyValueStorageClient;
    this.prefix = `${prefix}:`;
  }

  public async lock(resourceName: string, uuid: string): Promise<IServiceResponse> {
    try {
      const previouslyLocked = await this.isLocked(resourceName, uuid);
      if (previouslyLocked.result) {
        return new ServiceResponse({ result: { previouslyLocked: true, locked: false } });
      }
      const { result, error } = await this.keyValueStorageClient.set(
        `${this.prefix}:${resourceName}:${uuid}`,
        'locked'
      );
      if (error) throw error;
      return new ServiceResponse({
        result: {
          previouslyLocked: false,
          locked: !!result
        }
      });
    } catch (error: unknown) {
      return new ServiceResponse({ error: error as Error });
    }
  }

  public async isLocked(resourceName: string, uuid: string): Promise<IServiceResponse> {
    try {
      const { result, error } = await this.keyValueStorageClient.get(
        `${this.prefix}:${resourceName}:${uuid}`
      );
      if (error) throw error;
      return new ServiceResponse({ result: !!result });
    } catch (error: unknown) {
      return new ServiceResponse({ error: error as Error });
    }
  }

  public async unlock(resourceName: string, uuid: string): Promise<IServiceResponse> {
    try {
      const { result, error } = await this.keyValueStorageClient.del(
        `${this.prefix}:${resourceName}:${uuid}`
      );
      if (error) throw error;
      return new ServiceResponse({ result });
    } catch (error: unknown) {
      return new ServiceResponse({ error: error as Error });
    }
  }

  public static compile(
    keyValueStorageClient: IKeyValueStorageClient,
    options: IMutexServiceOptions = {}
  ): MutexService {
    if (mutexService) return mutexService as MutexService;
    mutexService = new MutexService(keyValueStorageClient, options);
    return mutexService as MutexService;
  }

  public static reset(): void {
    mutexService = undefined;
  }
}
