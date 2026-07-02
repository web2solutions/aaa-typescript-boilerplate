export interface IServiceResponse<T = any> {
  result?: T;
  page?: number;
  size?: number;
  total?: number;
  error?: Error | Record<string, any>;
  message?: string;
}

export interface IKeyValueStorageClient {
  get(keyName: string): Promise<IServiceResponse>;
  del(keyName: string): Promise<IServiceResponse>;
  set(keyName: string, value: any): Promise<IServiceResponse>;
  disconnect(): Promise<IServiceResponse>;
  connect(): Promise<IServiceResponse>;
}

export interface IMutexService {
  lock(resourceName: string, uuid: string): Promise<IServiceResponse>;
  isLocked(resourceName: string, uuid: string): Promise<IServiceResponse>;
  unlock(resourceName: string, uuid: string): Promise<IServiceResponse>;
}
